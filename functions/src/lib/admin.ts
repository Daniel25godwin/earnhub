import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

/**
 * Single Admin SDK initialization point. Every function file imports `db`/`auth`/`storage`
 * from here rather than calling initializeApp() itself — Cloud Functions can cold-start
 * multiple times, so this guards against double-initialization.
 */
if (getApps().length === 0) {
  initializeApp()
}

export const db = getFirestore()
export const adminAuth = getAuth()
export const storage = getStorage()

// Firestore timestamps should never allow undefined to slip into documents —
// this setting throws immediately during development rather than silently
// dropping fields in production.
db.settings({ ignoreUndefinedProperties: false })
