import { useState } from 'react'
import { addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { teamCol, useEvents, useResources } from '../lib/teamData'
import { RESOURCE_TYPES, timeAgo } from '../lib/constants'
import { Badge, EmptyState, ErrorNote, Icon, Modal, PageHeader, Spinner } from '../components/ui'

const MAX_FILE_MB = 20

export default function Resources() {
  const { user, isStaff, teamId } = useAuth()
  const { data: resources, loading } = useResources()
  const { data: events } = useEvents()
  const [eventFilter, setEventFilter] = useState(() => new URLSearchParams(location.search).get('event') ?? 'all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [open, setOpen] = useState(null)

  const myEventIds = new Set(events.filter((e) => e.assignees?.includes(user.uid)).map((e) => e.id))
  const eventName = (id) => (id ? events.find((e) => e.id === id)?.name ?? 'Deleted event' : 'General')

  const visible = resources.filter((r) => {
    if (eventFilter === 'mine' && !myEventIds.has(r.eventId)) return false
    if (eventFilter === 'general' && r.eventId) return false
    if (!['all', 'mine', 'general'].includes(eventFilter) && r.eventId !== eventFilter) return false
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      if (!r.title.toLowerCase().includes(s) && !(r.body ?? '').toLowerCase().includes(s)) return false
    }
    return true
  })

  async function remove(r) {
    if (!confirm(`Delete "${r.title}"?`)) return
    if (r.filePath && storage) await deleteObject(ref(storage, r.filePath)).catch(() => {})
    await deleteDoc(doc(db, 'teams', teamId, 'resources', r.id))
    setOpen(null)
  }

  return (
    <>
      <PageHeader
        title="Resources"
        subtitle="Study guides, rules, notes, and practice tests for every event."
        actions={
          <button className="btn-primary" onClick={() => setAdding(true)}>
            <Icon name="plus" className="h-4 w-4" /> Add resource
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-muted" />
          <input className="input pl-9" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} aria-label="Filter by event">
          <option value="all">All events</option>
          <option value="mine">My events</option>
          <option value="general">General (team-wide)</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
          <option value="all">All types</option>
          {Object.entries(RESOURCE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState icon="book" title={resources.length ? 'No resources match' : 'No resources yet'}>
          {resources.length ? 'Try a different filter.' : 'Share the first study guide, rules PDF, or set of notes.'}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((r) => (
            <button key={r.id} onClick={() => setOpen(r)} className="card flex gap-3 p-4 text-left transition-colors hover:bg-gold-soft">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-700 text-white">
                <Icon name={r.fileUrl ? 'file' : r.url ? 'link' : 'book'} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{r.title}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge map={RESOURCE_TYPES} value={r.type} />
                  <span className="text-xs font-bold text-ink">{eventName(r.eventId)}</span>
                </span>
                <span className="mt-2 block text-xs text-muted">
                  {r.authorName} · {timeAgo(r.createdAt)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {adding && <AddResourceModal events={events} defaultEvent={eventFilter} onClose={() => setAdding(false)} />}

      {open && (
        <Modal open onClose={() => setOpen(null)} title={open.title} wide>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge map={RESOURCE_TYPES} value={open.type} />
            <span className="text-xs font-bold text-ink">{eventName(open.eventId)}</span>
            <span className="text-xs text-muted">Posted by {open.authorName} · {timeAgo(open.createdAt)}</span>
          </div>
          {open.body && <div className="mb-4 bg-board/60 p-4 text-sm whitespace-pre-wrap">{open.body}</div>}
          <div className="flex flex-wrap gap-2">
            {open.url && (
              <a href={open.url} target="_blank" rel="noreferrer" className="btn-primary">
                <Icon name="link" className="h-4 w-4" /> Open link
              </a>
            )}
            {open.fileUrl && (
              <a href={open.fileUrl} target="_blank" rel="noreferrer" className="btn-primary">
                <Icon name="download" className="h-4 w-4" /> {open.fileName ?? 'Download file'}
              </a>
            )}
            {(isStaff || open.authorUid === user.uid) && (
              <button className="btn-ghost ml-auto text-red-700 hover:bg-red-50" onClick={() => remove(open)}>
                <Icon name="trash" className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

function AddResourceModal({ events, defaultEvent, onClose }) {
  const { user, profile, teamId } = useAuth()
  const startEvent = events.some((e) => e.id === defaultEvent) ? defaultEvent : ''
  const [form, setForm] = useState({ title: '', type: 'guide', eventId: startEvent, url: '', body: '' })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    if (!form.url && !form.body && !file) {
      setError(new Error('Add a link, some notes, or a file.'))
      return
    }
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(new Error(`Files must be under ${MAX_FILE_MB} MB.`))
      return
    }
    setBusy(true)
    setError(null)
    try {
      let fileFields = {}
      if (file) {
        const path = `teams/${teamId}/resources/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`
        const snap = await uploadBytes(ref(storage, path), file, { contentType: file.type })
        fileFields = { filePath: path, fileName: file.name, fileUrl: await getDownloadURL(snap.ref) }
      }
      let url = form.url.trim()
      if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`
      await addDoc(teamCol(teamId, 'resources'), {
        title: form.title.trim(),
        type: form.type,
        eventId: form.eventId || null,
        url: url || null,
        body: form.body.trim() || null,
        ...fileFields,
        authorUid: user.uid,
        authorName: profile.name,
        createdAt: serverTimestamp(),
      })
      onClose()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Add a resource" wide>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="rtitle">Title</label>
          <input id="rtitle" className="input" required placeholder="e.g. Astronomy DSO cheat sheet" value={form.title} onChange={set('title')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="revent">Event</label>
            <select id="revent" className="input" value={form.eventId} onChange={set('eventId')}>
              <option value="">General (team-wide)</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="rtype">Type</label>
            <select id="rtype" className="input" value={form.type} onChange={set('type')}>
              {Object.entries(RESOURCE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="rurl">Link <span className="font-normal text-muted">(Google Drive, PDF, website…)</span></label>
          <input id="rurl" className="input" placeholder="https://" value={form.url} onChange={set('url')} />
        </div>
        <div>
          <label className="label" htmlFor="rbody">Notes</label>
          <textarea id="rbody" rows={5} className="input" placeholder="Paste notes, key formulas, or a summary…" value={form.body} onChange={set('body')} />
        </div>
        {storage ? (
          <div>
            <label className="label" htmlFor="rfile">File <span className="font-normal text-muted">(up to {MAX_FILE_MB} MB)</span></label>
            <input id="rfile" type="file" className="block w-full text-sm file:mr-3 file:border-2 file:border-ink file:bg-white file:px-3 file:py-2 file:font-semibold file:text-brand-700" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        ) : (
          <p className="text-xs text-muted">Tip: upload files to Google Drive and paste the share link above.</p>
        )}
        <ErrorNote error={error} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Post resource'}</button>
        </div>
      </form>
    </Modal>
  )
}
