// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Utility function to display messages
function displayMessage(elementId, message, isError = true) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    element.textContent = '';
  }, 5000);
}

// Register user function
async function registerUser() {
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  console.log("Registering user...", username, email, password);

  // Check if any input is empty or undefined
  if (!username || !email || !password) {
    displayMessage('register-error-message', 'Please provide username, email, and password!');
    return;
  }

  // Trim the values after the check
  const usernameTrimmed = username.trim();
  const emailTrimmed = email.trim();
  const passwordTrimmed = password.trim();

  if (!usernameTrimmed || !emailTrimmed || !passwordTrimmed) {
    displayMessage('register-error-message', 'Username, email, or password cannot be empty or just whitespace!');
    return;
  }

  try {
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, emailTrimmed, passwordTrimmed);
    console.log("User created:", userCredential);

    // After successful registration, store the username in Firestore
    const user = userCredential.user;
    const createdAt = new Date().toISOString(); // Store the registration time

    // Store the username and email in Firestore
    await setDoc(doc(db, "users", user.uid), { 
      username: usernameTrimmed, 
      email: user.email, 
      createdAt 
    });

    displayMessage('register-error-message', 'User registered successfully!', false);
  } catch (e) {
    console.log("Error during registration:", e);
    displayMessage('register-error-message', 'Error registering user: ' + e.message);
  }
}

// Login user function
async function loginUser() {
  const email = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    displayMessage('login-error-message', 'Please provide email and password!');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential);

    // User logged in, now fetch username from Firestore using user.uid
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User data:", userData);
      displayMessage('login-error-message', `Welcome back, ${userData.username}!`, false);
      loadComments();  // Load comments after login
    } else {
      displayMessage('login-error-message', 'User data not found!');
    }
  } catch (e) {
    displayMessage('login-error-message', 'Error logging in: ' + e.message);
  }
}

// Log off function
function logOff() {
  signOut(auth).then(() => {
    displayMessage('login-error-message', 'Logged out successfully!', false);
    loadComments();  // Reload comments after logout
  }).catch((error) => {
    displayMessage('login-error-message', 'Error logging out: ' + error.message);
  });
}

// Submit comment function
async function submitComment() {
  const comment = document.getElementById('comment').value.trim();
  if (!comment) {
    alert('Comment cannot be blank!');
    return;
  }

  const createdAt = new Date().toISOString();  // Store in UTC
  try {
    const docRef = await addDoc(collection(db, "comments"), {
      comment,
      createdAt
    });
    document.getElementById('comment').value = '';  // Clear comment field
    loadComments();  // Reload comments after submission
  } catch (e) {
    console.error("Error adding comment:", e);
  }
}

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
      commentText.textContent = commentData.comment;
      const commentTimestamp = document.createElement('p');
      commentTimestamp.textContent = new Date(commentData.createdAt).toLocaleString();
      commentTimestamp.style.fontSize = 'small';
      commentTimestamp.style.fontStyle = 'italic';
      commentTimestamp.style.color = 'rgba(0, 0, 0, 0.6)';
      commentTimestamp.style.marginTop = '-10px';
      commentElement.appendChild(commentText);
      commentElement.appendChild(commentTimestamp);
      commentsContainer.appendChild(commentElement);
    });
  });
}

window.onload = function() {
  loadComments();  // Load comments on page load
};

