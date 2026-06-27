import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq < 0) continue;
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const BATCH_SIZE = 500;
let total = 0;

while (true) {
  const snap = await getDocs(collection(db, 'waitlist'));
  if (snap.empty) break;

  const docs = snap.docs.slice(0, BATCH_SIZE);
  const batch = writeBatch(db);
  for (const d of docs) batch.delete(doc(db, 'waitlist', d.id));
  await batch.commit();

  total += docs.length;
  console.log(`  ✗ deleted ${total}`);

  if (snap.size <= BATCH_SIZE) break;
}

console.log(`Done. ${total} docs deleted from 'waitlist'.`);
process.exit(0);
