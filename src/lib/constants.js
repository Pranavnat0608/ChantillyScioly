export const ROLES = {
  coach: { label: 'Coach', className: 'bg-ink text-white' },
  captain: { label: 'Captain', className: 'bg-gold text-ink' },
  student: { label: 'Student', className: 'bg-board text-muted' },
}

// Event type is descriptive, not state, so it renders as plain text.
export const EVENT_TYPES = {
  build: { label: 'Build', className: 'px-0 text-muted' },
  study: { label: 'Study', className: 'px-0 text-muted' },
  lab: { label: 'Lab', className: 'px-0 text-muted' },
  hybrid: { label: 'Hybrid', className: 'px-0 text-muted' },
}

export const EVENT_STATUS = {
  not_started: { label: 'Not started', className: 'bg-board text-muted' },
  in_progress: { label: 'In progress', className: 'bg-gold-soft text-ink' },
  ready: { label: 'Ready', className: 'bg-brand-700 text-white' },
}

export const RESOURCE_TYPES = {
  guide: { label: 'Study guide', className: 'px-0 text-muted' },
  rules: { label: 'Rules', className: 'px-0 text-muted' },
  notes: { label: 'Notes', className: 'px-0 text-muted' },
  test: { label: 'Practice test', className: 'px-0 text-muted' },
  link: { label: 'Link', className: 'px-0 text-muted' },
}

export const CALENDAR_TYPES = {
  tournament: { label: 'Tournament', className: 'bg-brand-700 text-white', dot: 'bg-brand-700' },
  deadline: { label: 'Deadline', className: 'bg-red-700 text-white', dot: 'bg-red-700' },
  practice: { label: 'Practice', className: 'bg-gold-soft text-ink', dot: 'bg-gold' },
  other: { label: 'Other', className: 'bg-board text-muted', dot: 'bg-muted' },
}

export function isStaffRole(role) {
  return role === 'coach' || role === 'captain'
}

export function generateJoinCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  for (const b of bytes) code += alphabet[b % alphabet.length]
  return code
}

export function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'string') return new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return null
}

export function formatDate(value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const d = toDate(value)
  return d ? d.toLocaleDateString(undefined, opts) : ''
}

export function timeAgo(value) {
  const d = toDate(value)
  if (!d) return 'just now'
  const s = Math.round((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return formatDate(d)
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}
