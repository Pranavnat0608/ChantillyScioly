import { collection, orderBy, query, where } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './AuthContext'
import { useCollection } from './hooks'

export function teamCol(teamId, name) {
  return collection(db, 'teams', teamId, name)
}

export function useEvents() {
  const { teamId } = useAuth()
  return useCollection(query(teamCol(teamId, 'events'), orderBy('name')), `events-${teamId}`)
}

export function useAnnouncements() {
  const { teamId } = useAuth()
  return useCollection(query(teamCol(teamId, 'announcements'), orderBy('createdAt', 'desc')), `ann-${teamId}`)
}

export function useCalendar() {
  const { teamId } = useAuth()
  return useCollection(query(teamCol(teamId, 'calendar'), orderBy('date')), `cal-${teamId}`)
}

export function useResources() {
  const { teamId } = useAuth()
  return useCollection(query(teamCol(teamId, 'resources'), orderBy('createdAt', 'desc')), `res-${teamId}`)
}

/** Staff see every score; students only their own (enforced by rules too). */
export function useScores() {
  const { teamId, user, isStaff } = useAuth()
  const base = teamCol(teamId, 'scores')
  const q = isStaff ? query(base, orderBy('date')) : query(base, where('studentUid', '==', user.uid), orderBy('date'))
  return useCollection(q, `scores-${teamId}-${isStaff}`)
}

export function memberName(roster, uid) {
  return roster.find((m) => m.id === uid)?.name ?? 'Former member'
}
