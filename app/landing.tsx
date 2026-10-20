
import Link from 'next/link'
import Avatar from './avatar'
import './landing.css'

const SAMPLE = [
  { name: 'Aarav Sharma', meta: 'Year 3 · Section A', solved: 412, easy: 180, medium: 190, hard: 42, rating: 1894 },
  { name: 'Meera Nair', meta: 'Year 3 · Section A', solved: 377, easy: 170, medium: 176, hard: 31, rating: 1731 },
  { name: 'Rohan Gupta', meta: 'Year 3 · Section A', solved: 341, easy: 160, medium: 150, hard: 31, rating: 1620 },
  { name: 'Ishita Rao', meta: 'Year 3 · Section A', solved: 298, easy: 150, medium: 130, hard: 18, rating: null },
]

const STEPS = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up using your college email and select your year and section.',
  },
  {
    number: '02',
    title: 'Verify your profile',
    description: 'Add a one-time verification code to your LeetCode profile summary.',
  },
  {
    number: '03',
    title: 'Climb the rankings',
    description: 'Compare your progress with classmates and compete for the top spot.',
  },
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 6H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Brand() {
  return (
    <Link href="/" className="lp-brand" aria-label="LeetCode Board home">
      <img src="/favicon.ico" alt="" className="lp-brand-icon" />
      <span>
        leetcode<span className="lp-brand-dot">.</span>board
      </span>
    </Link>
  )
}

export default function Landing() {
  return (
    <main className="lp">
      <nav className="lp-nav">
        <Brand />

        <div className="lp-nav-links">
          <Link href="/login" className="lp-login">
            Log in
          </Link>

          <Link href="/login?mode=signup" className="lp-nav-cta">
            Get started <ArrowIcon />
          </Link>
        </div>
      </nav>

      <div className="lp-container">
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <div className="lp-kicker">
              <span className="lp-status-dot" />
              BUILT FOR CAMPUS CODERS
            </div>

            <h1>
              Your campus.
              <br />
              Your competition.
              <br />
              <span>Your leaderboard.</span>
            </h1>

            <p className="lp-description">
              Every problem solved gets you closer to the top.
              Track your LeetCode progress, compete with classmates,
              and see where you stand across your campus.
            </p>

            <div className="lp-actions">
              <Link href="/login?mode=signup" className="lp-primary">
                Claim your spot <ArrowIcon />
              </Link>

              <Link href="/login" className="lp-secondary">
                Already a member?
              </Link>
            </div>

            <div className="lp-trust">
              <span className="lp-trust-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              College email + LeetCode profile verification
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-glow" />

            <div className="lp-board">
              <div className="lp-board-top">
                <div>
                  <div className="lp-board-eyebrow">
                    THE CAMPUS ARENA
                  </div>
                  <h2>
                    Leaderboard<span>.</span>
                  </h2>
                </div>

                <div className="lp-demo-badge">
                  <span /> DEMO
                </div>
              </div>

              <div className="lp-board-filters">
                <span className="active">Overall</span>
                <span>Year 3</span>
                <span>Section A</span>
              </div>

              <div className="lp-podium">
                {[SAMPLE[1], SAMPLE[0], SAMPLE[2]].map((person, index) => {
                  const rank = [2, 1, 3][index]

                  return (
                    <div
                      className={`lp-podium-person rank-${rank}`}
                      key={person.name}
                    >
                      <div className="lp-crown">
                        {rank === 1 ? <TrophyIcon /> : `0${rank}`}
                      </div>

                      <div className="lp-podium-avatar">
                        <Avatar name={person.name} size={42} />
                      </div>

                      <strong>{person.name.split(' ')[0]}</strong>
                      <span className="lp-podium-rating">
                        {person.rating}
                      </span>

                      <div className="lp-podium-block">
                        <span>{rank}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="lp-table">
                <div className="lp-table-head">
                  <span>RANK / STUDENT</span>
                  <span>SOLVED</span>
                  <span>RATING</span>
                </div>

                {SAMPLE.map((person, index) => (
                  <div className="lp-table-row" key={person.name}>
                    <div className="lp-student">
                      <span className="lp-rank-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <Avatar name={person.name} size={30} />

                      <div className="lp-student-name">
                        <strong>{person.name}</strong>
                        <small>{person.meta}</small>
                      </div>
                    </div>

                    <span className="lp-solved">{person.solved}</span>

                    <span className="lp-rating">
                      {person.rating ?? '—'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="lp-board-foot">
                <span>
                  <i /> Example leaderboard
                </span>

                <span>
                  Make your mark <ArrowIcon />
                </span>
              </div>
            </div>

            <div className="lp-float-card">
              <div className="lp-float-icon">
                <TrophyIcon />
              </div>

              <div>
                <strong>Your next milestone</strong>
                <span>Keep solving. Keep climbing.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-stats" aria-label="Platform features">
          <div>
            <strong>01</strong>
            <span>One campus</span>
          </div>

          <div>
            <strong>∞</strong>
            <span>Room to climb</span>
          </div>

          <div>
            <strong>100%</strong>
            <span>Earn your rank</span>
          </div>

          <p>Every solve counts. Every rank is earned.</p>
        </section>

        <section className="lp-how">
          <div className="lp-section-heading">
            <div>
              <div className="lp-kicker">
                THREE STEPS. THAT'S IT.
              </div>

              <h2>
                From solving to <span>standing out.</span>
              </h2>
            </div>

            <p>
              No complicated setup. Verify your identity,
              connect your profile, and let your progress speak.
            </p>
          </div>

          <div className="lp-steps">
            {STEPS.map((step) => (
              <article className="lp-step" key={step.number}>
                <div className="lp-step-top">
                  <span>{step.number}</span>
                  <ArrowIcon />
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-final-cta">
          <div>
            <div className="lp-kicker">YOUR RANK IS WAITING</div>
            <h2>Think you can top your campus?</h2>
            <p>Start with your next problem. Make it count.</p>
          </div>

          <Link href="/login?mode=signup" className="lp-primary">
            Join the leaderboard <ArrowIcon />
          </Link>
        </section>

        <footer className="lp-footer">
          <Brand />

          <span>Built for the ones who keep solving.</span>

          <Link href="/login">
            Get started <ArrowIcon />
          </Link>
        </footer>
      </div>
    </main>
  )
}
