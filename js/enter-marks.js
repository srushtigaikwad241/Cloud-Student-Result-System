import { db } from "./firebase.js";
import { collection, getDocs, setDoc, deleteDoc, doc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, esc, requireAdmin, bindLogout, toast, friendlyError, summarize } from "./common.js";

bindLogout("admin-login.html");
let subjects = [];

async function loadMarks() {
  const sid = $("#student").value;
  if (!sid) { $("#rows").innerHTML = `<tr><td colspan="4" class="muted">Select a student.</td></tr>`; $("#summary").textContent = ""; return; }
  try {
    const snap = await getDocs(query(collection(db, "marks"), where("studentId", "==", sid)));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    $("#rows").innerHTML = list.length
      ? list.map((m) => `<tr><td>${esc(m.subjectName)}</td><td>${m.marks}</td><td>${m.maxMarks}</td>
          <td><button class="btn small danger" data-id="${m.id}">Remove</button></td></tr>`).join("")
      : `<tr><td colspan="4" class="muted">No marks entered yet.</td></tr>`;
    const s = summarize(list);
    $("#summary").textContent = `Total: ${s.total}/${s.max} | Percentage: ${s.percentage}% | Grade: ${s.grade} | Status: ${s.status}`;
  } catch (e) { console.error(e); toast(friendlyError(e), true); }
}

requireAdmin(async () => {
  try {
    const [st, su] = await Promise.all([getDocs(collection(db, "students")), getDocs(collection(db, "subjects"))]);
    const students = st.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));
    subjects = su.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name));
    $("#student").innerHTML = `<option value="">-- Select student --</option>` +
      students.map((s) => `<option value="${s.id}">${esc(s.rollNo)} - ${esc(s.name)}</option>`).join("");
    $("#subject").innerHTML = `<option value="">-- Select subject --</option>` +
      subjects.map((s) => `<option value="${s.id}">${esc(s.name)} (max ${s.maxMarks})</option>`).join("");
    if (!subjects.length) toast("Add subjects first (Subjects page).", true);
  } catch (e) { console.error(e); toast(friendlyError(e), true); }

  $("#student").addEventListener("change", loadMarks);

  $("#marksForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const sid = $("#student").value;
    const sub = subjects.find((s) => s.id === $("#subject").value);
    const marks = Number($("#marks").value);
    if (!sid || !sub) return toast("Select a student and a subject", true);
    if (Number.isNaN(marks) || marks < 0 || marks > sub.maxMarks) return toast(`Marks must be between 0 and ${sub.maxMarks}`, true);
    try {
      await setDoc(doc(db, "marks", `${sid}_${sub.id}`), {
        studentId: sid, subjectId: sub.id, subjectName: sub.name,
        marks, maxMarks: sub.maxMarks, updatedAt: serverTimestamp()
      });
      $("#marks").value = "";
      toast("Marks saved");
      loadMarks();
    } catch (err) { console.error(err); toast(friendlyError(err), true); }
  });

  $("#rows").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    try { await deleteDoc(doc(db, "marks", btn.dataset.id)); toast("Removed"); loadMarks(); }
    catch (err) { console.error(err); toast(friendlyError(err), true); }
  });
});