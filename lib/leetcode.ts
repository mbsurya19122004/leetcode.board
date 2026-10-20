import { admin } from './supabase'

const QUERY = `query($u:String!){
  matchedUser(username:$u){ submitStatsGlobal{ acSubmissionNum{ difficulty count } } }
  userContestRanking(username:$u){ rating }
}`

export async function fetchLeetCode(username: string) {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query: QUERY, variables: { u: username } }),
    cache: 'no-store',
  })
  const j = await r.json().catch(() => null)
  const m = j?.data?.matchedUser
  if (!m) return null
  const c: Record<string, number> = Object.fromEntries(
    m.submitStatsGlobal.acSubmissionNum.map((x: any) => [x.difficulty, x.count]))
  const rating = j.data.userContestRanking?.rating
  return { total_solved: c.All, easy: c.Easy, medium: c.Medium, hard: c.Hard, rating: rating ? Math.round(rating) : null }
}

export async function syncUser(id: string, username: string) {
  const stats = await fetchLeetCode(username)
  if (!stats) return false
  await admin().from('profiles').update({ ...stats, synced_at: new Date().toISOString() }).eq('id', id)
  return true
}

// Reads the "Summary" (aboutMe) text of a LeetCode profile — used to verify ownership
export async function fetchAboutMe(username: string): Promise<string | null> {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query: 'query($u:String!){matchedUser(username:$u){profile{aboutMe}}}', variables: { u: username } }),
    cache: 'no-store',
  })
  const j = await r.json().catch(() => null)
  const m = j?.data?.matchedUser
  return m ? (m.profile?.aboutMe ?? '') : null
}
