 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
 import { getDatabase, get, ref, child} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
 import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
 import firebaseConfig from '/CONFIG.js';

 
 // Initialize Firebase
 // firebase.initializeApp(firebaseConfig);
 
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 const auth = getAuth(app);
 const db = getDatabase();

 
document.getElementById('logoutBtn').addEventListener('click', confirmLogout);

function logoutUser() {
    window.location.href = '/login.html'; // Replace "dashboard.html" with the URL of the page you want to redirect to
    sessionStorage.clear();
}

function confirmLogout() {
    // Display a confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    
    if (isConfirmed) {
        logoutUser();
    }
}