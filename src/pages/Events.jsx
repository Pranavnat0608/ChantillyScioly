import { useMemo, useState } from 'react'
import { addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { teamCol, useEvents } from '../lib/teamData'
import { EVENT_STATUS, EVENT_TYPES } from '../lib/constants'
import { Avatar, Badge, EmptyState, ErrorNote, Icon, Modal, PageHeader, Spinner } from '../components/ui'

const BLANK = { name: '', type: 'study', maxSize: 2, assignees: [], status: 'not_started', progress: 0, notes: '' }

export default function Events() {
  const { teamId, user, isStaff, roster } = useAuth()
  const { data: events, loading } = useEvents()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // event object or BLANK

  const loadByUid = useMemo(() => {
    const m = {}
    for (const e of events) for (const uid of e.assignees ?? []) m[uid] = (m[uid] ?? 0) + 1
    return m
  }, [events])

  const visible = events.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'mine') return e.assignees?.includes(user.uid)
    if (filter === 'open') return (e.assignees?.length ?? 0) < (e.maxSize ?? 2)
    if (filter !== 'all') return e.type === filter
    return true
  })

  return (
    <>
      <PageHeader
        title="Event Board"
        subtitle={`${events.length} events · ${events.filter((e) => (e.assignees?.length ?? 0) >= (e.maxSize ?? 2)).length} fully staffed`}
        actions={
          isStaff && (
            <button className="btn-primary" onClick={() => setEditing(BLANK)}>
              <Icon name="plus" className="h-4 w-4" /> New event
            </button>
          )
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-64">
          <Icon name="search" className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-muted" />
          <input className="input pl-9" placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex overflow-x-auto border-2 border-ink bg-white">
          {[
            ['all', 'All'],
            ['mine', 'My events'],
            ['open', 'Open spots'],
            ...Object.entries(EVENT_TYPES).map(([k, v]) => [k, v.label]),
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              className={`shrink-0 border-r border-ink/20 px-3 py-2 text-xs font-bold last:border-r-0 ${
                filter === k ? 'bg-brand-700 text-white' : 'text-ink hover:bg-gold-soft'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <EmptyState icon="flask" title="No events yet">
          {isStaff ? 'Add each event your team is competing in this season, then assign members to it.' : 'Your coach hasn’t set up events yet.'}
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon="search" title="Nothing matches that filter" />
      ) : (
        <div className="board grid gap-6 border-2 border-ink p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          {visible.map((ev) => (
            <EventCard
              key={ev.id}
              ev={ev}
              roster={roster}
              mine={ev.assignees?.includes(user.uid)}
              canEdit={isStaff || ev.assignees?.includes(user.uid)}
              onEdit={() => setEditing(ev)}
            />
          ))}
        </div>
      )}

      {editing && (
        <EventModal
          ev={editing}
          onClose={() => setEditing(null)}
          isStaff={isStaff}
          roster={roster}
          loadByUid={loadByUid}
          teamId={teamId}
        />
      )}
    </>
  )
}

function EventCard({ ev, roster, mine, canEdit, onEdit }) {
  const assigned = (ev.assignees ?? []).map((uid) => roster.find((m) => m.id === uid)).filter(Boolean)
  const max = ev.maxSize ?? 2
  return (
    <div className="mounted flex flex-col">
      <div className="flex items-start justify-between gap-2 border-b-2 border-ink bg-gold px-4 py-3">
        <div className="min-w-0">
          <h3 className="cut text-base leading-tight">{ev.name}</h3>
          <p className="mt-1 text-xs font-semibold text-ink">
            {EVENT_TYPES[ev.type]?.label}
            {mine && <b className="ml-2 bg-ink px-1 text-[11px] text-white uppercase">You</b>}
          </p>
        </div>
        {canEdit && (
          <button className="btn-ghost -mt-1 -mr-2 px-2" onClick={onEdit} aria-label={`Edit ${ev.name}`}>
            <Icon name="edit" className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <Badge map={EVENT_STATUS} value={ev.status ?? 'not_started'} />
        <span className="text-sm font-bold">{ev.progress ?? 0}%</span>
      </div>

      <div className="mb-4 h-2 bg-board">
        <div className="h-full bg-brand-700 transition-[width]" style={{ width: `${ev.progress ?? 0}%` }} />
      </div>

      <div className="mt-auto space-y-2">
        <p className="label">
          Team {assigned.length}/{max}
        </p>
        {assigned.length === 0 ? (
          <p className="text-sm text-muted italic">No one assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assigned.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-2 bg-board pr-2 text-xs font-semibold">
                <Avatar name={m.name} size="sm" />
                {m.name}
              </span>
            ))}
          </div>
        )}
        {ev.notes && <p className="line-clamp-2 border-t border-rule pt-2 text-xs text-muted">{ev.notes}</p>}
      </div>
      </div>
    </div>
  )
}

function EventModal({ ev, onClose, isStaff, roster, loadByUid, teamId }) {
  const [form, setForm] = useState({ ...BLANK, ...ev })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const isNew = !ev.id
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function toggle(uid) {
    set('assignees', form.assignees.includes(uid) ? form.assignees.filter((x) => x !== uid) : [...form.assignees, uid])
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const progress = Math.max(0, Math.min(100, Number(form.progress) || 0))
      if (isStaff) {
        const data = {
          name: form.name.trim(),
          type: form.type,
          maxSize: Number(form.maxSize) || 2,
          assignees: form.assignees,
          status: form.status,
          progress,
          notes: form.notes,
          updatedAt: serverTimestamp(),
        }
        if (isNew) await addDoc(teamCol(teamId, 'events'), { ...data, createdAt: serverTimestamp() })
        else await updateDoc(doc(db, 'teams', teamId, 'events', ev.id), data)
      } else {
        // Assigned students may only update progress fields.
        await updateDoc(doc(db, 'teams', teamId, 'events', ev.id), {
          status: form.status,
          progress,
          notes: form.notes,
          updatedAt: serverTimestamp(),
        })
      }
      onClose()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete ${ev.name}? This can't be undone.`)) return
    await deleteDoc(doc(db, 'teams', teamId, 'events', ev.id))
    onClose()
  }

  const over = form.assignees.length > (Number(form.maxSize) || 2)

  return (
    <Modal open onClose={onClose} title={isNew ? 'New event' : form.name} wide>
      <form onSubmit={save} className="space-y-4">
        {isStaff && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="label" htmlFor="ename">Event name</label>
              <input id="ename" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="etype">Type</label>
              <select id="etype" className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="emax">Team size</label>
              <input id="emax" type="number" min={1} max={6} className="input" value={form.maxSize} onChange={(e) => set('maxSize', e.target.value)} />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="estatus">Status</label>
            <select id="estatus" className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {Object.entries(EVENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="eprog">Progress: {form.progress}%</label>
            <input id="eprog" type="range" min={0} max={100} step={5} className="mt-2 w-full accent-brand-700" value={form.progress} onChange={(e) => set('progress', Number(e.target.value))} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="enotes">Notes</label>
          <textarea id="enotes" rows={3} className="input" placeholder="Build status, topics to cover, what's next…" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        {isStaff && (
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="label mb-0">Assign members</span>
              <span className={`text-xs ${over ? 'font-semibold text-red-700' : 'text-muted'}`}>
                {form.assignees.length} selected{over && ' — over team size'}
              </span>
            </div>
            <div className="grid max-h-64 gap-1 overflow-y-auto border border-rule p-2 sm:grid-cols-2">
              {roster.map((m) => {
                const checked = form.assignees.includes(m.id)
                const load = (loadByUid[m.id] ?? 0) - (ev.assignees?.includes(m.id) ? 1 : 0) + (checked ? 1 : 0)
                return (
                  <label key={m.id} className={`flex cursor-pointer items-center gap-2 px-2 py-2 text-sm ${checked ? 'bg-brand-50' : 'hover:bg-board'}`}>
                    <input type="checkbox" className="accent-brand-700" checked={checked} onChange={() => toggle(m.id)} />
                    <span className="flex-1 truncate">{m.name}</span>
                    <span className={`text-xs ${load > 4 ? 'font-semibold text-red-700' : 'text-muted'}`}>{load} ev</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        <ErrorNote error={error} />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
          {isStaff && !isNew ? (
            <button type="button" className="btn-ghost text-red-700 hover:bg-red-50" onClick={remove}>
              <Icon name="trash" className="h-4 w-4" /> Delete event
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1 sm:flex-none" onClick={onClose}>Cancel</button>
            <button className="btn-primary flex-1 sm:flex-none" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
