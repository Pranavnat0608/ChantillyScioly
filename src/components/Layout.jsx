import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Icon, RoleBadge } from './ui'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'home', end: true },
  { to: '/events', label: 'Events', icon: 'flask' },
  { to: '/roster', label: 'Roster', icon: 'users' },
  { to: '/resources', label: 'Resources', icon: 'book' },
  { to: '/scores', label: 'Practice scores', icon: 'chart' },
  { to: '/announcements', label: 'Announcements', icon: 'megaphone' },
  { to: '/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

/** The Chargers logo mounted like a sheet on the board. */
export function Logo({ className = 'h-12 w-12' }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center border-2 border-ink bg-white p-1 ${className}`}>
      <img src="/logo.png" alt="Chantilly Chargers logo" className="h-full w-full object-contain" />
    </span>
  )
}

function Rail({ onNavigate }) {
  const { profile, role, logout } = useAuth()
  return (
    <div className="flex h-full flex-col bg-brand-700 text-white">
      <div className="flex items-center gap-3 px-5 pt-6 pb-6">
        <Logo className="h-14 w-14" />
        <p className="cut text-base leading-[1.05]">
          Chantilly
          <br />
          Science
          <br />
          Olympiad
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `my-1 flex items-center gap-3 px-3 py-2 text-base font-semibold transition-colors ${
                isActive ? 'bg-white text-brand-800' : 'text-brand-100 hover:bg-brand-800 hover:text-white'
              }`
            }
          >
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t-2 border-brand-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{profile?.name}</p>
            <RoleBadge role={role} />
          </div>
          <button onClick={logout} className="p-2 text-brand-100 hover:bg-brand-800 hover:text-white" title="Sign out" aria-label="Sign out">
            <Icon name="logout" className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r-2 border-ink lg:block">
        <Rail />
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-ink bg-brand-700 px-4 py-2 text-white lg:hidden">
        <button onClick={() => setOpen(true)} className="-ml-1 p-2 hover:bg-brand-800" aria-label="Open menu">
          <Icon name="menu" />
        </button>
        <Logo className="h-9 w-9" />
        <span className="cut truncate text-sm">Chantilly Science Olympiad</span>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brand-900/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r-2 border-ink">
            <Rail onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  )
}
