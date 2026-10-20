'use server'
import { syncUser } from '@/lib/leetcode'
import { admin, serverClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

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

  if (!/^[A-Za-z0-9_.-]{3,20}$/.test(username)) back('Username: 3–20 letters, numbers, . _ -')
  if (![1, 2, 3, 4].includes(year)) back('Pick a valid year')
  if (!section || section.length > 10) back('Enter a valid section')

  const db = admin()
  const { data: clash } = await db.from('profiles').select('id').ilike('username', username.replace(/_/g, '\\_')).neq('id', user.id).maybeSingle()
  if (clash) back('That username is taken')

  // leetcode_username is deliberately not editable
  const { error } = await db.from('profiles').update({ username, year, section }).eq('id', user.id)
  back(error ? (error.code === '23505' ? 'That username is taken' : 'Could not save') : 'Saved')
}

export async function refreshStats() {
  const user = await me()
  const { data: p } = await admin().from('profiles').select('leetcode_username, synced_at').eq('id', user.id).single()
  if (!p) back('No profile found')
  if (p!.synced_at && Date.now() - new Date(p!.synced_at).getTime() < 5 * 60_000) back('Already up to date — try again in a few minutes')
  back((await syncUser(user.id, p!.leetcode_username)) ? 'Stats refreshed' : 'LeetCode is not responding, try later')
}