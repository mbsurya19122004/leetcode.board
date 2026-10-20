'use server'
import { redirect } from 'next/navigation'
import { admin, serverClient } from '@/lib/supabase'
import { syncUser, fetchLeetCode, fetchAboutMe } from '@/lib/leetcode'
import { isLimited } from '@/lib/ratelimit'

async function me() {
  const { data: { user } } = await (await serverClient()).auth.getUser()
  if (!user) redirect('/login')
  return user
}
const back = (m: string) => redirect(`/?msg=${encodeURIComponent(m)}`)

export async function updateProfile(fd: FormData) {
  const user = await me()
  const username = String(fd.get('username') ?? '').trim()
  const year = Number(fd.get('year'))
  const section = String(fd.get('section') ?? '').trim().toUpperCase()

  if (username.length < 2 || username.length > 40) back('Enter your full name (2–40 characters)')
  if (![1, 2, 3, 4].includes(year)) back('Pick a valid year')
  if (!section || section.length > 10) back('Enter a valid section')

  const db = admin()
  const { data: cur } = await db.from('profiles').select('verified, leetcode_username').eq('id', user.id).single()
  if (!cur) back('No profile found')
  const update: Record<string, unknown> = { username, year, section }

  // LeetCode id can only be changed while still unverified (fixing a typo)
  const lc = String(fd.get('leetcode') ?? '').trim()
  if (!cur!.verified && lc && lc.toLowerCase() !== cur!.leetcode_username.toLowerCase()) {
    if (await isLimited(`lcchange:${user.id}`, 5, 3600)) back('Too many changes — try again later')
    if (!/^[\w-]{1,40}$/.test(lc)) back('Invalid LeetCode id')
    if (!(await fetchLeetCode(lc))) back('LeetCode user not found')
    update.leetcode_username = lc
  }

  const { error } = await db.from('profiles').update(update).eq('id', user.id)
  back(error ? 'Could not save' : 'Saved')
}

export async function refreshStats() {
  const user = await me()
  const { data: p } = await admin().from('profiles').select('leetcode_username, synced_at, verified').eq('id', user.id).single()
  if (!p || !p.verified) back('Verify your LeetCode profile first')
  if (p!.synced_at && Date.now() - new Date(p!.synced_at).getTime() < 5 * 60_000) back('Already up to date — try again in a few minutes')
  back((await syncUser(user.id, p!.leetcode_username)) ? 'Stats refreshed' : 'LeetCode is not responding, try later')
}

// Ownership proof: the profile's one-time code must appear in the LeetCode "Summary"
export async function verifyLeetCode() {
  const user = await me()
  if (await isLimited(`verify:${user.id}`, 10, 3600)) back('Too many attempts — try again in an hour')
  const db = admin()
  const { data: p } = await db.from('profiles').select('leetcode_username, verify_code, verified').eq('id', user.id).single()
  if (!p) back('No profile found')
  if (p!.verified) back('Already verified')

  const bio = await fetchAboutMe(p!.leetcode_username)
  if (bio === null) back('Could not read your LeetCode profile — check the username and try again')
  if (!bio!.toLowerCase().includes(p!.verify_code.toLowerCase()))
    back('Code not found in your LeetCode summary yet — save it there, wait a minute, and try again')

  // partial unique index: only one account can verify a given LeetCode id
  const { error } = await db.from('profiles').update({ verified: true }).eq('id', user.id)
  if (error) back(error.code === '23505' ? 'Another student already verified this LeetCode profile' : 'Could not verify')
  await syncUser(user.id, p!.leetcode_username)
  back('Verified — you are on the leaderboard. You can remove the code from LeetCode now.')
}
