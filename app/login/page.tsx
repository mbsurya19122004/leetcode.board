import LoginForm from './form'

// /login?mode=signup opens the sign-up form directly (used by the landing page CTA)
export default async function Login({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams
  return <LoginForm initialSignup={mode === 'signup'} />
}
