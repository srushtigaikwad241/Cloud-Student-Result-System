import { auth, db, emailFromRoll } from "./firebase.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, toast, friendlyError } from "./common.js";

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#loginBtn");
  btn.disabled = true;
  try {
    const cred = await signInWithEmailAndPassword(auth, emailFromRoll($("#roll").value), $("#password").value);
    const snap = await getDoc(doc(db, "students", cred.user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      throw new Error("Student record not found. Contact the admin.");
    }
    location.href = "student-dashboard.html";
  } catch (err) {
    console.error(err);
    toast(friendlyError(err), true);
    btn.disabled = false;
  }
});