import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { generateJoinCode, isStaffRole } from './constants'
import { useCollection } from './hooks'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = still loading
  const [profile, setProfile] = useState(undefined)
  const [member, setMember] = useState(undefined)
  const [team, setTeam] = useState(undefined)
  const deleting = useRef(false)

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u ?? null)), [])

  // users/{uid}
  useEffect(() => {
    if (!user) {
      setProfile(user === null ? null : undefined)
      return
    }
    const ref = doc(db, 'users', user.uid)
    return onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() })
      } else if (!deleting.current) {
        // Profile missing (e.g. sign-up interrupted) — recreate it.
        const fresh = {
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          teamId: null,
          createdAt: serverTimestamp(),
        }
        await setDoc(ref, fresh)
      }
    })
  }, [user])

  const teamId = profile?.teamId ?? null

  // teams/{teamId}/members/{uid}
  useEffect(() => {
    if (profile === undefined) return
    if (!teamId) {
      setMember(null)
      return
    }
    setMember(undefined)
    return onSnapshot(
      doc(db, 'teams', teamId, 'members', user.uid),
      (snap) => setMember(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      () => setMember(null),
    )
  }, [teamId, profile === undefined, user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeTeamId = member ? teamId : null

  // teams/{teamId}
  useEffect(() => {
    if (!activeTeamId) {
      setTeam(null)
      return
    }
    setTeam(undefined)
    return onSnapshot(
      doc(db, 'teams', activeTeamId),
      (snap) => setTeam(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      () => setTeam(null),
    )
  }, [activeTeamId])

  const roster = useCollection(
    activeTeamId ? query(collection(db, 'teams', activeTeamId, 'members'), orderBy('name')) : null,
    activeTeamId,
  )

  const value = useMemo(() => {
    const role = member?.role ?? null
    return {
      user,
      profile,
      member,
      team,
      teamId: activeTeamId,
      role,
      isCoach: role === 'coach',
      isStaff: isStaffRole(role),
      roster: roster.data,
      loading:
        user === undefined ||
        (user && (profile === undefined || member === undefined)) ||
        (member && team === undefined),

      async signUp({ name, email, password }) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: name })
        await setDoc(doc(db, 'users', cred.user.uid), {
          name,
          email,
          teamId: null,
          createdAt: serverTimestamp(),
        })
      },

      signIn: ({ email, password }) => signInWithEmailAndPassword(auth, email, password),
      resetPassword: (email) => sendPasswordResetEmail(auth, email),
      logout: () => signOut(auth),

      async createTeam({ name, school }) {
        const teamRef = doc(collection(db, 'teams'))
        const joinCode = generateJoinCode()
        // Order matters: the security rules check each write against the previous ones.
        await setDoc(teamRef, {
          name,
          school,
          joinCode,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        })
        await setDoc(doc(db, 'teams', teamRef.id, 'members', user.uid), {
          name: profile.name,
          email: profile.email,
          role: 'coach',
          joinedAt: serverTimestamp(),
        })
        await setDoc(doc(db, 'joinCodes', joinCode), { teamId: teamRef.id })
        await updateDoc(doc(db, 'users', user.uid), { teamId: teamRef.id })
      },

      async joinTeam(rawCode) {
        const code = rawCode.trim().toUpperCase()
        const snap = await getDoc(doc(db, 'joinCodes', code))
        if (!snap.exists()) throw new Error('That join code was not found. Double-check it with your coach.')
        const targetTeamId = snap.data().teamId
        await setDoc(doc(db, 'teams', targetTeamId, 'members', user.uid), {
          name: profile.name,
          email: profile.email,
          role: 'student',
          joinCode: code,
          joinedAt: serverTimestamp(),
        })
        await updateDoc(doc(db, 'users', user.uid), { teamId: targetTeamId })
      },

      async leaveTeam() {
        await deleteDoc(doc(db, 'teams', activeTeamId, 'members', user.uid))
        await updateDoc(doc(db, 'users', user.uid), { teamId: null })
      },

      /**
       * Permanently deletes the signed-in user's account: their practice scores,
       * team membership, profile, and finally the Firebase Auth login. Resources,
       * announcements, and replies they posted stay with the team.
       */
      async deleteAccount(password) {
        const current = auth.currentUser
        await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, password))
        deleting.current = true
        try {
          if (activeTeamId) {
            const mine = await getDocs(
              query(collection(db, 'teams', activeTeamId, 'scores'), where('studentUid', '==', current.uid)),
            )
            const batch = writeBatch(db)
            mine.forEach((d) => batch.delete(d.ref))
            await batch.commit()
            // Last one out: retire the join code so nobody joins an empty team.
            const othersLeft = roster.some((m) => m.id !== current.uid)
            if (!othersLeft && team?.joinCode) await deleteDoc(doc(db, 'joinCodes', team.joinCode)).catch(() => {})
          }
          await deleteDoc(doc(db, 'users', current.uid))
          if (activeTeamId) await deleteDoc(doc(db, 'teams', activeTeamId, 'members', current.uid))
          await deleteUser(current)
        } finally {
          deleting.current = false
        }
      },

      async updateName(name) {
        await updateProfile(user, { displayName: name })
        await updateDoc(doc(db, 'users', user.uid), { name })
        if (activeTeamId) {
          await updateDoc(doc(db, 'teams', activeTeamId, 'members', user.uid), { name })
        }
      },
    }
  }, [user, profile, member, team, activeTeamId, roster.data])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
