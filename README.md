# Cloud-Based Student Result Management System

A web-based application designed to manage student information, subjects, marks, and academic results using Firebase cloud services.

## 🌐 Live Demo

**Website:** https://studentresult-8e735.web.app

## 📌 Project Overview

The Cloud-Based Student Result Management System simplifies the process of managing student academic records. It provides separate login pages for administrators and students, helping organize student details, subject information, and examination results in one place.

The project uses Firebase Authentication for user authentication, Cloud Firestore for storing data, and Firebase Hosting to publish the application online.

## ✨ Features

- **Admin Login:** Secure administrator authentication.
- **Student Login:** Student authentication through Firebase.
- **Student Management:** Add and view student details.
- **Subject Management:** Add and manage subject information.
- **Marks Management:** Enter and manage student marks.
- **Result Management:** Store and display academic results.
- **Cloud Database:** Store application data using Cloud Firestore.
- **Online Hosting:** Access the application through Firebase Hosting.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

## 📂 Project Structure

```text
Cloud-Student-Result-System/
│
├── index.html
├── admin-login.html
├── student-login.html
├── admin-dashboard.html
├── student-dashboard.html
├── add-student.html
├── students.html
├── subjects.html
├── enter-marks.html
├── results.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── firebase.js
│   ├── admin-login.js
│   ├── admin-dashboard.js
│   ├── add-student.js
│   ├── students.js
│   ├── subjects.js
│   ├── enter-marks.js
│   ├── results.js
│   ├── student-dashboard.js
│   └── student-login.js
│
└── README.md
```

## ⚙️ Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/srushtigaikwad241/Cloud-Student-Result-System.git
```

### 2. Open the project

```bash
cd Cloud-Student-Result-System
```

Open the folder in Visual Studio Code.

### 3. Configure Firebase

1. Open the Firebase Console: https://console.firebase.google.com/
2. Select your Firebase project.
3. Open **Project settings** and locate your web app configuration.
4. Update `js/firebase.js` with your actual Firebase configuration.
5. Enable Firebase Authentication and configure Cloud Firestore.

### 4. Run the project locally

Open `index.html` using the VS Code Live Server extension, or use the deployed website.

## ☁️ Firebase Services

- **Firebase Authentication:** Handles user sign-in.
- **Cloud Firestore:** Stores student, subject, and result records.
- **Firebase Hosting:** Hosts the application online.

## 🎯 Project Objective

The main objective is to develop a simple cloud-based system that makes student result management easier, more organized, and accessible through a web browser.

## 🔮 Future Enhancements

- Generate downloadable result reports.
- Add search and filtering for student records.
- Improve role-based access control.
- Add input validation and error handling.
- Improve the responsive design for mobile devices.

## 👩‍💻 Developer

**Srushti Gaikwad**

Diploma in Computer Engineering  
Government Polytechnic Pune

## 📄 License

This project is created for educational and academic purposes.
