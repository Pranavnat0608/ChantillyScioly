import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useAnnouncements, useCalendar, useEvents, useResources, useScores } from '../lib/teamData'
import { CALENDAR_TYPES, EVENT_STATUS, EVENT_TYPES, RESOURCE_TYPES, formatDate, timeAgo, toDate } from '../lib/constants'
import { Badge, Icon } from '../components/ui'

const todayIso = () => new Date().toLocaleDateString('en-CA')
const pct = (s) => (s.maxScore ? (s.score / s.maxScore) * 100 : 0)

export default function Dashboard() {
  const { user, isStaff, roster } = useAuth()
  const { data: events } = useEvents()
  const { data: calendar } = useCalendar()
  const { data: announcements } = useAnnouncements()

  const today = todayIso()
  const upcoming = calendar.filter((c) => (c.endDate || c.date) >= today)
  const next = upcoming.find((c) => c.type === 'tournament')
  const days = next ? Math.max(0, Math.round((toDate(next.date) - toDate(today)) / 86400000)) : null
  const myEvents = events.filter((e) => e.assignees?.includes(user.uid))

  return (
    <>
      <div className="mb-8 border-b-2 border-ink pb-4">
        <h1 className="cut text-3xl leading-none sm:text-[2.75rem]">My events</h1>
        <p className="mt-2 text-sm text-muted">
          {next ? (
            <>
              <b className="text-ink">{days === 0 ? 'Today' : `${days} ${days === 1 ? 'day' : 'days'}`}</b>
              {days === 0 ? ': ' : ' until '}
              {next.title}, {formatDate(next.date, { month: 'long', day: 'numeric' })}
            </>
          ) : (
            'No tournament on the calendar yet.'
          )}
        </p>
      </div>

      {myEvents.length === 0 ? (
        <div className="board">
          <div className="mounted p-6">
            <p className="cut text-lg">No events assigned to you</p>
            <p className="mt-1 max-w-lg text-sm text-muted">
              {isStaff
                ? 'Coaches and captains can assign themselves on the Event Board too. Your team overview is below.'
                : 'Once your coach assigns you an event, its study materials, team and scores show up here.'}
            </p>
            <Link to="/events" className="btn-secondary mt-4">Open the Event Board</Link>
          </div>
        </div>
      ) : (
        <TriFold events={myEvents} roster={roster} />
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          {isStaff && <Gaps events={events} roster={roster} />}
          <Sheet title="Announcements" to="/announcements">
            {announcements.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted">Nothing posted yet.</p>
            ) : (
              <ul className="divide-y divide-rule">
                {announcements.slice(0, 3).map((a) => (
                  <li key={a.id} className="px-4 py-4">
                    <p className="flex items-center gap-2 font-bold">
                      {a.pinned && <Icon name="pin" className="h-3.5 w-3.5 text-brand-700" />}
                      {a.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{a.body}</p>
                    <p className="mt-1 text-xs text-muted">{a.authorName} · {timeAgo(a.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Sheet>
        </div>

        <Sheet title="Coming up" to="/calendar">
          {upcoming.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted">No dates on the calendar.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {upcoming.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-baseline gap-3 px-4 py-3">
                  <span className="w-14 shrink-0 text-sm font-bold">{formatDate(c.date, { month: 'short', day: 'numeric' })}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{c.title}</span>
                    <span className={`chip mt-1 ${CALENDAR_TYPES[c.type]?.className}`}>{CALENDAR_TYPES[c.type]?.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      </div>
    </>
  )
}

/** One event as a science-fair tri-fold: Prepare | The event | Results. */
function TriFold({ events, roster }) {
  const { user } = useAuth()
  const [activeId, setActiveId] = useState(events[0].id)
  const ev = events.find((e) => e.id === activeId) ?? events[0]
  const { data: resources } = useResources()
  const { data: scores } = useScores()

  const evResources = resources.filter((r) => r.eventId === ev.id)
  const myScores = scores.filter((s) => s.eventId === ev.id && s.studentUid === user.uid)
  const avg = myScores.length ? myScores.reduce((a, s) => a + pct(s), 0) / myScores.length : null
  const team = (ev.assignees ?? []).map((uid) => roster.find((m) => m.id === uid)).filter(Boolean)

  return (
    <section className="min-w-0">
      {events.length > 1 && (
        <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="My events">
          {events.map((e) => (
            <button
              key={e.id}
              role="tab"
              aria-selected={e.id === ev.id}
              onClick={() => setActiveId(e.id)}
              className={`shrink-0 border-2 border-b-0 border-ink px-4 py-2 text-sm font-bold ${
                e.id === ev.id ? 'bg-brand-700 text-white' : 'bg-white text-ink hover:bg-gold-soft'
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}

      <div key={ev.id} className="fold-in board grid grid-cols-1 gap-6 border-2 border-ink md:grid-cols-[1fr_1.3fr_1fr] md:gap-0">
        <Panel label="Prepare" className="md:order-1">
          <div className="mounted flex flex-1 flex-col">
            {evResources.length === 0 ? (
              <p className="p-4 text-sm text-muted">No resources posted for this event yet.</p>
            ) : (
              <ul className="flex-1 divide-y divide-rule">
                {evResources.slice(0, 6).map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.url || r.fileUrl || `/resources?event=${ev.id}`}
                      target={r.url || r.fileUrl ? '_blank' : undefined}
                      rel="noreferrer"
                      className="flex items-baseline justify-between gap-2 px-4 py-3 text-sm hover:bg-gold-soft"
                    >
                      <span className="truncate font-semibold">{r.title}</span>
                      <span className="shrink-0 text-xs text-muted">{RESOURCE_TYPES[r.type]?.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <Link to={`/resources?event=${ev.id}`} className="mt-auto flex items-center justify-between border-t-2 border-ink px-4 py-2 text-xs font-bold uppercase hover:bg-gold-soft">
              All resources
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          </div>
        </Panel>

        <Panel className="md:order-2 md:border-x-2 md:border-dashed md:border-brand-400">
          <div className="mounted bg-gold px-4 py-5 text-center">
            <h2 className="cut text-2xl leading-tight sm:text-[1.75rem]">{ev.name}</h2>
            <p className="mt-1 text-xs font-bold tracking-wide uppercase">{EVENT_TYPES[ev.type]?.label} event</p>
          </div>
          <div className="mounted">
            <dl className="divide-y divide-rule text-sm">
              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <dt className="text-muted">Team</dt>
                <dd className="text-right font-semibold">{team.map((m) => m.name).join(', ') || '—'}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted">Status</dt>
                <dd><Badge map={EVENT_STATUS} value={ev.status ?? 'not_started'} /></dd>
              </div>
              <div className="px-4 py-3">
                <div className="flex justify-between">
                  <dt className="text-muted">Progress</dt>
                  <dd className="font-bold">{ev.progress ?? 0}%</dd>
                </div>
                <div className="mt-2 h-2 bg-board">
                  <div className="h-full bg-brand-700" style={{ width: `${ev.progress ?? 0}%` }} />
                </div>
              </div>
            </dl>
          </div>
        </Panel>

        <Panel label="Results" className="md:order-3">
          <div className="mounted flex flex-1 flex-col">
            {avg === null ? (
              <p className="p-4 text-sm text-muted">No practice tests logged for this event.</p>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-rule text-sm">
                  {[...myScores].reverse().slice(0, 5).map((s) => (
                    <li key={s.id} className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-2 px-4 py-2">
                      <span className="text-xs text-muted">{formatDate(s.date, { month: 'short', day: 'numeric' })}</span>
                      <span className="truncate">{s.testName}</span>
                      <span className="font-bold">{pct(s).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto flex items-baseline justify-between border-t-2 border-ink bg-brand-50 px-4 py-2">
                  <span className="text-xs font-bold uppercase">Average · {myScores.length} {myScores.length === 1 ? 'test' : 'tests'}</span>
                  <span className="cut text-lg text-brand-800">{avg.toFixed(1)}%</span>
                </p>
              </>
            )}
          </div>
          <Link to="/scores" className="btn-secondary w-full">Log a score</Link>
        </Panel>
      </div>
    </section>
  )
}

function Panel({ label, className = '', children }) {
  return (
    <div className={`flex min-w-0 flex-col gap-4 px-2 md:px-4 md:py-1 ${className}`}>
      {label && <h3 className="cut text-lg leading-none text-white">{label}</h3>}
      {children}
    </div>
  )
}

function Gaps({ events, roster }) {
  const open = events.filter((e) => (e.assignees?.length ?? 0) < (e.maxSize ?? 2))
  const idle = roster.filter((m) => m.role !== 'coach' && !events.some((e) => e.assignees?.includes(m.id)))
  return (
    <Sheet title="Gaps to fill" to="/events">
      <div className="grid divide-y-2 divide-ink sm:grid-cols-2 sm:divide-x-2 sm:divide-y-0">
        <div className="p-4">
          <p className="label">Open spots · {open.length}</p>
          {events.length === 0 ? (
            <p className="text-sm text-muted">No events on the board yet.</p>
          ) : open.length === 0 ? (
            <p className="text-sm text-muted">Every event is fully staffed.</p>
          ) : (
            <ul className="text-sm">
              {open.slice(0, 8).map((e) => (
                <li key={e.id} className="flex justify-between border-b border-rule py-2 last:border-0">
                  <span className="font-semibold">{e.name}</span>
                  <span className="text-muted">{e.assignees?.length ?? 0}/{e.maxSize ?? 2}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4">
          <p className="label">Members without events · {idle.length}</p>
          {idle.length === 0 ? (
            <p className="text-sm text-muted">{roster.length > 1 ? 'Everyone has an event.' : 'No members yet. Share your join code from the Roster.'}</p>
          ) : (
            <ul className="text-sm">
              {idle.slice(0, 8).map((m) => (
                <li key={m.id} className="border-b border-rule py-2 font-semibold last:border-0">{m.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  )
}

function Sheet({ title, to, children }) {
  return (
    <section className="card">
      <h2 className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
        <span className="cut text-base">{title}</span>
        <Link to={to} className="text-xs font-bold text-brand-700 uppercase hover:underline">View all</Link>
      </h2>
      {children}
    </section>
  )
}
