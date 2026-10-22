import { initializeApp, deleteApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

// File uploads need Cloud Storage, which requires the Blaze plan on new projects.
export const storageEnabled = import.meta.env.VITE_ENABLE_STORAGE === 'true'

export const app = isConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app && storageEnabled ? getStorage(app) : null

/**
 * Creates a Firebase Auth account for another person without signing the
 * current user out, by using a throwaway secondary app instance. The new
 * user's own profile doc is written while signed in as them, then a
 * password-reset email is sent so they can choose their own password.
 */
export async function createMemberAccount({ name, email, password, teamId }) {
  const secondary = initializeApp(firebaseConfig, `member-create-${Date.now()}`)
  try {
    const secAuth = getAuth(secondary)
    const cred = await createUserWithEmailAndPassword(secAuth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await setDoc(doc(getFirestore(secondary), 'users', cred.user.uid), {
      name,
      email,
      teamId,
      createdAt: serverTimestamp(),
    })
    try {
      await sendPasswordResetEmail(secAuth, email)
    } catch {
      // Non-fatal: the coach still has the temporary password.
    }
    await signOut(secAuth)
    return cred.user.uid
  } finally {
    await deleteApp(secondary)
  }
}
