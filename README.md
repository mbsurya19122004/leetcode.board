# Copy-over instructions
Copy everything in this folder into your Next.js 16 project root (it won't touch .env.local or next.config.ts).
- Delete your old `middleware.ts` and `app/profile/` if they still exist.
- Database SQL is delivered as separate files (not in this zip). Existing project: run migration-verify.sql once (edit your college email domain in it first). Set NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS in .env.local.
- Needs: npm i @supabase/ssr @supabase/supabase-js
- Routes: / = your profile, /leaderboard = rankings, /login = auth.
# leetcode.board
