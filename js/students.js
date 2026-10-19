import { db } from "./firebase.js";
import { collection, getDocs, deleteDoc, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, esc, requireAdmin, bindLogout, toast, friendlyError } from "./common.js";

bindLogout("admin-login.html");
let students = [];

// Email to display: the contact email typed by the admin (ignores the hidden roll-number login email)
function emailOf(s) {
  if (s.contactEmail) return s.contactEmail;
  if (s.Email) return s.Email;
  if (s.email && !String(s.email).endsWith("@studentresult.com")) return s.email;
  return "";
}

function render() {
  const q = $("#search").value.trim().toLowerCase();
  const list = students.filter((s) =>
    String(s.name || "").toLowerCase().includes(q) || String(s.rollNo || "").toLowerCase().includes(q));

  $("#count").textContent = `(${list.length})`;
  $("#rows").innerHTML = list.length
    ? list.map((s) => `<tr>
        <td>${esc(s.rollNo || "-")}</td>
        <td>${esc(s.name || "-")}</td>
        <td>${esc(emailOf(s) || "-")}</td>
        <td>${esc(s.course || "-")}</td>
        <td>
          <button class="btn small light" data-act="email" data-id="${s.id}">Edit Email</button>
          <button class="btn small danger" data-act="delete" data-id="${s.id}">Delete</button>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="5" class="muted">No students found.</td></tr>`;
}

async function load() {
  try {
    const snap = await getDocs(collection(db, "students"));
    students = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(a.rollNo || "").localeCompare(String(b.rollNo || ""), undefined, { numeric: true }));
    render();
  } catch (e) {
    console.error(e);
    $("#rows").innerHTML = `<tr><td colspan="5" class="muted">Could not load students.</td></tr>`;
    toast(friendlyError(e), true);
  }
}

requireAdmin(() => {
  load();
  $("#search").addEventListener("input", render);

  $("#rows").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.dataset.act === "email") {
      const s = students.find((x) => x.id === id);
      const value = prompt("Enter student email:", emailOf(s));
      if (value === null) return;
      const email = value.trim().toLowerCase();
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return toast("Enter a valid email address.", true);
      try {
        await updateDoc(doc(db, "students", id), { contactEmail: email });
        toast("Email saved");
        load();
      } catch (err) { console.error(err); toast(friendlyError(err), true); }
      return;
    }

    if (btn.dataset.act === "delete") {
      if (!confirm("Delete this student and all their marks?")) return;
      try {
        const marks = await getDocs(query(collection(db, "marks"), where("studentId", "==", id)));
        await Promise.all(marks.docs.map((m) => deleteDoc(m.ref)));
        await deleteDoc(doc(db, "students", id));
        toast("Student deleted");
        load();
      } catch (err) { console.error(err); toast(friendlyError(err), true); }
    }
  });
});