import { db } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, esc, requireAdmin, bindLogout, toast, friendlyError } from "./common.js";

bindLogout("admin-login.html");

async function load() {
  try {
    const snap = await getDocs(collection(db, "subjects"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name));
    $("#rows").innerHTML = list.length
      ? list.map((s) => `<tr><td>${esc(s.code)}</td><td>${esc(s.name)}</td><td>${s.maxMarks}</td>
          <td><button class="btn small danger" data-id="${s.id}">Delete</button></td></tr>`).join("")
      : `<tr><td colspan="4" class="muted">No subjects added yet.</td></tr>`;
  } catch (e) { console.error(e); toast(friendlyError(e), true); }
}

requireAdmin(() => {
  load();
  $("#subjectForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const maxMarks = Number($("#maxMarks").value);
    if (!(maxMarks > 0)) return toast("Max marks must be greater than 0", true);
    try {
      await addDoc(collection(db, "subjects"), {
        code: $("#code").value.trim().toUpperCase(),
        name: $("#name").value.trim(),
        maxMarks,
        createdAt: serverTimestamp()
      });
      $("#subjectForm").reset();
      $("#maxMarks").value = 100;
      toast("Subject added");
      load();
    } catch (err) { console.error(err); toast(friendlyError(err), true); }
  });
  $("#rows").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn || !confirm("Delete this subject?")) return;
    try { await deleteDoc(doc(db, "subjects", btn.dataset.id)); toast("Subject deleted"); load(); }
    catch (err) { console.error(err); toast(friendlyError(err), true); }
  });
});