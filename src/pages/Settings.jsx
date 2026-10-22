import { useState } from 'react'
import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { generateJoinCode } from '../lib/constants'
import { ErrorNote, PageHeader, RoleBadge } from '../components/ui'

export default function Settings() {
  const { profile, role, team, teamId, isCoach, isStaff, roster, updateName, leaveTeam, resetPassword, user } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [teamForm, setTeamForm] = useState({ name: team?.name ?? '', school: team?.school ?? '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState(null)

  async function run(fn, success) {
    setError(null)
    setMsg('')
    try {
      await fn()
      setMsg(success)
    } catch (err) {
      setError(err)
    }
  }

  async function regenerateCode() {
    if (!confirm('Generate a new join code? The old one will stop working.')) return
    const code = generateJoinCode()
    await setDoc(doc(db, 'joinCodes', code), { teamId })
    await updateDoc(doc(db, 'teams', teamId), { joinCode: code })
    if (team.joinCode) await deleteDoc(doc(db, 'joinCodes', team.joinCode)).catch(() => {})
  }

  const otherCoaches = roster.filter((m) => m.role === 'coach' && m.id !== user.uid).length
  const canLeave = !isCoach || otherCoaches > 0

  return (
    <>
      <PageHeader title="Settings" />
      {(msg || error) && (
        <div className="mb-4">
          {msg && <p className="bg-brand-50 px-3 py-2 text-sm text-brand-800">{msg}</p>}
          <ErrorNote error={error} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Your profile</h2>
          <form onSubmit={(e) => (e.preventDefault(), run(() => updateName(name.trim()), 'Name updated.'))} className="space-y-4">
            <div>
              <label className="label" htmlFor="pname">Name</label>
              <input id="pname" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{profile?.email}</span>
              <RoleBadge role={role} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary">Save name</button>
              <button type="button" className="btn-secondary" onClick={() => run(() => resetPassword(profile.email), 'Password reset email sent.')}>
                Change password
              </button>
            </div>
          </form>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Team</h2>
          {isCoach ? (
            <form onSubmit={(e) => (e.preventDefault(), run(() => updateDoc(doc(db, 'teams', teamId), { name: teamForm.name.trim(), school: teamForm.school.trim() }), 'Team updated.'))} className="space-y-4">
              <div>
                <label className="label" htmlFor="tn">Team name</label>
                <input id="tn" className="input" required value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="ts">School</label>
                <input id="ts" className="input" value={teamForm.school} onChange={(e) => setTeamForm({ ...teamForm, school: e.target.value })} />
              </div>
              <button className="btn-primary">Save team</button>
            </form>
          ) : (
            <p className="text-sm text-muted">
              <b>{team?.name}</b>
              <br />
              {team?.school}
            </p>
          )}

          {isStaff && (
            <div className="mt-6 flex items-center justify-between border-t border-rule pt-4">
              <div>
                <p className="text-sm font-medium">Join code</p>
                <p className="cut text-lg font-bold tracking-[0.25em] text-brand-800">{team?.joinCode}</p>
              </div>
              <button className="btn-secondary" onClick={() => run(regenerateCode, 'New join code generated.')}>Regenerate</button>
            </div>
          )}

          <div className="mt-6 border-t border-rule pt-4">
            <button
              className="btn-ghost px-0 text-red-700 hover:bg-transparent hover:underline"
              disabled={!canLeave}
              onClick={() => confirm(`Leave ${team?.name}? You'll need a join code to come back.`) && run(leaveTeam, '')}
            >
              Leave team
            </button>
            {!canLeave && <p className="text-xs text-muted">Make another member a coach before leaving.</p>}
          </div>
        </section>
      </div>
    </>
  )
}
