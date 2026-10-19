import { db, firebaseConfig, emailFromRoll } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { $, requireAdmin, bindLogout, toast } from "./common.js";

bindLogout("admin-login.html");
const secondaryAuth = getAuth(initializeApp(firebaseConfig, "seed"));

const subjects = [
  { id: "MATH", code: "MATH101", name: "Mathematics" },
  { id: "ENG",  code: "ENG101",  name: "English" },
  { id: "SCI",  code: "SCI101",  name: "Science" },
  { id: "CS",   code: "CS101",   name: "Computer Science" },
  { id: "HIST", code: "HIST101", name: "History" }
];

const students = [
  ["S001", "Rahul Sharma"], ["S002", "Priya Patil"], ["S003", "Amit Deshmukh"],
  ["S004", "Sneha Kulkarni"], ["S005", "Rohan Jadhav"], ["S006", "Pooja More"],
  ["S007", "Vikas Shinde"], ["S008", "Neha Pawar"], ["T1024", "Aditya Joshi"],
  ["T1025", "Kavya Nair"], ["T1026", "Sahil Khan"]
];

const log = (m) => { $("#log").textContent += m + "\n"; };

requireAdmin(() => {
  $("#seedBtn").addEventListener("click", async () => {
    const btn = $("#seedBtn");
    btn.disabled = true;
    $("#log").textContent = "";
    try {
      for (const s of subjects) {
        await setDoc(doc(db, "subjects", s.id), {
          code: s.code, name: s.name, maxMarks: 100, createdAt: serverTimestamp()
        });
        log("Subject added: " + s.name);
      }
      for (let i = 0; i < students.length; i++) {
        const [roll, name] = students[i];
        const password = roll + "@123";
        let uid;
        try {
          const cred = await createUserWithEmailAndPassword(secondaryAuth, emailFromRoll(roll), password);
          uid = cred.user.uid;
          await signOut(secondaryAuth);
        } catch (e) {
          log("Skipped " + roll + ": " + (e.code || e.message));
          continue;
        }
        await setDoc(doc(db, "students", uid), {
          rollNo: roll, name, course: "BCA - Sem 3",
          email: emailFromRoll(roll), createdAt: serverTimestamp()
        });
        for (let j = 0; j < subjects.length; j++) {
          let marks = 45 + ((i * 7 + j * 13) % 50);          // 45 to 94
          if (roll === "S004" && subjects[j].id === "SCI") marks = 30; // one FAIL example
          await setDoc(doc(db, "marks", uid + "_" + subjects[j].id), {
            studentId: uid, subjectId: subjects[j].id, subjectName: subjects[j].name,
            marks, maxMarks: 100, updatedAt: serverTimestamp()
          });
        }
        log("Student added: " + roll + " - " + name + "  (password: " + password + ")");
      }
      log("DONE");
      toast("Sample data added");
    } catch (e) {
      console.error(e);
      log("ERROR: " + e.message);
      toast(e.message, true);
    }
    btn.disabled = false;
  });
});