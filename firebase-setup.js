// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCrxSA-Y5FjKCkULoQ3iwCiKaupZOSK9FU",
    authDomain: "soniccdfansite.firebaseapp.com",
    projectId: "soniccdfansite",
    storageBucket: "soniccdfansite.firebasestorage.app",
    messagingSenderId: "739250141699",
    appId: "1:739250141699:web:1925788f3944b1aa58ac36",
    measurementId: "G-EQK0WQWQ33"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Utility functions for cookies
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

// Display messages
function displayMessage(elementId, message, isError = true) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.color = isError ? 'red' : 'green';
    setTimeout(() => element.textContent = '', 5000);
}

// User Authentication
let loggedInUser = getCookie("loggedInUser");

async function registerUser() {
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value;

    if (!username || /\s/.test(username)) {
        displayMessage("register-error-message", "Invalid username.");
        return;
    }

    const userDoc = await db.collection("users").doc(username).get();
    if (userDoc.exists) {
        displayMessage("register-error-message", "Username already exists!");
        return;
    }

    await db.collection("users").doc(username).set({ username, password });
    displayMessage("register-error-message", "User registered successfully!", false);
}

async function loginUser() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const userDoc = await db.collection("users").doc(username).get();
    if (!userDoc.exists || userDoc.data().password !== password) {
        displayMessage("login-error-message", "Invalid username or password.");
        return;
    }

    loggedInUser = username;
    setCookie("loggedInUser", username, 1993);
    displayMessage("login-error-message", "Logged in successfully!", false);
    loadComments();
}

function logOff() {
    eraseCookie("loggedInUser");
    loggedInUser = null;
    displayMessage("login-error-message", "Logged out successfully.", false);
}

// Contact Form Submission
document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("contact-username").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const subject = document.getElementById("contact-subject").value.trim();
    const message = document.getElementById("contact-message").value.trim();

    if (!username || !email || !subject || !message) {
        displayMessage("contact-response", "All fields are required!", true);
        return;
    }

    await db.collection("contact_messages").add({
        username, email, subject, message,
        createdAt: new Date().toISOString()
    });

    document.getElementById("contactForm").reset();
    displayMessage("contact-response", "Your message has been sent!", false);
});

// Comments Section
function loadComments() {
    db.collection("comments").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        const commentsContainer = document.getElementById("comments-container");
        commentsContainer.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const commentElement = document.createElement("div");
            commentElement.innerHTML = `<strong>${data.name}:</strong> ${data.comment}`;
            commentsContainer.appendChild(commentElement);
        });
    });
}

async function submitComment() {
    if (!loggedInUser) {
        alert("You need to be logged in to comment.");
        return;
    }

    const comment = document.getElementById("comment").value.trim();
    if (!comment) {
        alert("Comment cannot be blank!");
        return;
    }

    await db.collection("comments").add({
        name: loggedInUser,
        comment,
        createdAt: new Date().toISOString()
    });

    document.getElementById("comment").value = "";
    loadComments();
}

// Load comments on page load
window.onload = function () {
    loadComments();
};
