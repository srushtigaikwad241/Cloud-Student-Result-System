import { db, firebaseConfig, emailFromRoll } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, deleteUser, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, requireAdmin, bindLogout, toast, friendlyError } from "./common.js";

bindLogout("admin-login.html");

// Second Firebase app so the admin stays logged in while the student account is created.
const secondaryAuth = getAuth(initializeApp(firebaseConfig, "secondary"));

requireAdmin(() => {
  $("#studentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#addBtn");

    const roll = $("#roll").value.trim();
    const name = $("#name").value.trim();
    const course = $("#course").value.trim();
    const contactEmail = $("#email").value.trim().toLowerCase();
    const password = $("#password").value;

    if (!/^[A-Za-z0-9_-]+$/.test(roll)) return toast("Roll number: use only letters, numbers, - or _ (no spaces).", true);
    if (password.length < 6) return toast("Password must be at least 6 characters.", true);

    btn.disabled = true;
    let step = "Step 1 (checking database)";
    let cred = null;
    let saved = false;

    try {
      const dup = await getDocs(query(collection(db, "students"), where("rollNo", "==", roll)));
      if (!dup.empty) throw new Error("This roll number already exists.");

      step = "Step 2 (creating login account)";
      const loginEmail = emailFromRoll(roll);
      cred = await createUserWithEmailAndPassword(secondaryAuth, loginEmail, password);

      step = "Step 3 (saving student record)";
      await setDoc(doc(db, "students", cred.user.uid), {
        rollNo: roll,
        name,
        course,
        email: loginEmail,     // hidden login email (roll number based)
        contactEmail,          // the email typed in the form
        createdAt: serverTimestamp()
      });
      saved = true;

      toast("Student saved successfully");
      $("#studentForm").reset();
    } catch (err) {
      console.error(step, err);
      if (cred && !saved) {
        try { await deleteUser(cred.user); } catch (e2) { console.error("Cleanup failed", e2); }
      }
      toast(`${step} failed: ${friendlyError(err)}`, true);
    }

    try { await signOut(secondaryAuth); } catch (e3) { /* ignore */ }
    btn.disabled = false;
  });
});