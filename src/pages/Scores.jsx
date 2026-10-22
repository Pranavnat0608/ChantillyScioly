import { useMemo, useState } from 'react'
import { addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { memberName, teamCol, useEvents, useScores } from '../lib/teamData'
import { formatDate } from '../lib/constants'
import { EmptyState, ErrorNote, Icon, Modal, PageHeader, Spinner } from '../components/ui'

const LINE_COLORS = ['#4b2a8a', '#c99a06', '#141018', '#a98fd4', '#0f7a6c', '#b4472f']
const pct = (s) => (s.maxScore ? Math.round((s.score / s.maxScore) * 1000) / 10 : 0)

export default function Scores() {
  const { user, isStaff, roster, teamId } = useAuth()
  const { data: scores, loading } = useScores()
  const { data: events } = useEvents()
  const [selected, setSelected] = useState('')
  const [adding, setAdding] = useState(false)

  const eventName = (id) => events.find((e) => e.id === id)?.name ?? 'Deleted event'

  const byEvent = useMemo(() => {
    const map = {}
    for (const s of scores) (map[s.eventId] ??= []).push(s)
    return Object.entries(map)
      .map(([eventId, list]) => {
        const ps = list.map(pct)
        const avg = ps.reduce((a, b) => a + b, 0) / ps.length
        const half = Math.max(1, Math.floor(ps.length / 2))
        const trend = ps.length >= 2 ? mean(ps.slice(-half)) - mean(ps.slice(0, half)) : 0
        return { eventId, count: list.length, avg, best: Math.max(...ps), trend }
      })
      .sort((a, b) => b.count - a.count)
  }, [scores])

  const activeEvent = selected || byEvent[0]?.eventId || ''
  const eventScores = scores.filter((s) => s.eventId === activeEvent)
  const students = [...new Set(eventScores.map((s) => s.studentUid))]
  // One row per date so teammates who took the same test share an x position.
  const chartData = Object.values(
    eventScores.reduce((rows, s) => {
      const row = (rows[s.date] ??= { date: s.date, test: s.testName })
      row[s.studentUid] = pct(s)
      return rows
    }, {}),
  )

  async function remove(s) {
    if (!confirm(`Delete the score for "${s.testName}"?`)) return
    await deleteDoc(doc(db, 'teams', teamId, 'scores', s.id))
  }

  return (
    <>
      <PageHeader
        title="Practice Scores"
        subtitle={isStaff ? 'Track every practice test across the team.' : 'Your practice test history and progress.'}
        actions={
          <button className="btn-primary" onClick={() => setAdding(true)} disabled={!events.length}>
            <Icon name="plus" className="h-4 w-4" /> Log score
          </button>
        }
      />

      {loading ? (
        <Spinner />
      ) : scores.length === 0 ? (
        <EmptyState icon="chart" title="No scores logged yet">
          After each practice test, log the score here to see averages and trends by event.
        </EmptyState>
      ) : (
        <>
          <div className="mb-8 grid gap-6 lg:grid-cols-[18rem_1fr]">
          <div className="card self-start">
            <h2 className="cut border-b-2 border-ink px-4 py-3 text-base">By event</h2>
            <ul>
              {byEvent.map((e) => (
                <li key={e.eventId}>
                  <button
                    onClick={() => setSelected(e.eventId)}
                    aria-pressed={activeEvent === e.eventId}
                    className={`grid w-full grid-cols-[1fr_auto] gap-x-3 border-b border-rule px-4 py-3 text-left last:border-0 ${
                      activeEvent === e.eventId ? 'bg-brand-700 text-white' : 'hover:bg-gold-soft'
                    }`}
                  >
                    <span className="truncate text-sm font-bold">{eventName(e.eventId)}</span>
                    <span className="text-sm font-bold">{e.avg.toFixed(1)}%</span>
                    <span className={`text-xs ${activeEvent === e.eventId ? 'text-brand-100' : 'text-muted'}`}>{e.count} {e.count === 1 ? 'test' : 'tests'}</span>
                    {e.count >= 2 ? (
                      <span className={`text-xs font-bold ${activeEvent === e.eventId ? 'text-gold' : e.trend >= 0 ? 'text-brand-800' : 'text-red-700'}`}>
                        {e.trend >= 0 ? '+' : '−'}{Math.abs(e.trend).toFixed(1)}
                      </span>
                    ) : <span />}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="cut text-base">{eventName(activeEvent)} trend</h2>
              <select className="input sm:w-64" value={activeEvent} onChange={(e) => setSelected(e.target.value)} aria-label="Event">
                {byEvent.map((e) => <option key={e.eventId} value={e.eventId}>{eventName(e.eventId)}</option>)}
              </select>
            </div>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#ddd8e6" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { month: 'short', day: 'numeric' })} tick={{ fontSize: 11, fill: '#5b546a' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5b546a' }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    labelFormatter={(d, p) => `${formatDate(d)}${p?.[0]?.payload?.test ? ` · ${p[0].payload.test}` : ''}`}
                    formatter={(v, uid) => [`${v}%`, memberName(roster, uid)]}
                    contentStyle={{ borderRadius: 2, border: '2px solid #141018', fontSize: 12 }}
                  />
                  {students.length > 1 && <Legend formatter={(uid) => memberName(roster, uid)} wrapperStyle={{ fontSize: 12 }} />}
                  {students.map((uid, i) => (
                    <Line key={uid} dataKey={uid} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2.5} dot={{ r: 3.5 }} connectNulls type="monotone" isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-ink text-left text-xs font-bold text-ink uppercase">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Event</th>
                    {isStaff && <th className="px-4 py-3">Student</th>}
                    <th className="px-4 py-3">Test</th>
                    <th className="px-4 py-3 text-right">Score</th>
                    <th className="w-10 px-2 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {[...scores].reverse().map((s) => (
                    <tr key={s.id} className="hover:bg-board">
                      <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(s.date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{eventName(s.eventId)}</td>
                      {isStaff && <td className="px-4 py-3 whitespace-nowrap">{memberName(roster, s.studentUid)}</td>}
                      <td className="px-4 py-3 text-muted">{s.testName}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="font-semibold">{pct(s)}%</span>
                        <span className="ml-2 text-xs text-muted">{s.score}/{s.maxScore}</span>
                      </td>
                      <td className="px-2 py-3">
                        {(isStaff || s.studentUid === user.uid) && (
                          <button className="p-1 text-muted hover:bg-red-50 hover:text-red-700" onClick={() => remove(s)} aria-label="Delete score">
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {adding && <AddScoreModal events={events} onClose={() => setAdding(false)} />}
    </>
  )
}

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function AddScoreModal({ events, onClose }) {
  const { user, isStaff, roster, teamId } = useAuth()
  const mine = events.filter((e) => e.assignees?.includes(user.uid))
  const options = isStaff ? events : mine.length ? mine : events
  const [form, setForm] = useState({
    eventId: options[0]?.id ?? '',
    studentUid: user.uid,
    testName: '',
    score: '',
    maxScore: '100',
    date: new Date().toLocaleDateString('en-CA'),
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Staff: default the student to someone assigned to the chosen event.
  const ev = events.find((e) => e.id === form.eventId)
  const studentChoices = isStaff
    ? [...roster].sort((a, b) => Number(ev?.assignees?.includes(b.id)) - Number(ev?.assignees?.includes(a.id)))
    : []

  async function submit(e) {
    e.preventDefault()
    const score = Number(form.score)
    const maxScore = Number(form.maxScore)
    if (!(maxScore > 0) || score < 0 || score > maxScore) {
      setError(new Error('Score must be between 0 and the max score.'))
      return
    }
    setBusy(true)
    try {
      await addDoc(teamCol(teamId, 'scores'), {
        eventId: form.eventId,
        studentUid: isStaff ? form.studentUid : user.uid,
        testName: form.testName.trim(),
        score,
        maxScore,
        date: form.date,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })
      onClose()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Log a practice score">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="sevent">Event</label>
          <select id="sevent" className="input" value={form.eventId} onChange={set('eventId')} required>
            {options.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        {isStaff && (
          <div>
            <label className="label" htmlFor="sstudent">Student</label>
            <select id="sstudent" className="input" value={form.studentUid} onChange={set('studentUid')}>
              {studentChoices.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{ev?.assignees?.includes(m.id) ? ' (assigned)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="stest">Test name</label>
          <input id="stest" className="input" required placeholder="e.g. 2025 MIT Invitational" value={form.testName} onChange={set('testName')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="sscore">Score</label>
            <input id="sscore" type="number" step="any" min={0} className="input" required value={form.score} onChange={set('score')} />
          </div>
          <div>
            <label className="label" htmlFor="smax">Out of</label>
            <input id="smax" type="number" step="any" min={1} className="input" required value={form.maxScore} onChange={set('maxScore')} />
          </div>
          <div>
            <label className="label" htmlFor="sdate">Date</label>
            <input id="sdate" type="date" className="input px-2" required value={form.date} onChange={set('date')} />
          </div>
        </div>
        <ErrorNote error={error} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save score'}</button>
        </div>
      </form>
    </Modal>
  )
}
