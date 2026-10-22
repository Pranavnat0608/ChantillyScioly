import { useEffect } from 'react'
import { ROLES, initials } from '../lib/constants'

export function Badge({ map, value, children }) {
  const entry = map?.[value]
  return <span className={`chip ${entry?.className ?? 'bg-board text-ink'}`}>{children ?? entry?.label ?? value}</span>
}

export function RoleBadge({ role }) {
  return <Badge map={ROLES} value={role} />
}

export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'h-6 w-6 text-[11px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-base' }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center bg-brand-100 font-display text-brand-800 ${sizes[size]}`}
      title={name}
    >
      {initials(name) || '?'}
    </span>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="cut text-3xl leading-none text-ink sm:text-[2.75rem]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/70 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        className={`card max-h-[92vh] w-full overflow-y-auto p-5 sm:p-6 ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-5 flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
          <h2 className="cut text-xl leading-tight">{title}</h2>
          <button className="btn-ghost -mr-2 px-2" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, children }) {
  return (
    <div className="flex flex-col items-start gap-1 border-2 border-dashed border-ink/30 bg-white/60 px-6 py-10">
      <Icon name={icon} className="mb-2 h-6 w-6 text-brand-700" />
      <p className="cut text-lg">{title}</p>
      {children && <div className="max-w-md text-sm text-muted">{children}</div>}
    </div>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
      <span className="h-4 w-4 animate-spin border-2 border-brand-200 border-t-brand-700" />
      {label}
    </div>
  )
}

export function ErrorNote({ error }) {
  if (!error) return null
  return <p className="border-2 border-red-700 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{friendlyError(error)}</p>
}

export function friendlyError(error) {
  const code = error?.code ?? ''
  const map = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'No account with that email.',
    'auth/email-already-in-use': 'An account with that email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'That email address is not valid.',
    'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
    'permission-denied': "You don't have permission to do that.",
  }
  return map[code] ?? error?.message ?? String(error)
}

const ICONS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm13 9v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  flask: 'M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Zm12-3a5 5 0 0 1 0 8m3-11a9 9 0 0 1 0 14',
  calendar: 'M8 2v4m8-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  plus: 'M12 5v14M5 12h14',
  x: 'M18 6 6 18M6 6l12 12',
  trash: 'M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6',
  pin: 'M12 17v5M9 3h6l-1 7 4 3v2H6v-2l4-3z',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  download: 'M12 3v12m0 0 5-5m-5 5-5-5M4 21h16',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2m3.5-7h13L22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.5 7.5 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  check: 'M20 6 9 17l-5-5',
  map: 'M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
}

export function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}
