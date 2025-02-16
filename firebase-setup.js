// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-check.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
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
const app = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3 (invisible)
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LdBNdkqAAAAAIh8NW8oqzlKemtRTOeV-To_Y9g8'),
  isTokenAutoRefreshEnabled: true
});

// Force a token refresh on load to ensure fresh tokens
getToken(appCheck, true).then(tokenResult => {
  console.log('Fresh App Check token obtained:', tokenResult.token);
}).catch(err => {
  console.error('Error obtaining App Check token:', err);
});

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Utility functions for cookies and messages
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + "=; Max-Age=-99999999;";
}

function displayMessage(elementId, message, isError = true) {
  const element = document.getElementById(elementId);
  if (!element) return; // Prevent errors if element not found
  element.textContent = message;
  element.style.color = isError ? "red" : "green";
  setTimeout(() => {
    element.textContent = "";
  }, 5000);
}

// Retrieve logged in user from cookies (if any)
let loggedInUser = getCookie("loggedInUser");

// Register a new user (stored in Firestore "users" collection)
export async function registerUser(username, password) {
  username = username.trim();
  if (/\s/.test(username)) {
    displayMessage("register-error-message", "Username cannot contain spaces!");
    return;
  }
  if (!username) {
    displayMessage("register-error-message", "Username cannot be empty or just whitespace!");
    return;
  }
  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (userDoc.exists()) {
      displayMessage("register-error-message", "Username already in use!");
      return;
    }
    const createdAt = new Date().toISOString();
    await setDoc(doc(db, "users", username), {
      username,
      password,
      createdAt
    });
    displayMessage("register-error-message", "User registered successfully!", false);
  } catch (e) {
    displayMessage("register-error-message", "Error registering user.");
  }
}

// Login an existing user
export async function loginUser(username, password) {
  username = username.trim();
  if (/\s/.test(username)) {
    displayMessage("login-error-message", "Username cannot contain spaces!");
    return;
  }
  if (!username) {
    displayMessage("login-error-message", "Username cannot be empty or just whitespace!");
    return;
  }
  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      displayMessage("login-error-message", "Username does not exist!");
      return;
    }
    const userData = userDoc.data();
    if (userData.password === password) {
      loggedInUser = username;
      setCookie("loggedInUser", username, 1993);
      displayMessage("login-error-message", "User logged in successfully!", false);
      document.getElementById("login-section").style.display = "none";
      document.getElementById("comment-section").style.display = "block";
      loadComments();
    } else {
      displayMessage("login-error-message", "Incorrect password!");
    }
  } catch (e) {
    displayMessage("login-error-message", "Error logging in.");
  }
}
window.registerUser = registerUser;
window.loginUser = loginUser;

// Determine comments collection based on current page name
const currentPage = window.location.pathname.split("/").pop().split(".")[0];
const commentsCollectionName = `comments-${currentPage}`;

// Submit a comment (requires the user to be logged in)
export async function submitComment() {
  if (!loggedInUser) {
    alert("You need to be logged in to do that.");
    return;
  }
  const comment = document.getElementById("comment").value.trim();
  if (!comment) {
    alert("Comment cannot be blank!");
    return;
  }
  const createdAt = new Date().toISOString();
  try {
    await addDoc(collection(db, commentsCollectionName), {
      name: loggedInUser,
      comment,
      createdAt
    });
    document.getElementById("comment").value = "";
  } catch (e) {
    console.error("Error adding comment:", e);
  }
}
window.submitComment = submitComment;

// Log off the user
window.logOff = function() {
  eraseCookie("loggedInUser");
  loggedInUser = null;
  displayMessage("login-error-message", "You have been logged out.", false);
  document.getElementById("login-section").style.display = "block";
  document.getElementById("comment-section").style.display = "none";
};

// Load comments from Firestore and update the UI live
export function loadComments() {
  const commentsRef = collection(db, commentsCollectionName);
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById("comments-container");
    if (!commentsContainer) return;
    commentsContainer.innerHTML = "";
    snapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement("div");
      const commentText = document.createElement("p");
      const commentTimestamp = document.createElement("p");

      // Apply special effects for user "SDG"
      if (commentData.name === "SDG") {
        commentText.appendChild(rainbowText(`${commentData.name}: `, true));
        const commentParts = commentData.comment.split("\n").map((part) => rainbowText(part));
        commentParts.forEach((part) => {
          commentText.appendChild(part);
          commentText.appendChild(document.createElement("br"));
        });
        applyOutlineStyle(commentText);
      } else {
        commentText.textContent = `${commentData.name}: ${commentData.comment}`;
      }

      commentTimestamp.textContent = new Date(commentData.createdAt).toLocaleString();
      commentTimestamp.style.fontSize = "small";
      commentTimestamp.style.fontStyle = "italic";
      commentTimestamp.style.color = "rgba(0, 0, 0, 0.6)";
      commentTimestamp.style.marginTop = "-10px";

      commentElement.appendChild(commentText);
      commentElement.appendChild(commentTimestamp);
      commentsContainer.appendChild(commentElement);
    });
  });
}
window.loadComments = loadComments;

// Utility: Rainbow text effect (for "SDG")
function rainbowText(text, reverse = false) {
  const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
  if (reverse) colors.reverse();
  const span = document.createElement("span");
  for (let i = 0; i < text.length; i++) {
    const charSpan = document.createElement("span");
    charSpan.style.color = colors[i % colors.length];
    charSpan.textContent = text[i];
    span.appendChild(charSpan);
  }
  return span;
}

// Utility: Outline style for "SDG" comments
function applyOutlineStyle(element) {
  element.style.webkitTextStroke = "0.5px black";
  element.style.color = "white";
}

// Change password function
window.changePassword = async function(username, currentPassword, newPassword) {
  username = username.trim();
  currentPassword = currentPassword.trim();
  newPassword = newPassword.trim();
  if (!username || !currentPassword || !newPassword) {
    alert("All fields are required.");
    return;
  }
  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      alert("Username does not exist!");
      return;
    }
    const userData = userDoc.data();
    if (userData.password !== currentPassword) {
      alert("Current password is incorrect!");
      return;
    }
    await setDoc(doc(db, "users", username), { ...userData, password: newPassword }, { merge: true });
    alert("Password changed successfully!");
  } catch (e) {
    alert("Error changing password.");
  }
};

// Window onload: Initialize sections and contact form handling
window.onload = function() {
  loadComments();
  if (loggedInUser) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("comment-section").style.display = "block";
  } else {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("comment-section").style.display = "none";
  }

  // Contact form handling
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-username").value;
      const email = document.getElementById("contact-email").value;
      const subject = document.getElementById("contact-subject").value;
      const message = document.getElementById("contact-message").value;
      try {
        await addDoc(collection(db, "contactMessages"), {
          name,
          email,
          subject,
          message,
          createdAt: new Date().toISOString()
        });
        document.getElementById("contact-status-message").textContent = "Message sent successfully!";
        document.getElementById("contact-status-message").style.color = "green";
        contactForm.reset();
      } catch (error) {
        document.getElementById("contact-status-message").textContent = "Error sending message.";
        document.getElementById("contact-status-message").style.color = "red";
      }
    });
  }
};
