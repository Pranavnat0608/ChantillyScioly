import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { ErrorNote } from '../components/ui'

const COPY = {
  signin: { title: 'Sign in', sub: 'Your events, study materials and team dates.', cta: 'Sign in' },
  signup: { title: 'Create account', sub: 'Coaches create a team after signing up. Students join with a code from their coach.', cta: 'Create account' },
  reset: { title: 'Reset password', sub: "We'll email you a link to choose a new password.", cta: 'Send reset link' },
}

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const copy = COPY[mode]

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'signin') await signIn(form)
      else if (mode === 'signup') await signUp({ ...form, name: form.name.trim() })
      else {
        await resetPassword(form.email)
        setNotice('If that email has an account, a reset link is on its way.')
      }
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-700 p-3 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-6xl border-2 border-ink sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-between gap-10 border-b-2 border-ink p-6 text-white sm:p-10 lg:border-r-2 lg:border-b-0">
          <div className="flex items-center gap-4">
            <span className="mounted inline-flex h-24 w-24 shrink-0 items-center justify-center p-2 sm:h-32 sm:w-32">
              <img src="/logo.png" alt="Chantilly Chargers logo" className="h-full w-full object-contain" />
            </span>
          </div>
          <h1 className="cut text-3xl leading-[0.95] sm:text-6xl lg:text-7xl">
            Chantilly
            <br />
            Science
            <br />
            <span className="mt-2 inline-block bg-gold px-2 pt-1 text-ink">Olympiad</span>
          </h1>
          <p className="max-w-sm text-sm text-brand-100">Team portal for rosters, event assignments, study materials and tournament dates.</p>
        </div>

        <div className="flex items-center bg-white p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <h2 className="cut text-3xl">{copy.title}</h2>
            <p className="mt-1 mb-7 text-sm text-muted">{copy.sub}</p>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="label" htmlFor="name">Full name</label>
                  <input id="name" className="input" required value={form.name} onChange={set('name')} autoComplete="name" />
                </div>
              )}
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" className="input" required value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
              {mode !== 'reset' && (
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="label" htmlFor="password">Password</label>
                    {mode === 'signin' && (
                      <button type="button" className="text-xs font-bold text-brand-700 underline" onClick={() => setMode('reset')}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="input"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={set('password')}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                </div>
              )}
              <ErrorNote error={error} />
              {notice && <p className="border-2 border-brand-700 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-900">{notice}</p>}
              <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Please wait…' : copy.cta}</button>
            </form>

            <p className="mt-6 border-t-2 border-ink pt-4 text-sm text-muted">
              {mode === 'signin' ? 'New to the team? ' : 'Already have an account? '}
              <button className="font-bold text-brand-700 underline" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
