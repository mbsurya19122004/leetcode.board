
import { serverClient } from '@/lib/supabase'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import Avatar from '../avatar'
import Nav from '../nav'

type SP = {
  year?: string
  section?: string
  sort?: string
}

const orderOptions = {
  ascending: false,
  nullsFirst: false,
}

export default async function Leaderboard({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const { year, section, sort = 'solved' } = await searchParams

  const sb = await serverClient()
  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user) redirect('/login')

  const sortByRating = sort === 'rating'

  // Main leaderboard query
  let leaderboardQuery = sb
    .from('profiles')
    .select(
      'id, username, year, section, total_solved, easy, medium, hard, rating, avatar_url'
    )
    .eq('verified', true)

  if (year) {
    leaderboardQuery = leaderboardQuery.eq('year', Number(year))
  }

  if (section) {
    leaderboardQuery = leaderboardQuery.eq('section', section)
  }

  if (sortByRating) {
    leaderboardQuery = leaderboardQuery
      .order('rating', orderOptions)
      .order('total_solved', orderOptions)
  } else {
    leaderboardQuery = leaderboardQuery
      .order('total_solved', orderOptions)
      .order('rating', orderOptions)
  }

  // Query all matching IDs and ranking metrics for rank calculation.
  // Note: Supabase's configured row limit may cap this result.
  let rankQuery = sb
    .from('profiles')
    .select('id, total_solved, rating')
    .eq('verified', true)

  if (year) {
    rankQuery = rankQuery.eq('year', Number(year))
  }

  if (section) {
    rankQuery = rankQuery.eq('section', section)
  }

  if (sortByRating) {
    rankQuery = rankQuery
      .order('rating', orderOptions)
      .order('total_solved', orderOptions)
  } else {
    rankQuery = rankQuery
      .order('total_solved', orderOptions)
      .order('rating', orderOptions)
  }

  // Fetch the current user's profile independently of the top 500.
  const [leaderboardResult, sectionsResult, rankResult, profileResult] =
    await Promise.all([
      leaderboardQuery.limit(500),
      sb.from('profiles').select('section'),
      rankQuery,
      sb
        .from('profiles')
        .select(
          'id, username, year, section, total_solved, easy, medium, hard, rating, avatar_url, verified'
        )
        .eq('id', user.id)
        .maybeSingle(),
    ])

  const { data: rows, error: leaderboardError } = leaderboardResult
  const { data: all } = sectionsResult
  const { data: rankedRows, error: rankError } = rankResult
  const { data: myProfile } = profileResult

  if (leaderboardError) {
    throw new Error('Failed to load the leaderboard.')
  }

  if (rankError) {
    throw new Error('Failed to calculate leaderboard rankings.')
  }

  const sections = [
    ...new Set(
      (all ?? [])
        .map((r) => r.section)
        .filter((s): s is string => typeof s === 'string' && s.length > 0)
    ),
  ].sort()

  // Rank within the current year/section filter and sorting mode.
  const rankIndex = (rankedRows ?? []).findIndex(
    (r) => r.id === user.id
  )

  const rank =
    myProfile?.verified && rankIndex !== -1
      ? rankIndex + 1
      : null

  const href = (patch: Partial<SP>) => {
    const params = new URLSearchParams()

    Object.entries({ year, section, sort, ...patch }).forEach(
      ([key, value]) => {
        if (value) params.set(key, value)
      }
    )

    const query = params.toString()
    return query ? `/leaderboard?${query}` : '/leaderboard'
  }

  function Pill({
    on,
    to,
    children,
  }: {
    on: boolean
    to: string
    children: ReactNode
  }) {
    return (
      <Link href={to} className={on ? 'pill on' : 'pill'}>
        {children}
      </Link>
    )
  }

  return (
    <main className="wrap">
      <Nav active="board" />

      <p className="eyebrow">leaderboard</p>
      <h1>Rankings</h1>

      {/* Your highlighted ranking card */}
      {myProfile?.verified && rank !== null ? (
        <section className="my-rank">
          <div className="my-rank-top">
            <div>
              <p className="eyebrow">YOUR POSITION</p>

              <h2>
                <span>#{rank}</span>
           
              </h2>

              <p className="my-rank-caption">
                Keep solving problems to climb the rankings.
              </p>
            </div>

            <div className="rank-badge">YOUR RANK</div>
          </div>

          <div className="my-rank-stats">
            <div>
              <span>Problems solved</span>
              <strong>{myProfile.total_solved ?? 0}</strong>
            </div>

            <div>
              <span>Contest rating</span>
              <strong>{myProfile.rating ?? '—'}</strong>
            </div>

            <div>
              <span>Year / Section</span>
              <strong>
                Y{myProfile.year} · {myProfile.section ?? '—'}
              </strong>
            </div>
          </div>
        </section>
      ) : (
        <section className="my-rank">
          <p className="eyebrow">YOUR POSITION</p>
          <h2>Not ranked in this view</h2>
          <p className="my-rank-caption">
            Your profile may be unverified or outside the selected
            year or section.
          </p>
        </section>
      )}

      {/* Filters */}
      <section className="filters">
        <div className="group">
          <Pill
            on={!year}
            to={href({ year: undefined })}
          >
            All years
          </Pill>

          {[1, 2, 3, 4].map((y) => (
            <Pill
              key={y}
              on={year === String(y)}
              to={href({ year: String(y) })}
            >
              Year {y}
            </Pill>
          ))}
        </div>

        <div className="group">
          <Pill
            on={!section}
            to={href({ section: undefined })}
          >
            All sections
          </Pill>

          {sections.map((s) => (
            <Pill
              key={s}
              on={section === s}
              to={href({ section: s })}
            >
              {s}
            </Pill>
          ))}
        </div>

        <div className="group">
          <Pill
            on={!sortByRating}
            to={href({ sort: 'solved' })}
          >
            Solved
          </Pill>

          <Pill
            on={sortByRating}
            to={href({ sort: 'rating' })}
          >
            Contest rating
          </Pill>
        </div>
      </section>

      {/* Leaderboard table */}
      <div className="list">
        <div className="row head">
          <span>#</span>
          <span>Name</span>
          <span className="n">Solved</span>
          <span className="n hide">E · M · H</span>
          <span className="n">Rating</span>
        </div>

        {(rows ?? []).map((r, i) => (
          <div
            key={r.id}
            className={`row${r.id === user.id ? ' me' : ''}`}
          >
            <span className={i < 3 ? 'rank top' : 'rank'}>
              {i + 1}
            </span>

            <span className="person">
              <Avatar
                name={r.username}
                url={r.avatar_url}
                size={34}
              />

              <span className="who">
                {r.username}
                <small>
                  Y{r.year} · {r.section ?? '—'}
                </small>
              </span>
            </span>

            <span className="n">
              {r.total_solved ?? '—'}
            </span>

            <span className="n hide dim">
              {r.easy ?? '-'} · {r.medium ?? '-'} · {r.hard ?? '-'}
            </span>

            <span className="n">
              {r.rating ?? '—'}
            </span>
          </div>
        ))}

        {!rows?.length && (
          <p className="empty">No students here yet.</p>
        )}
      </div>
    </main>
  )
}
