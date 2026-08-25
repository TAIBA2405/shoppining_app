import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, enableNetwork } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Diagnostic: warn if any config value is missing (env vars not set on host)
if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
  console.error('⚠️ Firebase config missing! Env vars not loaded:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId
  })
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Force long-polling to fix "client is offline" errors on hosted
// environments where WebChannel streaming is blocked.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
})

// Explicitly ensure Firestore network is enabled
enableNetwork(db).catch(e => console.warn('enableNetwork failed:', e))
