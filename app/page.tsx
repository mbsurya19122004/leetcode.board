import Link from 'next/link'
import { redirect } from 'next/navigation'
import { serverClient, admin } from '@/lib/supabase'
import Nav from './nav'
import Landing from './landing'
import Avatar from './avatar'
import AvatarUploader from './avatar-uploader'
import { updateProfile, refreshStats, verifyLeetCode } from './actions'

export default async function Home({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return <Landing />
  const { data: p } = await admin().from('profiles').select('*').eq('id', user.id).single()
  if (!p) redirect('/login')

  const editForm = (
    <details className="edit" open={!p.verified}>
      <summary>Edit details</summary>
      <form action={updateProfile} className="panel">
        <label>Full name<input name="username" defaultValue={p.username} required maxLength={40} /></label>
        <div className="two">
          <label>Year<select name="year" defaultValue={p.year}>{[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}</select></label>
          <label>Section<input name="section" defaultValue={p.section} required maxLength={10} /></label>
        </div>
        <label>Email<input value={user.email ?? ''} disabled readOnly /></label>
        {p.verified
          ? <label>LeetCode id<input value={p.leetcode_username} disabled readOnly /></label>
          : <label>LeetCode id<input name="leetcode" defaultValue={p.leetcode_username} required /></label>}
        <small className="dim">
          {p.verified ? 'Email and LeetCode id are locked: one LeetCode profile per account.' : 'Wrong LeetCode id? Fix it here before verifying.'}
        </small>
        <button className="primary">Save changes</button>
      </form>
    </details>
  )

  // ---- not verified yet: ownership check ----
  if (!p.verified) {
    return (
      <main className="wrap">
        <Nav active="home" />
        <p className="eyebrow">one more step</p>
        <h1>Verify your LeetCode profile</h1>
        {msg && <p className="msg">{msg}</p>}
        <div className="panel" style={{ marginTop: 20 }}>
          <p className="dim" style={{ margin: 0 }}>Prove that <b>{p.leetcode_username}</b> is really yours. You only appear on the leaderboard after this.</p>
          <ol>
            <li>On LeetCode, open your profile → <b>Edit Profile</b>.</li>
            <li>Paste this code into the <b>Readme</b> field and save:</li>
          </ol>
          <code className="code">{p.verify_code}</code>
          <form action={verifyLeetCode}><button className="primary">Verify</button></form>
          <small className="dim">The code is unique to your account. You can delete it from LeetCode once verified.</small>
        </div>
        {editForm}
      </main>
    )
  }

  const mine = p.total_solved ?? 0
  const ahead = (q: any) => q.select('id', { count: 'exact', head: true }).eq('year', p.year).gt('total_solved', mine)
  const desc = { ascending: false, nullsFirst: false }
  const [sec, yr, { data: top }] = await Promise.all([
    ahead(sb.from('profiles')).eq('section', p.section),
    ahead(sb.from('profiles')),
    sb.from('profiles').select('id, username, total_solved, rating, avatar_url').eq('year', p.year).eq('section', p.section).eq('verified', true)
      .order('total_solved', desc).order('rating', desc).limit(5),
  ])
  const synced = p.synced_at
    ? new Date(p.synced_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
    : 'never'

  const tiles: [string, string | number][] = [
    ['Solved', p.total_solved ?? '—'],
    ['Contest rating', p.rating ?? '—'],
    [`Rank · Section ${p.section}`, `#${(sec.count ?? 0) + 1}`],
    [`Rank · Year ${p.year}`, `#${(yr.count ?? 0) + 1}`],
  ]

  return (
    <main className="wrap">
      <Nav active="home" />
      <div className="hero">
        <Avatar name={p.username} url={p.avatar_url} size={88} />
        <div>
          <p className="eyebrow">your profile</p>
          <h1>Hi, {p.username}</h1>
          <AvatarUploader hasAvatar={!!p.avatar_url} />
        </div>
      </div>
      {msg && <p className="msg">{msg}</p>}

      <section className="tiles">
        {tiles.map(([k, v]) => <div key={k} className="tile"><small>{k}</small><strong>{v}</strong></div>)}
      </section>
      <p className="dim sub">Easy {p.easy ?? '-'} · Medium {p.medium ?? '-'} · Hard {p.hard ?? '-'} · synced {synced}</p>
      <form action={refreshStats}><button className="ghost">↻ Refresh my stats</button></form>

      <div className="h2 split">
        <span>Top of Year {p.year} · Section {p.section}</span>
        <Link href={`/leaderboard?year=${p.year}&section=${p.section}`}>Full leaderboard →</Link>
      </div>
      <div className="list mini">
        {(top ?? []).map((r, i) => (
          <div key={r.id} className={`row${r.id === user.id ? ' me' : ''}`}>
            <span className={i < 3 ? 'rank top' : 'rank'}>{i + 1}</span>
            <span className="person"><Avatar name={r.username} url={r.avatar_url} size={28} /><span className="who">{r.username}</span></span>
            <span className="n">{r.total_solved ?? '—'}</span>
            <span className="n dim">{r.rating ?? '—'}</span>
          </div>
        ))}
      </div>

      {editForm}
    </main>
  )
}
