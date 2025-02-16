// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
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
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your Firebase configuration
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
const db = getFirestore(app);

// Utility functions for cookie management
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

// Check if the user is logged in by checking cookies
let loggedInUser = getCookie("loggedInUser");

// Utility function to display messages
function displayMessage(elementId, message, isError = true) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = isError ? "red" : "green";
  setTimeout(() => {
    element.textContent = "";
  }, 5000);
}

// Register a new user (stored in Firestore under "users")
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

// Login an existing user by comparing the provided password
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
      setCookie("loggedInUser", username, 1993); // Set cookie for 1993 days
      displayMessage("login-error-message", "User logged in successfully!", false);
      // Hide the login section and show the comment section
      document.getElementById("login-section").style.display = "none";
      document.getElementById("comment-section").style.display = "block";
      loadComments(); // Load comments after login
    } else {
      displayMessage("login-error-message", "Incorrect password!");
    }
  } catch (e) {
    displayMessage("login-error-message", "Error logging in.");
  }
}

window.registerUser = registerUser;
window.loginUser = loginUser;

// Determine the current page name (used to create a unique comments collection)
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
    // Comments will auto-update via onSnapshot
  } catch (e) {
    console.error("Error adding comment:", e);
  }
}

window.submitComment = submitComment;

// Log off the current user: erase cookie and toggle sections
window.logOff = function () {
  eraseCookie("loggedInUser");
  loggedInUser = null;
  displayMessage("login-error-message", "You have been logged out.", false);
  document.getElementById("login-section").style.display = "block";
  document.getElementById("comment-section").style.display = "none";
};

// Load comments from Firestore and update the comments container live
export function loadComments() {
  const commentsRef = collection(db, commentsCollectionName);
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById("comments-container");
    commentsContainer.innerHTML = ""; // Clear previous comments
    snapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement("div");
      const commentText = document.createElement("p");
      const commentTimestamp = document.createElement("p");

      // For a special user "SDG", apply rainbow and outline effects
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

// Rainbow text effect: splits text into characters and cycles through colors
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

// Apply an outline style (using webkit text stroke)
function applyOutlineStyle(element) {
  element.style.webkitTextStroke = "0.5px black";
  element.style.color = "white";
}

// Change password functionality: verifies current password and updates it
window.changePassword = async function (username, currentPassword, newPassword) {
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

window.onload = function () {
  // Load comments (even if not logged in, you may see past comments)
  loadComments();

  // Set section visibility based on whether a user is logged in
  if (loggedInUser) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("comment-section").style.display = "block";
  } else {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("comment-section").style.display = "none";
  }

  // If the logged-in user is not "SDG", detect and react to developer tools opening
  if (loggedInUser !== "SDG") {
    const detectDevTools = () => {
      const threshold = 160;
      const isDevToolsOpen = () => {
        return (
          window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold
        );
      };

      if (isDevToolsOpen()) {
        window.close();
        setTimeout(() => {
          window.location.href = "about:blank";
        }, 500);
      }
    };

    const checkDevTools = () => {
      detectDevTools();
      requestAnimationFrame(checkDevTools);
    };

    requestAnimationFrame(checkDevTools);
  }

  // Contact form handling: submit the data to a Firestore collection "contactMessages"
  const contactForm = document.getElementById("contact-form");
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
};
