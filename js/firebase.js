import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyA-aV__Xns8Spd9jTnVYVOkAoVZuSUM4wI",
  authDomain: "studentresult-8e735.firebaseapp.com",
  projectId: "studentresult-8e735",
  storageBucket: "studentresult-8e735.firebasestorage.app",
  messagingSenderId: "698848627078",
  appId: "1:698848627078:web:fc6843f7031988679c0407"
};

// Must be exactly the email of your admin user in Firebase Authentication (lowercase)
export const ADMIN_EMAIL = "gaikwadsrushti241@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Students log in with roll number; Firebase needs an email, so we build one from the roll number.
export const emailFromRoll = (roll) =>
  roll.trim().toLowerCase().replace(/\s+/g, "") + "@studentresult.com";

export { app, auth, db };