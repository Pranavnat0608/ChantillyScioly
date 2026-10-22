import { useState } from 'react'
import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { createMemberAccount, db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { useEvents } from '../lib/teamData'
import { ROLES } from '../lib/constants'
import { Avatar, ErrorNote, Icon, Modal, PageHeader, RoleBadge, friendlyError } from '../components/ui'

export default function Roster() {
  const { roster, isStaff, isCoach, user, teamId, team } = useAuth()
  const { data: events } = useEvents()
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)

  const eventsFor = (uid) => events.filter((e) => e.assignees?.includes(uid))
  const order = { coach: 0, captain: 1, student: 2 }
  const sorted = [...roster].sort((a, b) => order[a.role] - order[b.role] || a.name.localeCompare(b.name))

  async function changeRole(m, role) {
    try {
      await updateDoc(doc(db, 'teams', teamId, 'members', m.id), { role })
    } catch (err) {
      alert(friendlyError(err))
    }
  }

  async function remove(m) {
    if (!confirm(`Remove ${m.name} from the team? Their account stays, but they lose access to team data.`)) return
    try {
      await deleteDoc(doc(db, 'teams', teamId, 'members', m.id))
    } catch (err) {
      alert(friendlyError(err))
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(team.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <PageHeader
        title="Roster"
        subtitle={`${roster.length} members · ${roster.filter((m) => m.role === 'student').length} students`}
        actions={
          isStaff && (
            <button className="btn-primary" onClick={() => setAdding(true)}>
              <Icon name="plus" className="h-4 w-4" /> Add member
            </button>
          )
        }
      />

      {isStaff && team?.joinCode && (
        <div className="board mb-8 flex flex-col gap-4 border-2 border-ink sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="cut text-base text-white">Team join code</p>
            <p className="text-xs text-brand-100">Students can sign up on their own and enter this code to join as a student.</p>
          </div>
          <button onClick={copyCode} className="mounted flex items-center gap-3 self-start px-4 py-2 sm:mr-2 sm:self-auto">
            <span className="cut text-xl font-bold tracking-[0.25em] text-brand-800">{team.joinCode}</span>
            <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4 text-brand-600" />
          </button>
        </div>
      )}

      <div className="card divide-y divide-rule">
        {sorted.map((m) => {
          const evs = eventsFor(m.id)
          const self = m.id === user.uid
          // Captains can't touch coaches or appoint new ones; nobody edits themself here.
          const canManage = isStaff && !self && (isCoach || m.role !== 'coach')
          return (
            <div key={m.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={m.name} />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <span className="truncate">{m.name}</span>
                    {self && <span className="text-xs font-normal text-muted">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted">{m.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 sm:max-w-[45%] sm:justify-end">
                {evs.length === 0 ? (
                  <span className="text-xs text-muted italic">No events</span>
                ) : (
                  evs.map((e) => (
                    <span key={e.id} className="bg-board px-2 py-1 text-xs font-semibold">{e.name}</span>
                  ))
                )}
              </div>
              <div className="flex items-center gap-2 sm:w-44 sm:justify-end">
                {canManage ? (
                  <>
                    <select
                      className="input w-auto py-1 text-xs"
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value)}
                      aria-label={`Role for ${m.name}`}
                    >
                      {Object.entries(ROLES)
                        .filter(([k]) => isCoach || k !== 'coach')
                        .map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button className="btn-ghost px-2 text-red-700 hover:bg-red-50" onClick={() => remove(m)} aria-label={`Remove ${m.name}`}>
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <RoleBadge role={m.role} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {adding && <AddMemberModal onClose={() => setAdding(false)} />}
    </>
  )
}

function AddMemberModal({ onClose }) {
  const { teamId, isCoach } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', role: 'student', password: tempPassword() })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const name = form.name.trim()
      const email = form.email.trim().toLowerCase()
      const uid = await createMemberAccount({ name, email, password: form.password, teamId })
      await setDoc(doc(db, 'teams', teamId, 'members', uid), {
        name,
        email,
        role: form.role,
        joinedAt: serverTimestamp(),
      })
      setDone({ name, email, password: form.password })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Modal open onClose={onClose} title="Member added">
        <p className="text-sm text-muted">
          <b>{done.name}</b> now has an account. We emailed <b>{done.email}</b> a link to set their own password. Until then they can sign in with this temporary password:
        </p>
        <p className="my-4 bg-board px-4 py-3 text-center cut text-lg font-semibold">{done.password}</p>
        <div className="flex justify-end gap-2">
          <button
            className="btn-secondary"
            onClick={() => {
              setDone(null)
              setForm({ name: '', email: '', role: form.role, password: tempPassword() })
            }}
          >
            Add another
          </button>
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open onClose={onClose} title="Add a member">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">
          Creates a login for someone and adds them to the team. If they already have an account, share the join code instead.
        </p>
        <div>
          <label className="label" htmlFor="mname">Full name</label>
          <input id="mname" className="input" required value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label" htmlFor="memail">Email</label>
          <input id="memail" type="email" className="input" required value={form.email} onChange={set('email')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="mrole">Role</label>
            <select id="mrole" className="input" value={form.role} onChange={set('role')}>
              {Object.entries(ROLES)
                .filter(([k]) => isCoach || k !== 'coach')
                .map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="mpass">Temp password</label>
            <input id="mpass" className="input font-mono" required minLength={6} value={form.password} onChange={set('password')} />
          </div>
        </div>
        <ErrorNote error={error} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </div>
      </form>
    </Modal>
  )
}

function tempPassword() {
  const words = ['atom', 'comet', 'quark', 'helix', 'prism', 'orbit', 'ion', 'flux', 'nova', 'gene']
  const w = () => words[crypto.getRandomValues(new Uint32Array(1))[0] % words.length]
  return `${w()}-${w()}-${100 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900)}`
}
