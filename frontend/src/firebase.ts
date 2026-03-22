import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export async function saveScore(
  name: string,
  score: number,
  mode: "manual" | "ai",
) {
  if (!name || score < 1) return;
  await addDoc(collection(db, "scores"), {
    name,
    score,
    mode,
    createdAt: serverTimestamp(),
  });
}

export async function getLeaderboardByMode(mode: "manual" | "ai") {
  const q = query(
    collection(db, "scores"),
    where("mode", "==", mode),
    orderBy("score", "desc"),
    limit(5),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data());
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
