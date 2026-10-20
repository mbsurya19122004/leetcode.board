import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { admin } from '@/lib/supabase'
import { syncUser } from '@/lib/leetcode'

// Email-confirmation link lands here
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (code) {
    const sb = await serverClient()
    const { data } = await sb.auth.exchangeCodeForSession(code)
    if (data.user) {
      const { data: p } = await admin().from('profiles').select('leetcode_username, verified').eq('id', data.user.id).single()
      if (p?.verified) await syncUser(data.user.id, p.leetcode_username)
    }
  }
  return NextResponse.redirect(new URL('/', url.origin))
}
