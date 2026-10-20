import Link from 'next/link'
import { redirect } from 'next/navigation'
import { serverClient } from '@/lib/supabase'
import Nav from '../nav'
import Avatar from '../avatar'

type SP = { year?: string; section?: string; sort?: string }

export default async function Leaderboard({ searchParams }: { searchParams: Promise<SP> }) {
  const { year, section, sort = 'solved' } = await searchParams
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const desc = { ascending: false, nullsFirst: false }
  let q = sb.from('profiles').select('id, username, year, section, total_solved, easy, medium, hard, rating, avatar_url').eq('verified', true)
  if (year) q = q.eq('year', Number(year))
  if (section) q = q.eq('section', section)
  q = sort === 'rating'
    ? q.order('rating', desc).order('total_solved', desc)
    : q.order('total_solved', desc).order('rating', desc)

  const [{ data: rows }, { data: all }] = await Promise.all([q.limit(500), sb.from('profiles').select('section')])
  const sections = [...new Set((all ?? []).map(r => r.section))].sort()

  const href = (patch: Partial<SP>) => {
    const p = new URLSearchParams()
    Object.entries({ year, section, sort, ...patch }).forEach(([k, v]) => v && p.set(k, v))
    return `/leaderboard?${p}`
  }
  const Pill = ({ on, to, children }: { on: boolean; to: string; children: React.ReactNode }) =>
    <Link href={to} className={on ? 'pill on' : 'pill'}>{children}</Link>

  return (
    <main className="wrap">
      <Nav active="board" />
      <p className="eyebrow">leaderboard</p>
      <h1>Rankings</h1>

      <section className="filters">
        <div className="group">
          <Pill on={!year} to={href({ year: undefined })}>All years</Pill>
          {[1, 2, 3, 4].map(y => <Pill key={y} on={year === String(y)} to={href({ year: String(y) })}>Year {y}</Pill>)}
        </div>
        <div className="group">
          <Pill on={!section} to={href({ section: undefined })}>All sections</Pill>
          {sections.map(s => <Pill key={s} on={section === s} to={href({ section: s })}>{s}</Pill>)}
        </div>
        <div className="group">
          <Pill on={sort !== 'rating'} to={href({ sort: 'solved' })}>Solved</Pill>
          <Pill on={sort === 'rating'} to={href({ sort: 'rating' })}>Contest rating</Pill>
        </div>
      </section>

      <div className="list">
        <div className="row head"><span>#</span><span>Name</span><span className="n">Solved</span><span className="n hide">E · M · H</span><span className="n">Rating</span></div>
        {(rows ?? []).map((r, i) => (
          <div key={r.id} className={`row${r.id === user.id ? ' me' : ''}`}>
            <span className={i < 3 ? 'rank top' : 'rank'}>{i + 1}</span>
            <span className="person"><Avatar name={r.username} url={r.avatar_url} size={34} /><span className="who">{r.username}<small>Y{r.year} · {r.section}</small></span></span>
            <span className="n">{r.total_solved ?? '—'}</span>
            <span className="n hide dim">{r.easy ?? '-'} · {r.medium ?? '-'} · {r.hard ?? '-'}</span>
            <span className="n">{r.rating ?? '—'}</span>
          </div>
        ))}
        {!rows?.length && <p className="empty">No students here yet.</p>}
      </div>
    </main>
  )
}
