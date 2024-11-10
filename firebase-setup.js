// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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

// Utility to display messages
function displayMessage(elementId, message, isError = true) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    element.textContent = '';
  }, 5000);
}

// Register user
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // After successful registration, store the username in Firestore
    const user = userCredential.user;
    const createdAt = new Date().toISOString(); // Store the registration time

    // Store the username and email in Firestore
    await setDoc(doc(db, "users", user.uid), { 
      username, 
      email: user.email, 
      createdAt 
    });

    displayMessage('register-error-message', 'User registered successfully!', false);
  } catch (e) {
    displayMessage('register-error-message', 'Error registering user: ' + e.message);
  }
}

// Login user
async function loginUser() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    displayMessage('login-error-message', 'Please provide email and password!');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    displayMessage('login-error-message', 'User logged in successfully!', false);
    document.getElementById('comment-section').style.display = 'block';
    document.getElementById('logoff-button').style.display = 'inline-block';

    loadComments();  // Load comments after login
  } catch (e) {
    displayMessage('login-error-message', 'Error logging in: ' + e.message);
  }
}

// Log off user
function logOff() {
  signOut(auth).then(() => {
    displayMessage('login-error-message', 'You have been logged out.', false);
    document.getElementById('comment-section').style.display = 'none';
    document.getElementById('logoff-button').style.display = 'none';
    loadComments();  // Reload comments to reflect logged-out state
  }).catch((e) => {
    displayMessage('login-error-message', 'Error logging out: ' + e.message);
  });
}

// Submit comment
async function submitComment() {
  const comment = document.getElementById('comment').value.trim();
  if (!comment) {
    alert('Comment cannot be blank!');
    return;
  }

  const createdAt = new Date().toISOString();

  try {
    const docRef = await addDoc(collection(db, "comments"), {
      comment,
      createdAt,
      userId: auth.currentUser.uid  // Store the user ID along with the comment
    });

    document.getElementById('comment').value = '';
    loadComments();  // Reload comments after submission
  } catch (e) {
    console.error("Error adding comment:", e);
  }
}

// Load comments
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
