// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-check.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3 (invisible)
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Function to get reCAPTCHA token
function getRecaptchaToken() {
  return getToken(appCheck, true).then((tokenResult) => {
    return tokenResult.token;
  }).catch((err) => {
    console.error('Error obtaining reCAPTCHA token:', err);
    return null;
  });
}

// Register a new user (with reCAPTCHA verification)
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

  // Get reCAPTCHA token
  const captchaToken = await getRecaptchaToken();
  if (!captchaToken) {
    displayMessage("register-error-message", "reCAPTCHA verification failed.");
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
      createdAt,
      captchaToken
    });
    displayMessage("register-error-message", "User registered successfully!", false);
  } catch (e) {
    displayMessage("register-error-message", "Error registering user.");
  }
}

// Login an existing user (with reCAPTCHA verification)
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

  // Get reCAPTCHA token
  const captchaToken = await getRecaptchaToken();
  if (!captchaToken) {
    displayMessage("login-error-message", "reCAPTCHA verification failed.");
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

  // Get reCAPTCHA token for comment submission
  const token = await getToken(appCheck);

  // Verify the token here or pass it to the backend for verification
  console.log('reCAPTCHA Token for comment submission:', token);

  const createdAt = new Date().toISOString();
  try {
    await addDoc(collection(db, `comments-${currentPage}`), {
      name: loggedInUser,
      comment,
      createdAt
    });
    document.getElementById("comment").value = "";
  } catch (e) {
    console.error("Error adding comment:", e);
  }
}

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
  const commentsRef = collection(db, `comments-${currentPage}`);
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

      commentText.textContent = `${commentData.name}: ${commentData.comment}`;
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
