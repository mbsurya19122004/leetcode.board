import { admin } from './supabase'

// Postgres-backed fixed-window limiter (works across serverless instances).
// Returns true when the caller is OVER the limit. Fails open if the DB call errors.
export async function isLimited(key: string, max: number, windowSec: number) {
  const { data, error } = await admin().rpc('rate_limit', { p_key: key, p_max: max, p_window: windowSec })
  if (error) { console.error('rate_limit error', error.message); return false }
  return data === false
}

export const clientIp = (req: Request) =>
  req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
