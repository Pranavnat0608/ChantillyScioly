import { useState } from 'react'
import { addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { teamCol, useCalendar } from '../lib/teamData'
import { CALENDAR_TYPES, formatDate, toDate } from '../lib/constants'
import { downloadIcs, googleCalendarUrl } from '../lib/ics'
import { Badge, EmptyState, ErrorNote, Icon, Modal, PageHeader, Spinner } from '../components/ui'

const todayIso = () => new Date().toLocaleDateString('en-CA')
const BLANK = { title: '', type: 'tournament', date: todayIso(), endDate: '', location: '', notes: '' }

export default function CalendarPage() {
  const { isStaff, team } = useAuth()
  const { data: items, loading } = useCalendar()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [editing, setEditing] = useState(null)
  const [showPast, setShowPast] = useState(false)

  const today = todayIso()
  const upcoming = items.filter((i) => (i.endDate || i.date) >= today)
  const past = items.filter((i) => (i.endDate || i.date) < today).reverse()

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Tournaments, registration deadlines, and practices."
        actions={
          <>
            <button className="btn-secondary" onClick={() => downloadIcs(upcoming, team?.name ?? 'Science Olympiad')} disabled={!upcoming.length}>
              <Icon name="download" className="h-4 w-4" /> Export .ics
            </button>
            {isStaff && (
              <button className="btn-primary" onClick={() => setEditing(BLANK)}>
                <Icon name="plus" className="h-4 w-4" /> Add date
              </button>
            )}
          </>
        }
      />

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <MonthGrid month={month} setMonth={setMonth} items={items} onPick={(it) => setEditing(it)} />

          <div>
            <h2 className="mb-3 font-semibold">Upcoming</h2>
            {upcoming.length === 0 ? (
              <EmptyState icon="calendar" title="Nothing scheduled">
                {isStaff ? 'Add your next tournament or deadline.' : 'Check back once your coach adds dates.'}
              </EmptyState>
            ) : (
              <div className="space-y-3">
                {upcoming.map((it) => <AgendaItem key={it.id} it={it} onClick={() => setEditing(it)} />)}
              </div>
            )}
            {past.length > 0 && (
              <>
                <button className="mt-5 text-xs font-semibold text-muted hover:text-ink" onClick={() => setShowPast((s) => !s)}>
                  {showPast ? 'Hide' : 'Show'} {past.length} past {past.length === 1 ? 'date' : 'dates'}
                </button>
                {showPast && (
                  <div className="mt-3 space-y-3 opacity-60">
                    {past.map((it) => <AgendaItem key={it.id} it={it} onClick={() => setEditing(it)} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {editing && <CalendarModal item={editing} canEdit={isStaff} onClose={() => setEditing(null)} />}
    </>
  )
}

export function AgendaItem({ it, onClick }) {
  const d = toDate(it.date)
  const days = Math.round((d - toDate(todayIso())) / 86400000)
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className="card flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-gold-soft">
      <span className="flex w-12 shrink-0 flex-col items-center bg-brand-700 py-2 text-white">
        <span className="text-[11px] font-bold uppercase">{d.toLocaleDateString(undefined, { month: 'short' })}</span>
        <span className="text-lg leading-none font-extrabold">{d.getDate()}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{it.title}</span>
        <span className="mt-1 flex items-center gap-2 text-xs text-muted">
          <Badge map={CALENDAR_TYPES} value={it.type} />
          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days > 0 ? `in ${days} days` : formatDate(it.date)}
        </span>
      </span>
    </Tag>
  )
}

function MonthGrid({ month, setMonth, items, onPick }) {
  const start = new Date(month)
  start.setDate(1 - start.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
  const today = todayIso()
  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1))

  const itemsOn = (iso) => items.filter((it) => iso >= it.date && iso <= (it.endDate || it.date))

  return (
    <div className="card p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="cut text-lg">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
        <div className="flex gap-1">
          <button className="btn-ghost px-2" onClick={() => shift(-1)} aria-label="Previous month"><Icon name="chevronLeft" className="h-4 w-4" /></button>
          <button className="btn-ghost px-3 text-xs" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button>
          <button className="btn-ghost px-2" onClick={() => shift(1)} aria-label="Next month"><Icon name="chevronRight" className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted uppercase">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="pb-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden border border-rule bg-ink/20">
        {cells.map((d) => {
          const iso = d.toLocaleDateString('en-CA')
          const inMonth = d.getMonth() === month.getMonth()
          const dayItems = itemsOn(iso)
          return (
            <div key={iso} className={`min-h-14 p-1 sm:min-h-20 sm:p-2 ${inMonth ? 'bg-white' : 'bg-board/60'}`}>
              <span
                className={`inline-flex h-6 w-6 items-center justify-center text-xs ${
                  iso === today ? 'bg-brand-700 font-bold text-white' : inMonth ? 'text-ink' : 'text-muted'
                }`}
              >
                {d.getDate()}
              </span>
              <div className="mt-1 space-y-1">
                {dayItems.slice(0, 2).map((it) => (
                  <button
                    key={it.id}
                    onClick={() => onPick(it)}
                    className={`block w-full truncate  px-1 py-1 text-left text-[11px] font-semibold sm:text-[11px] ${CALENDAR_TYPES[it.type]?.className}`}
                    title={it.title}
                  >
                    <span className="hidden sm:inline">{it.title}</span>
                    <span className={`inline-block h-1.5 w-1.5 sm:hidden ${CALENDAR_TYPES[it.type]?.dot}`} />
                  </button>
                ))}
                {dayItems.length > 2 && <span className="block px-1 text-[11px] text-muted">+{dayItems.length - 2}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarModal({ item, canEdit, onClose }) {
  const { teamId } = useAuth()
  const [form, setForm] = useState({ ...BLANK, ...item })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const isNew = !item.id
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  if (!canEdit) {
    return (
      <Modal open onClose={onClose} title={item.title}>
        <div className="space-y-3 text-sm">
          <Badge map={CALENDAR_TYPES} value={item.type} />
          <p className="flex items-center gap-2"><Icon name="calendar" className="h-4 w-4 text-muted" />{formatDate(item.date)}{item.endDate && item.endDate !== item.date && ` – ${formatDate(item.endDate)}`}</p>
          {item.location && <p className="flex items-center gap-2"><Icon name="map" className="h-4 w-4 text-muted" />{item.location}</p>}
          {item.notes && <p className="bg-board/60 p-3 whitespace-pre-wrap">{item.notes}</p>}
          <a className="btn-secondary" href={googleCalendarUrl(item)} target="_blank" rel="noreferrer">Add to Google Calendar</a>
        </div>
      </Modal>
    )
  }

  async function save(e) {
    e.preventDefault()
    if (form.endDate && form.endDate < form.date) {
      setError(new Error('End date must be on or after the start date.'))
      return
    }
    setBusy(true)
    try {
      const data = {
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        endDate: form.endDate || null,
        location: (form.location ?? '').trim() || null,
        notes: (form.notes ?? '').trim() || null,
      }
      if (isNew) await addDoc(teamCol(teamId, 'calendar'), { ...data, createdAt: serverTimestamp() })
      else await updateDoc(doc(db, 'teams', teamId, 'calendar', item.id), data)
      onClose()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete ${item.title}?`)) return
    await deleteDoc(doc(db, 'teams', teamId, 'calendar', item.id))
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'Add a date' : 'Edit date'}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="label" htmlFor="ctitle">Title</label>
          <input id="ctitle" className="input" required placeholder="e.g. Regional Tournament" value={form.title} onChange={set('title')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="ctype">Type</label>
            <select id="ctype" className="input px-2" value={form.type} onChange={set('type')}>
              {Object.entries(CALENDAR_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="cdate">Date</label>
            <input id="cdate" type="date" className="input px-2" required value={form.date} onChange={set('date')} />
          </div>
          <div>
            <label className="label" htmlFor="cend">Ends</label>
            <input id="cend" type="date" className="input px-2" value={form.endDate ?? ''} onChange={set('endDate')} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="cloc">Location</label>
          <input id="cloc" className="input" value={form.location ?? ''} onChange={set('location')} />
        </div>
        <div>
          <label className="label" htmlFor="cnotes">Notes</label>
          <textarea id="cnotes" rows={3} className="input" value={form.notes ?? ''} onChange={set('notes')} />
        </div>
        <ErrorNote error={error} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {!isNew ? (
            <button type="button" className="btn-ghost text-red-700 hover:bg-red-50" onClick={remove}>
              <Icon name="trash" className="h-4 w-4" /> Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            {!isNew && <a className="btn-secondary" href={googleCalendarUrl(item)} target="_blank" rel="noreferrer">Google Cal</a>}
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
