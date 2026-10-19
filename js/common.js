import { auth, db, ADMIN_EMAIL } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export const $ = (s) => document.querySelector(s);

export function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function toast(msg, isError = false) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = "toast show" + (isError ? " error" : "");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 6000);
}

export function friendlyError(e) {
  const map = {
    "auth/invalid-credential": "Wrong username/email or password.",
    "auth/invalid-email": "Invalid email / roll number format.",
    "auth/user-not-found": "User not found.",
    "auth/wrong-password": "Wrong password.",
    "auth/email-already-in-use": "This roll number already has a login account.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/operation-not-allowed": "Enable Email/Password in Firebase Console > Authentication > Sign-in method.",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Wrong apiKey in js/firebase.js.",
    "auth/network-request-failed": "Network error. Check your internet.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "permission-denied": "Firestore rules blocked this. Publish the rules and make sure ADMIN_EMAIL matches your admin login email.",
    "failed-precondition": "Firestore database is not created yet."
  };
  const base = map[e.code];
  return base ? `${base} [${e.code}]` : (e.message || "Something went wrong.");
}

export function gradeOf(p) {
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B+";
  if (p >= 60) return "B";
  if (p >= 50) return "C";
  if (p >= 40) return "D";
  return "F";
}

export function summarize(rows) {
  const total = rows.reduce((s, r) => s + Number(r.marks), 0);
  const max = rows.reduce((s, r) => s + Number(r.maxMarks), 0);
  const percentage = max ? +((total / max) * 100).toFixed(2) : 0;
  const passed = rows.length > 0 && rows.every((r) => r.marks >= r.maxMarks * 0.35);
  return {
    total, max, percentage,
    grade: rows.length ? gradeOf(percentage) : "-",
    status: rows.length ? (passed ? "PASS" : "FAIL") : "N/A"
  };
}

export const badge = (status) =>
  `<span class="badge ${status === "PASS" ? "pass" : status === "FAIL" ? "fail" : "na"}">${esc(status)}</span>`;

// Admin pages: only the admin email is allowed
export function requireAdmin(cb) {
  onAuthStateChanged(auth, async (user) => {
    if (!user || (user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      if (user) await signOut(auth);
      location.href = "admin-login.html";
      return;
    }
    cb(user, { role: "admin" });
  });
}

// Student pages: user must have a record in students/<uid>
export function requireStudent(cb) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { location.href = "student-login.html"; return; }
    try {
      const snap = await getDoc(doc(db, "students", user.uid));
      if (!snap.exists()) { await signOut(auth); location.href = "student-login.html"; return; }
      cb(user, snap.data());
    } catch (e) { console.error(e); toast(friendlyError(e), true); }
  });
}

export function bindLogout(loginPage) {
  const b = $("#logoutBtn");
  if (b) b.addEventListener("click", async () => { await signOut(auth); location.href = loginPage; });
}