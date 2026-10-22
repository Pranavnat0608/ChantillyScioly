import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { ErrorNote, Icon } from '../components/ui'
import { Logo } from '../components/Layout'
import DeleteAccount from '../components/DeleteAccount'

export default function Onboarding() {
  const { profile, createTeam, joinTeam, logout } = useAuth()
  const [tab, setTab] = useState('join')
  const [code, setCode] = useState('')
  const [team, setTeam] = useState({ name: 'Chantilly Science Olympiad', school: 'Chantilly High School' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function run(fn) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-700 p-4">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Logo className="h-14 w-14" />
          <div>
            <h1 className="cut text-2xl">Hi, {profile?.name?.split(' ')[0]}</h1>
            <p className="text-sm text-muted">You're not on a team yet.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 border-2 border-ink text-sm font-bold" role="tablist">
          {[
            ['join', 'Join a team'],
            ['create', 'Create a team'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              role="tab"
              aria-selected={tab === k}
              className={`py-3 ${tab === k ? 'bg-brand-700 text-white' : 'bg-white text-ink hover:bg-gold-soft'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'join' ? (
          <form onSubmit={(e) => (e.preventDefault(), run(() => joinTeam(code)))} className="space-y-4">
            <div>
              <label className="label" htmlFor="code">Team join code</label>
              <input
                id="code"
                className="input cut text-lg tracking-[0.3em] uppercase"
                placeholder="ABC123"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted">Ask your coach or captain for the 6-character code.</p>
            </div>
            <ErrorNote error={error} />
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Joining…' : 'Join team'}</button>
          </form>
        ) : (
          <form onSubmit={(e) => (e.preventDefault(), run(() => createTeam(team)))} className="space-y-4">
            <div>
              <label className="label" htmlFor="tname">Team name</label>
              <input id="tname" className="input" required value={team.name} onChange={(e) => setTeam({ ...team, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="school">School</label>
              <input id="school" className="input" value={team.school} onChange={(e) => setTeam({ ...team, school: e.target.value })} />
            </div>
            <p className="flex gap-2 border-2 border-ink bg-gold-soft p-3 text-xs font-medium text-ink">
              <Icon name="check" className="h-4 w-4 shrink-0" />
              You'll be the team's coach, with full control over the roster, events, and settings.
            </p>
            <ErrorNote error={error} />
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create team'}</button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-between border-t-2 border-ink pt-4">
          <button onClick={logout} className="text-sm font-bold text-muted hover:text-ink">
            Sign out
          </button>
          <DeleteAccount />
        </div>
      </div>
    </div>
  )
}
