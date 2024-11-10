import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrxSA-Y5FjKCkULoQ3iwCiKaupZOSK9FU",
  authDomain: "your-project-id.firebaseapp.com", // Replace with your Firebase project ID
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  const userStatus = document.getElementById('user-status');
  if (user) {
    userStatus.textContent = `Logged in as: ${user.email}`;
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
  } else {
    userStatus.textContent = 'You are not logged in.';
  }
});

// Register User
document.getElementById('register-btn').addEventListener('click', async () => {
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();

  if (email === '' || password === '') {
    document.getElementById('register-error').textContent = 'Please fill in both fields.';
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    document.getElementById('register-error').textContent = 'Registration successful!';
  } catch (error) {
    document.getElementById('register-error').textContent = error.message;
  }
});

// Login User
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (email === '' || password === '') {
    document.getElementById('login-error').textContent = 'Please fill in both fields.';
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('login-error').textContent = 'Login successful!';
  } catch (error) {
    document.getElementById('login-error').textContent = error.message;
  }
});

// Submit Comment
document.getElementById('submit-comment-btn').addEventListener('click', async () => {
  const commentInput = document.getElementById('comment-input').value.trim();

  if (!commentInput) {
    displayMessage('comment-error-message', 'Comment cannot be empty!');
    return;
  }

  try {
    const user = auth.currentUser;
    if (user) {
      // If user is logged in, submit the comment
      const newComment = {
        userId: user.uid,
        comment: commentInput,
        timestamp: new Date(),
      };

      // Add the comment to Firestore collection 'comments'
      await addDoc(collection(db, 'comments'), newComment);
      document.getElementById('comment-input').value = ''; // Clear input
      displayMessage('comment-error-message', 'Comment submitted successfully!', true);
    } else {
      displayMessage('comment-error-message', 'You need to log in to submit a comment.');
    }
  } catch (error) {
    console.error('Error submitting comment: ', error);
    displayMessage('comment-error-message', 'Error submitting comment. Please try again later.');
  }
});

// Display error or success message
function displayMessage(elementId, message, success = false) {
  const element = document.getElementById(elementId);
  element.style.color = success ? 'green' : 'red';
  element.textContent = message;
}
