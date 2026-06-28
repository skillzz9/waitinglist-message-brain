import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, FirestoreError } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

export async function addToWaitlist(email: string): Promise<{ ok: true } | { ok: false; reason: 'invalid' | 'duplicate' | 'error'; message?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    await setDoc(
      doc(db, 'waitlist', trimmed),
      { email: trimmed, createdAt: serverTimestamp() },
      { merge: false },
    );
    return { ok: true };
  } catch (err) {
    // Rules allow `create` but block `update` — so a duplicate email
    // surfaces as `permission-denied` and we treat it as already-on-the-list.
    if (err instanceof FirestoreError && err.code === 'permission-denied') {
      return { ok: false, reason: 'duplicate' };
    }
    console.error('addToWaitlist failed', err);
    return { ok: false, reason: 'error', message: err instanceof Error ? err.message : String(err) };
  }
}
