import './globals.css'
export const metadata = { title: 'LeetCode Leaderboard', description: 'Your campus, ranked by LeetCode.' }
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
