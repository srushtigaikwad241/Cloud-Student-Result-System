import { db } from "./firebase.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, esc, requireStudent, bindLogout, toast, friendlyError, summarize, badge } from "./common.js";

bindLogout("student-login.html");

requireStudent(async (user, student) => {
  $("#info").innerHTML = `
    <div><b>Name:</b> ${esc(student.name)}</div>
    <div><b>Roll No:</b> ${esc(student.rollNo)}</div>
    <div><b>Course:</b> ${esc(student.course || "-")}</div>`;
  try {
    const snap = await getDocs(query(collection(db, "marks"), where("studentId", "==", user.uid)));
    const list = snap.docs.map((d) => d.data()).sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    $("#rows").innerHTML = list.length
      ? list.map((m) => `<tr><td>${esc(m.subjectName)}</td><td>${m.marks}</td><td>${m.maxMarks}</td></tr>`).join("")
      : `<tr><td colspan="3" class="muted">Your result has not been published yet.</td></tr>`;
    const s = summarize(list);
    $("#totals").innerHTML = `<span>Total: ${s.total}/${s.max}</span><span>Percentage: ${s.percentage}%</span>
      <span>Grade: ${esc(s.grade)}</span><span>${badge(s.status)}</span>`;
  } catch (e) { console.error(e); toast(friendlyError(e), true); }
});