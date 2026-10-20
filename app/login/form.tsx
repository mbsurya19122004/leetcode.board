'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginForm({ initialSignup = false }: { initialSignup?: boolean }) {
  const router = useRouter()
  const [signup, setSignup] = useState(initialSignup)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg('')
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    try {
      if (signup) {
        const allowed = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        if (allowed.length && !allowed.includes(f.email.split('@')[1]?.toLowerCase())) throw new Error(`Use your college email (@${allowed.join(', @')})`)
        const body = { username: f.username.trim(), leetcode: f.leetcode.trim() }
        const chk = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!chk.ok) throw new Error((await chk.json()).error)
        const { error } = await sb.auth.signUp({
          email: f.email, password: f.password,
          options: { data: { username: body.username, leetcode_username: body.leetcode, year: f.year, section: f.section }, emailRedirectTo: `${location.origin}/auth/callback` },
        })
        if (error) throw new Error(error.message.includes('Database') ? 'Sign-up rejected — use your college email address' : error.message)
        setMsg('Check your email to confirm your account, then log in to verify your LeetCode profile.')
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: f.email, password: f.password })
        if (error) throw error
        await fetch('/api/sync', { method: 'POST' })
        router.push('/'); router.refresh()
      }
    } catch (err: any) { setMsg(err.message) }
    setBusy(false)
  }

  return (
    <main className="auth">
      <Link href="/" className="ghost">← Back</Link>
      <p className="eyebrow">leetcode leaderboard</p>
      <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
      <form onSubmit={submit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" minLength={8} required />
        {signup && <>
          <input name="username" placeholder="Full name (shown on leaderboard)" required maxLength={40} />
          <input name="leetcode" placeholder="LeetCode username" required />
          <div className="row">
            <select name="year" required defaultValue=""><option value="" disabled>Year</option>{[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}</select>
            <input name="section" placeholder="Section" required maxLength={10} />
          </div>
        </>}
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Sign up' : 'Log in'}</button>
      </form>
      {msg && <p className="msg">{msg}</p>}
      <button className="ghost" onClick={() => { setSignup(!signup); setMsg('') }}>
        {signup ? 'Already have an account? Log in' : 'New here? Create an account'}
      </button>
    </main>
  )
}
