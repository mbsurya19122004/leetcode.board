import { NextResponse } from 'next/server'
import { admin } from '@/lib/supabase'
import { syncUser } from '@/lib/leetcode'

export const maxDuration = 60

// Vercel Cron sends "Authorization: Bearer $CRON_SECRET"
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new NextResponse('Forbidden', { status: 403 })
  const { data } = await admin().from('profiles').select('id, leetcode_username').eq('verified', true).order('synced_at', { ascending: true, nullsFirst: true }).limit(150)
  let n = 0
  for (const p of data ?? []) { if (await syncUser(p.id, p.leetcode_username)) n++; await new Promise(r => setTimeout(r, 250)) }
  await admin().from('rate_limits').delete().lt('reset_at', new Date(Date.now() - 864e5).toISOString())
  return NextResponse.json({ synced: n })
}
