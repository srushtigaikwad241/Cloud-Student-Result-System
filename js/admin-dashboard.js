import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, requireAdmin, bindLogout, toast, friendlyError } from "./common.js";

bindLogout("admin-login.html");

requireAdmin(async (user) => {
  $("#who").textContent = user.email;
  try {
    const [st, su, ma] = await Promise.all([
      getDocs(collection(db, "students")),
      getDocs(collection(db, "subjects")),
      getDocs(collection(db, "marks"))
    ]);
    $("#stCount").textContent = st.size;
    $("#subCount").textContent = su.size;
    $("#markCount").textContent = ma.size;
  } catch (e) { console.error(e); toast(friendlyError(e), true); }
});