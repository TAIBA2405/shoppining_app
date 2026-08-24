import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA_v7s5PanIg0zeKtWnfHf8DWWi0vuPF8U",
  authDomain: "styleverse-32c38.firebaseapp.com",
  projectId: "styleverse-32c38",
  storageBucket: "styleverse-32c38.firebasestorage.app",
  messagingSenderId: "488063988108",
  appId: "1:488063988108:web:de0faade824bf5414ca6a9"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
