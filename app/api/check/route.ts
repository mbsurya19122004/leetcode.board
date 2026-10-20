import { NextResponse } from 'next/server'
import { admin } from '@/lib/supabase'
import { fetchLeetCode } from '@/lib/leetcode'
import { isLimited, clientIp } from '@/lib/ratelimit'

// Pre-signup check: LeetCode id exists and isn't already VERIFIED by someone else
export async function POST(req: Request) {
  if (await isLimited(`check:${clientIp(req)}`, 10, 60))
    return NextResponse.json({ error: 'Too many attempts — wait a minute' }, { status: 429 })

  const { username, leetcode } = await req.json()
  const name = String(username ?? '').trim()
  if (name.length < 2 || name.length > 40) return NextResponse.json({ error: 'Enter your full name (2–40 characters)' }, { status: 400 })
  if (!/^[\w-]{1,40}$/.test(leetcode ?? '')) return NextResponse.json({ error: 'Invalid LeetCode id' }, { status: 400 })
  const { data: l } = await admin().from('profiles').select('id').eq('verified', true).ilike('leetcode_username', leetcode.replace(/_/g, '\\_')).maybeSingle()
  if (l) return NextResponse.json({ error: 'This LeetCode profile is already verified by another student' }, { status: 409 })
  if (!(await fetchLeetCode(leetcode))) return NextResponse.json({ error: 'LeetCode user not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
