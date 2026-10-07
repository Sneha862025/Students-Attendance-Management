/* =====================================================================
   Student Attendance Management System - ABC College of Computer Applications
   Pure vanilla JavaScript (DOM manipulation + event handling + localStorage)

   DEMO LOGIN CREDENTIALS (frontend-only project, no backend):
     Student -> Email: student@gmail.com   Password: student123   (Student ID: BCA001)
     Teacher -> Email: teacher@gmail.com   Password: teacher123
   ===================================================================== */

const REQUIRED_PERCENT = 75;
const SUBJECTS = ["Java", "DBMS", "Python", "Computer Networks", "Machine Learning"];
const CLASSES_PER_SUBJECT = 20;

/* ---------- Demo accounts ---------- */
const DEMO_USERS = [
  { email: "student@gmail.com", id: "BCA001", password: "student123", role: "student", name: "Rahul" },
  { email: "teacher@gmail.com", id: "teacher", password: "teacher123", role: "teacher", name: "Teacher" }
];

/* ---------- Student data: "present" lists classes attended per subject (out of 20) ---------- */
const students = [
  { id: "BCA001", name: "Rahul",  course: "BCA", semester: 4, section: "A", present: [18, 17, 19, 18, 18] },
  { id: "BCA002", name: "Sneha",  course: "BCA", semester: 4, section: "A", present: [14, 15, 13, 14, 14] },
  { id: "BCA003", name: "Anjali", course: "BCA", semester: 4, section: "B", present: [17, 18, 17, 16, 17] },
  { id: "BCA004", name: "Arjun",  course: "BCA", semester: 4, section: "B", present: [19, 18, 18, 19, 18] },
  { id: "BCA005", name: "Priya",  course: "BCA", semester: 4, section: "A", present: [12, 13, 14, 12, 13] },
  { id: "BCA006", name: "Karthik", course: "BCA", semester: 4, section: "B", present: [16, 15, 17, 16, 16] },
  { id: "BCA007", name: "Divya",  course: "BCA", semester: 4, section: "A", present: [20, 19, 19, 20, 18] },
  { id: "BCA008", name: "Mohan",  course: "BCA", semester: 4, section: "B", present: [15, 14, 15, 14, 13] },
  { id: "BCA009", name: "Neha",   course: "BCA", semester: 4, section: "A", present: [16, 17, 15, 16, 16] },
  { id: "MCA001", name: "Vikram", course: "MCA", semester: 2, section: "A", present: [11, 12, 13, 12, 12] },
  { id: "MCA002", name: "Pooja",  course: "MCA", semester: 2, section: "A", present: [18, 17, 18, 17, 18] },
  { id: "MCA003", name: "Aditya", course: "MCA", semester: 2, section: "B", present: [15, 16, 16, 15, 15] }
];

/* ---------- Attendance log shown on the student's attendance page ---------- */
const attendanceData = [
  { date: "01/10/2026", subject: "Java", teacher: "Mr. Kumar", status: "Present" },
  { date: "02/10/2026", subject: "DBMS", teacher: "Ms. Priya", status: "Present" },
  { date: "03/10/2026", subject: "Python", teacher: "Mr. Arun", status: "Absent" },
  { date: "04/10/2026", subject: "Java", teacher: "Mr. Kumar", status: "Present" },
  { date: "05/10/2026", subject: "Computer Networks", teacher: "Ms. Deepa", status: "Present" },
  { date: "06/10/2026", subject: "Machine Learning", teacher: "Dr. Rao", status: "Present" },
  { date: "07/10/2026", subject: "Python", teacher: "Mr. Arun", status: "Present" },
  { date: "08/10/2026", subject: "DBMS", teacher: "Ms. Priya", status: "Absent" },
  { date: "09/10/2026", subject: "Java", teacher: "Mr. Kumar", status: "Present" },
  { date: "10/10/2026", subject: "Machine Learning", teacher: "Dr. Rao", status: "Present" }
];

/* ---------- Storage wrapper ----------
   Uses localStorage normally. Some browsers block localStorage for local files
   (file://); in that case it falls back to window.name, which survives page changes in the same tab. */
const store = (function () {
  try {
    window.localStorage.setItem("_test", "1");
    window.localStorage.removeItem("_test");
    return window.localStorage;
  } catch (error) {
    let data = {};
    try { data = JSON.parse(window.name) || {}; } catch (e) { data = {}; }
    const save = () => { window.name = JSON.stringify(data); };
    return {
      getItem: (key) => (key in data ? data[key] : null),
      setItem: (key, value) => { data[key] = String(value); save(); },
      removeItem: (key) => { delete data[key]; save(); },
      clear: () => { data = {}; save(); }
    };
  }
})();

/* ---------- Small DOM helpers ---------- */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* =====================  SESSION (localStorage)  ===================== */
function getSession() {
  return {
    role: store.getItem("userRole"),
    name: store.getItem("userName"),
    id: store.getItem("userId")
  };
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = "message " + type;       // swaps classes: message success / warning / error
  el.classList.remove("hidden");
}

/* =====================  LOGIN  ===================== */
function loginUser(event) {
  event.preventDefault();
  const identifier = $("#loginId").value.trim().toLowerCase();
  const password = $("#loginPassword").value;
  const role = $("input[name='role']:checked").value;
  const errorBox = $("#loginMessage");

  // 1. Validate empty fields
  if (!identifier || !password) {
    showMessage(errorBox, "Please enter both your email / ID and password.", "error");
    return;
  }
  // 2. Match against demo accounts
  const user = DEMO_USERS.find((u) =>
    (u.email === identifier || u.id.toLowerCase() === identifier) && u.password === password);
  if (!user) {
    showMessage(errorBox, "Invalid credentials. Please check the demo login details.", "error");
    return;
  }
  // 3. Selected role must match the account role
  if (user.role !== role) {
    showMessage(errorBox, "This account is a " + user.role + " account. Please select the correct role.", "error");
    return;
  }
  // 4. Save session, remember email if requested, and redirect by role
  store.setItem("userRole", user.role);
  store.setItem("userName", user.name);
  store.setItem("userId", user.id);
  if ($("#rememberMe").checked) store.setItem("rememberedEmail", user.email);
  else store.removeItem("rememberedEmail");

  window.location.href = user.role === "teacher" ? "teacher.html" : "home.html";
}

function setupLoginPage() {
  const session = getSession();
  if (session.role) {                       // already logged in -> skip login screen
    window.location.href = session.role === "teacher" ? "teacher.html" : "home.html";
    return;
  }
  const remembered = store.getItem("rememberedEmail");
  if (remembered) { $("#loginId").value = remembered; $("#rememberMe").checked = true; }

  if (store.getItem("loggedOut")) {          // message after logout
    showMessage($("#loginMessage"), "Logged out successfully.", "success");
    store.removeItem("loggedOut");
  }
  $("#loginForm").addEventListener("submit", loginUser);
  $("#forgotPassword").addEventListener("click", function (e) {
    e.preventDefault();
    showMessage($("#loginMessage"), "Demo project: please contact the college office to reset your password.", "warning");
  });
}

/* =====================  LOGOUT  ===================== */
function logoutUser() {
  if (!window.confirm("Are you sure you want to log out?")) return;
  const remembered = store.getItem("rememberedEmail");
  store.clear();                               // clear all login info
  store.clear();
  if (remembered) store.setItem("rememberedEmail", remembered);  // keep only "remember me" email
  store.setItem("loggedOut", "yes");         // lets login page show "Logged out successfully."
  window.location.href = "index.html";
}

/* =====================  ACCESS CONTROL  ===================== */
// Blocks pages for logged-out users and sends each role to the correct page.
function checkAccess() {
  const page = document.body.dataset.page;
  const access = document.body.dataset.access;       // "student", "teacher" or "any"
  const { role } = getSession();
  if (!role) { window.location.replace("index.html"); return false; }
  if (access === "student" && role !== "student") { window.location.replace("teacher.html"); return false; }
  if (access === "teacher" && role !== "teacher") { window.location.replace("home.html"); return false; }
  document.body.removeAttribute("data-auth");        // reveal the page
  return true;
}

/* =====================  NAVBAR  ===================== */
function buildNavbar() {
  const { role } = getSession();
  const page = document.body.dataset.page;
  const links = [{ href: "home.html", label: "Home", key: "home" }, { href: "about.html", label: "About", key: "about" }];
  if (role === "student") links.push({ href: "attendance.html", label: "Attendance", key: "attendance" });
  if (role === "teacher") links.push({ href: "teacher.html", label: "Teacher Dashboard", key: "teacher" });

  const list = $("#navLinks");
  list.innerHTML = "";
  links.forEach(function (link) {                    // createElement + appendChild
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    if (link.key === page) { a.classList.add("active"); a.setAttribute("aria-current", "page"); }
    li.appendChild(a);
    list.appendChild(li);
  });
  const logoutItem = document.createElement("li");
  const logoutBtn = document.createElement("button");
  logoutBtn.type = "button";
  logoutBtn.textContent = "Logout";
  logoutBtn.className = "logout-btn";
  logoutBtn.addEventListener("click", logoutUser);
  logoutItem.appendChild(logoutBtn);
  list.appendChild(logoutItem);
}

function setupMobileMenu() {
  const toggle = $("#menuToggle");
  const nav = $("#mainNav");
  toggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

/* =====================  CALCULATIONS  ===================== */
// Attendance % = (present / total) x 100
function calculateAttendance(present, total) {
  const percent = total === 0 ? 0 : Math.round((present / total) * 100);
  return { present: present, total: total, absent: total - present, percent: percent };
}

function getStudentTotals(student) {
  const present = student.present.reduce((sum, n) => sum + n, 0);
  return calculateAttendance(present, SUBJECTS.length * CLASSES_PER_SUBJECT);
}

function getCurrentStudent() {
  const { id } = getSession();
  return students.find((s) => s.id === id) || students[0];
}

// Shows the green/orange message depending on the 75% rule
function checkAttendanceStatus(percent, messageEl) {
  if (percent < REQUIRED_PERCENT) {
    showMessage(messageEl, "⚠ Warning: Your attendance is below the required " + REQUIRED_PERCENT + "%.", "warning");
  } else {
    showMessage(messageEl, "✓ Your attendance is satisfactory.", "success");
  }
}

/* =====================  STUDENT HOME  ===================== */
function loadStudentDashboard() {
  const { role, name } = getSession();
  $("#userName").textContent = name;                 // dynamic "Welcome, Rahul!"
  if (role === "teacher") {                          // teachers get a different home view
    $$(".student-only").forEach((el) => el.classList.add("hidden"));
    $$(".teacher-only").forEach((el) => el.classList.remove("hidden"));
    $("#heroText").textContent = "Manage and monitor student attendance from your dashboard.";
    return;
  }
  const stats = getStudentTotals(getCurrentStudent());
  $("#statTotal").textContent = stats.total;
  $("#statPresent").textContent = stats.present;
  $("#statAbsent").textContent = stats.absent;
  $("#statPercent").textContent = stats.percent + "%";
  checkAttendanceStatus(stats.percent, $("#statusMessage"));
}

/* =====================  STUDENT ATTENDANCE PAGE  ===================== */
function displayAttendance() {
  const student = getCurrentStudent();
  const stats = getStudentTotals(student);

  $("#infoName").textContent = student.name;
  $("#infoId").textContent = student.id;
  $("#infoCourse").textContent = student.course;
  $("#infoSemester").textContent = student.semester;
  $("#infoSection").textContent = student.section;

  $("#totalClasses").textContent = stats.total;
  $("#attendedClasses").textContent = stats.present;
  $("#absentClasses").textContent = stats.absent;
  $("#percentValue").textContent = stats.percent + "%";
  $("#percentLabel").textContent = stats.percent + "%";

  // Progress bar: width set by JS (CSS transition animates it)
  const bar = $("#progressBar");
  bar.classList.toggle("low", stats.percent < REQUIRED_PERCENT);
  bar.setAttribute("aria-valuenow", stats.percent);
  setTimeout(function () { bar.style.width = stats.percent + "%"; }, 150);

  checkAttendanceStatus(stats.percent, $("#statusMessage"));
  displaySubjectWise($("#subjectBody"), student);

  // Build attendance log rows dynamically
  const body = $("#attendanceBody");
  body.innerHTML = "";
  attendanceData.forEach(function (record) {
    const row = document.createElement("tr");
    const badgeClass = record.status.toLowerCase();  // "present" or "absent"
    row.innerHTML = "<td>" + record.date + "</td><td>" + record.subject + "</td><td>" + record.teacher +
      '</td><td><span class="badge ' + badgeClass + '">' + record.status.toUpperCase() + "</span></td>";
    body.appendChild(row);
  });
}

// Fills a table body with subject-wise attendance (used by student page AND teacher modal)
function displaySubjectWise(tbody, student) {
  tbody.innerHTML = "";
  SUBJECTS.forEach(function (subject, index) {
    const data = calculateAttendance(student.present[index], CLASSES_PER_SUBJECT);
    const low = data.percent < REQUIRED_PERCENT ? "low" : "";
    const row = document.createElement("tr");
    row.innerHTML = "<td>" + subject + "</td><td>" + data.total + "</td><td>" + data.present + "</td><td>" + data.absent +
      '</td><td><span class="mini"><i class="' + low + '" style="width:' + data.percent + '%"></i></span>' + data.percent + "%</td>";
    tbody.appendChild(row);
  });
}

/* =====================  TEACHER DASHBOARD  ===================== */
function loadTeacherStats() {
  const percents = students.map((s) => getStudentTotals(s).percent);
  const above = percents.filter((p) => p >= REQUIRED_PERCENT).length;
  const average = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
  $("#totalStudents").textContent = students.length;
  $("#aboveCount").textContent = above;
  $("#belowCount").textContent = students.length - above;
  $("#averageAttendance").textContent = average + "%";
}

function displayStudents(list) {
  const body = $("#studentBody");
  body.innerHTML = "";
  $("#resultCount").textContent = "Showing " + list.length + " of " + students.length + " students";
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="11" style="text-align:center;color:#6b7280">No students found.</td></tr>';
    return;
  }
  list.forEach(function (student) {
    const stats = getStudentTotals(student);
    const good = stats.percent >= REQUIRED_PERCENT;
    const row = document.createElement("tr");
    row.innerHTML = "<td>" + student.id + "</td><td>" + student.name + "</td><td>" + student.course + "</td><td>" +
      student.semester + "</td><td>" + student.section + "</td><td>" + stats.total + "</td><td>" + stats.present +
      "</td><td>" + stats.absent + "</td><td>" + stats.percent + '%</td><td><span class="badge ' + (good ? "good" : "low") +
      '">' + (good ? "Good" : "Low") + "</span></td><td></td>";
    const detailsBtn = document.createElement("button");
    detailsBtn.type = "button";
    detailsBtn.className = "btn small";
    detailsBtn.textContent = "View Details";
    detailsBtn.addEventListener("click", function () { openStudentModal(student.id); });
    row.lastElementChild.appendChild(detailsBtn);
    body.appendChild(row);
  });
}

// Search by ID, name or course
function searchStudents(list, term) {
  const text = term.trim().toLowerCase();
  if (!text) return list;
  return list.filter((s) => s.id.toLowerCase().includes(text) ||
    s.name.toLowerCase().includes(text) || s.course.toLowerCase().includes(text));
}

// Filter by attendance percentage
function filterStudents(list, mode) {
  if (mode === "above") return list.filter((s) => getStudentTotals(s).percent >= REQUIRED_PERCENT);
  if (mode === "below") return list.filter((s) => getStudentTotals(s).percent < REQUIRED_PERCENT);
  return list;
}

function updateStudentTable() {          // search + filter combined, no page reload
  let result = searchStudents(students, $("#searchInput").value);
  result = filterStudents(result, $("#filterSelect").value);
  displayStudents(result);
}

/* ----- Modal ----- */
function openStudentModal(studentId) {
  const student = students.find((s) => s.id === studentId);
  const stats = getStudentTotals(student);
  $("#modalName").textContent = student.name;
  $("#modalId").textContent = student.id;
  $("#modalCourse").textContent = student.course;
  $("#modalSemester").textContent = student.semester;
  $("#modalTotal").textContent = stats.total;
  $("#modalPresent").textContent = stats.present;
  $("#modalAbsent").textContent = stats.absent;
  $("#modalPercent").textContent = stats.percent + "%";
  displaySubjectWise($("#modalSubjects"), student);
  $("#studentModal").classList.add("open");
  $("#closeModalBtn").focus();
}

function closeStudentModal() {
  $("#studentModal").classList.remove("open");
}

function setupTeacherPage() {
  loadTeacherStats();
  displayStudents(students);
  $("#searchInput").addEventListener("input", updateStudentTable);
  $("#filterSelect").addEventListener("change", updateStudentTable);
  $("#closeModalBtn").addEventListener("click", closeStudentModal);
  $("#studentModal").addEventListener("click", function (e) {
    if (e.target === this) closeStudentModal();      // click on dark backdrop closes
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeStudentModal();
  });
}

/* =====================  PAGE INITIALISATION  ===================== */
function initProtectedPage() {
  if (!checkAccess()) return;
  buildNavbar();
  setupMobileMenu();
  $$("[data-logout]").forEach((btn) => btn.addEventListener("click", logoutUser));
  $$("[data-goto]").forEach((btn) => btn.addEventListener("click", function () {
    window.location.href = btn.dataset.goto;           // e.g. "View My Attendance" button
  }));
  const page = document.body.dataset.page;
  if (page === "home") {
    loadStudentDashboard();
    const back = $("#backToTop");
    if (back) back.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  if (page === "attendance") displayAttendance();
  if (page === "teacher") setupTeacherPage();
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.page === "login") setupLoginPage();
  else initProtectedPage();
});

// If user presses the browser Back button after logout, re-check access
window.addEventListener("pageshow", function (e) {
  if (e.persisted && document.body.dataset.page !== "login") window.location.reload();
});
