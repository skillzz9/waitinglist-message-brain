import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

// Load .env.local manually so this works without --env-file
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

const FIRST = ['alex','jordan','taylor','casey','morgan','riley','jamie','avery','parker','quinn','sage','rowan','emery','finley','hayden','kai','micah','reese','remy','sky','aria','luca','mateo','noah','ava','ella','mila','zoe','ezra','sofia','liam','mia','leo','isla','theo','nora','iris','jude','elio','wren'];
const LAST  = ['smith','jones','lee','chen','patel','nguyen','kim','garcia','lopez','mendoza','okafor','silva','rossi','mueller','novak','kowalski','andersen','jensen','brown','martin','tanaka','hassan','khan','dubois','fischer','hernandez','singh','schmidt','adams','baker','clark','davis','evans','flores','green','hall','ito','jackson','kennedy','lewis'];
const DOMAINS = ['gmail.com','yahoo.com','outlook.com','icloud.com','proton.me','hey.com','fastmail.com','hotmail.com'];

const rand = arr => arr[Math.floor(Math.random() * arr.length)];

function generateEmails(count) {
  const set = new Set();
  while (set.size < count) {
    const n = Math.floor(Math.random() * 9999);
    set.add(`${rand(FIRST)}.${rand(LAST)}${n}@${rand(DOMAINS)}`);
  }
  return [...set];
}

const TOTAL = Number(process.argv[2]) || 1000;
const BATCH_SIZE = 500; // Firestore batch limit

const emails = generateEmails(TOTAL);
console.log(`Generated ${emails.length} unique emails. Writing to Firestore in batches of ${BATCH_SIZE}…`);

let written = 0;
for (let i = 0; i < emails.length; i += BATCH_SIZE) {
  const batch = writeBatch(db);
  const chunk = emails.slice(i, i + BATCH_SIZE);
  for (const email of chunk) {
    batch.set(doc(db, 'waitlist', email), {
      email,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
  written += chunk.length;
  console.log(`  ✓ ${written}/${emails.length}`);
}

console.log(`Done. ${written} emails written to the 'waitlist' collection.`);
process.exit(0);
