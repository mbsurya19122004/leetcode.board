import Link from 'next/link'

export default function Nav({ active }: { active: 'home' | 'board' }) {
  return (
    <nav className="topbar">
      <span className="brand">leetcode<b>.</b>board</span>
      <div className="links">
        <Link href="/" className={active === 'home' ? 'on' : ''}>Profile</Link>
        <Link href="/leaderboard" className={active === 'board' ? 'on' : ''}>Leaderboard</Link>
        <form action="/auth/signout" method="post"><button>Log out</button></form>
      </div>
    </nav>
  )
}
