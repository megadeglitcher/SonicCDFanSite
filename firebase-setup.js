// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const auth = getAuth(app);

// Utility function to manage cookies (get, set, and check)
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999;';
}

let loggedInUser = getCookie("loggedInUser");

// Display message to the user
function displayMessage(elementId, message, isError = true) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    element.textContent = '';
  }, 5000);
}

// Register a new user
async function registerUser() {
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();

  if (!username || !email || !password) {
    displayMessage('register-error-message', 'Please provide username, email, and password!');
    return;
  }

  try {
    // Create user with Firebase Authentication
    await createUserWithEmailAndPassword(auth, email, password);

    // After successful registration, store the username in Firestore
    const createdAt = new Date().toISOString(); // Store the registration time
    await setDoc(doc(db, "users", username), { 
      username, 
      email, 
      createdAt 
    });

    displayMessage('register-error-message', 'User registered successfully!', false);
  } catch (e) {
    displayMessage('register-error-message', 'Error registering user: ' + e.message);
  }
}

// Login an existing user
async function loginUser() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    displayMessage('login-error-message', 'Please provide both email and password!');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);

    // After login, retrieve username from Firestore based on email
    const username = email.split('@')[0];  // Username is email prefix (can be changed as needed)

    loggedInUser = username;  // Store the username
    setCookie("loggedInUser", username, 1993);  // Set cookie for 1993 days

    displayMessage('login-error-message', 'User logged in successfully!', false);
    loadComments();  // Load comments after login
  } catch (e) {
    displayMessage('login-error-message', 'Error logging in: ' + e.message);
  }
}

// Log off the current user
function logOff() {
  eraseCookie("loggedInUser");  // Clear the cookie
  loggedInUser = null;  // Reset logged-in user in JavaScript

  displayMessage('login-error-message', 'You have been logged out.', false);

  loadComments();  // Reload the comments to show the state after logging out
  document.getElementById('comment-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
}

// Submit a new comment
window.submitComment = async function() {
  if (!loggedInUser) {
    alert('You need to be logged in to submit a comment.');
    return;
  }
  
  const comment = document.getElementById('comment').value.trim();
  if (!comment) {
    alert('Comment cannot be blank!');
    return;
  }

  const createdAt = new Date().toISOString();  // Store in UTC format

  try {
    const docRef = await addDoc(collection(db, "comments"), {
      name: loggedInUser,
      comment,
      createdAt
    });
    document.getElementById('comment').value = '';
    loadComments();  // Reload comments after submission
  } catch (e) {
    console.error("Error adding comment:", e);
  }
};

// Load comments from Firestore
function loadComments() {
  const commentsRef = collection(db, "comments");
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';  // Clear previous comments

    snapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement('div');
      const commentText = document.createElement('p');
      commentText.textContent = `${commentData.name}: ${commentData.comment}`;
      commentElement.appendChild(commentText);
      commentsContainer.appendChild(commentElement);
    });
  });
}

// Load comments on page load
window.onload = function() {
  loadComments();  // Load comments on page load
};
