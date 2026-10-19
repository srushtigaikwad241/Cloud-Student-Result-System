import { auth, ADMIN_EMAIL } from "./firebase.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { $, toast, friendlyError } from "./common.js";

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#loginBtn");
  btn.disabled = true;
  try {
    const cred = await signInWithEmailAndPassword(auth, $("#email").value.trim(), $("#password").value);
    if ((cred.user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      throw new Error("This account is not the admin account.");
    }
    location.href = "admin-dashboard.html";
  } catch (err) {
    console.error(err);
    toast(friendlyError(err), true);
    btn.disabled = false;
  }
});