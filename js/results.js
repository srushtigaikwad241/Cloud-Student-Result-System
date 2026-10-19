import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, esc, requireAdmin, bindLogout, toast, friendlyError, summarize, badge } from "./common.js";

bindLogout("admin-login.html");
let rows = [];

function render() {
  const q = $("#search").value.trim().toLowerCase();
  const list = rows.filter((r) => r.name.toLowerCase().includes(q) || r.rollNo.toLowerCase().includes(q));
  $("#rows").innerHTML = list.length
    ? list.map((r) => `<tr><td>${esc(r.rollNo)}</td><td>${esc(r.name)}</td><td>${esc(r.course)}</td>
        <td>${r.total}/${r.max}</td><td>${r.percentage}</td><td>${esc(r.grade)}</td><td>${badge(r.status)}</td></tr>`).join("")
    : `<tr><td colspan="7" class="muted">No results found.</td></tr>`;
}

requireAdmin(async () => {
  try {
    const [st, ma] = await Promise.all([getDocs(collection(db, "students")), getDocs(collection(db, "marks"))]);
    const marks = ma.docs.map((d) => d.data());
    rows = st.docs.map((d) => {
      const s = d.data();
      return { ...s, ...summarize(marks.filter((m) => m.studentId === d.id)) };
    }).sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));
    render();
  } catch (e) { console.error(e); toast(friendlyError(e), true); }
  $("#search").addEventListener("input", render);
});