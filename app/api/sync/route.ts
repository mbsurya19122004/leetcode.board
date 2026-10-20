import { NextResponse } from 'next/server'
import { admin, serverClient } from '@/lib/supabase'
import { syncUser } from '@/lib/leetcode'

// Refresh the logged-in user's own stats (throttled to once / 10 min)
export async function POST() {
  const { data: { user } } = await (await serverClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await admin().from('profiles').select('leetcode_username, synced_at, verified').eq('id', user.id).single()
  if (!p) return NextResponse.json({ error: 'No profile' }, { status: 404 })
  if (!p.verified) return NextResponse.json({ ok: false, unverified: true })
  if (p.synced_at && Date.now() - new Date(p.synced_at).getTime() < 10 * 60_000) return NextResponse.json({ ok: true, throttled: true })
  return NextResponse.json({ ok: await syncUser(user.id, p.leetcode_username) })
}
