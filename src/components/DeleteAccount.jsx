import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { ErrorNote, Modal, friendlyError } from './ui'

/** "Delete account" button plus its password-confirmed modal. */
export default function DeleteAccount({ blockedReason }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="btn-danger" disabled={!!blockedReason} onClick={() => setOpen(true)}>
        Delete account
      </button>
      {blockedReason && <p className="mt-2 text-xs text-muted">{blockedReason}</p>}
      {open && <ConfirmModal onClose={() => setOpen(false)} />}
    </>
  )
}

function ConfirmModal({ onClose }) {
  const { profile, team, deleteAccount } = useAuth()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await deleteAccount(password)
      // Signed out on success; the app returns to the sign-in page by itself.
    } catch (err) {
      setError(
        err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password'
          ? new Error('That password is incorrect.')
          : new Error(friendlyError(err)),
      )
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={busy ? () => {} : onClose} title="Delete your account?">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2 text-sm">
          <p>This permanently deletes:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>your login for <b>{profile?.email}</b></li>
            <li>your practice scores</li>
            {team && <li>your spot on {team.name}, including your event assignments</li>}
          </ul>
          {team && <p className="text-muted">Resources, announcements and replies you posted stay with the team.</p>}
          <p className="font-bold">This can't be undone.</p>
        </div>
        <div>
          <label className="label" htmlFor="delpass">Enter your password to confirm</label>
          <input
            id="delpass"
            type="password"
            className="input"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <ErrorNote error={error} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-danger" disabled={busy || !password}>{busy ? 'Deleting…' : 'Delete my account'}</button>
        </div>
      </form>
    </Modal>
  )
}
