// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Check if the user is logged in by checking cookies
let loggedInUser = getCookie("loggedInUser");

function displayMessage(elementId, message, isError = true) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    element.textContent = '';
  }, 5000);
}

async function registerUser(username, password) {
  username = username.trim();
  if (!username) {
    displayMessage('register-error-message', 'Username cannot be empty or just whitespace!');
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (userDoc.exists()) {
      displayMessage('register-error-message', 'Username already in use!');
      return;
    }
    const createdAt = new Date().toISOString(); // Get the current date and time
    await setDoc(doc(db, "users", username), { 
      username, 
      password,
      createdAt  // Store user creation date
    });
    displayMessage('register-error-message', 'User registered successfully!', false);
  } catch (e) {
    displayMessage('register-error-message', 'Error registering user.');
  }
}

async function loginUser(username, password) {
  username = username.trim();
  if (!username) {
    displayMessage('login-error-message', 'Username cannot be empty or just whitespace!');
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      displayMessage('login-error-message', 'Username does not exist!');
      return;
    }
    const userData = userDoc.data();
    if (userData.password === password) {
      loggedInUser = username;
      setCookie("loggedInUser", username, 1993);  // Set cookie for 1993 days only during login
      displayMessage('login-error-message', 'User logged in successfully!', false);
      loadComments();  // Load comments after login
    } else {
      displayMessage('login-error-message', 'Incorrect password!');
    }
  } catch (e) {
    displayMessage('login-error-message', 'Error logging in.');
  }
}

window.registerUser = registerUser;
window.loginUser = loginUser;

// Extract the current HTML filename without extension
const currentPage = window.location.pathname.split('/').pop().split('.')[0];

// Determine the Firebase collection name based on the current page
const commentsCollectionName = `comments-${currentPage}`;

window.submitComment = async function() {
  if (!loggedInUser) {
    alert('You need to be logged in to do that.');
    return;
  }
  const comment = document.getElementById('comment').value.trim();
  if (!comment) {
    alert('Comment cannot be blank!');
    return;
  }

  const createdAt = new Date().toISOString(); // Store in UTC

  try {
    await addDoc(collection(db, commentsCollectionName), {
      name: loggedInUser,
      comment,
      createdAt
    });
    document.getElementById('comment').value = '';
    loadComments(); // Reload comments after submission
  } catch (e) {
    console.error("Error adding comment:", e);
  }
};

// Add this function to handle the log off functionality
window.logOff = function() {
  eraseCookie("loggedInUser"); // Clear the cookie
  loggedInUser = null; // Reset logged-in user in JavaScript

  displayMessage('login-error-message', 'You have been logged out.', false);

  // Reload the comments to show the state after logging out
  loadComments();

  // Optionally, update the UI to show login buttons and hide comment form
  document.getElementById('comment-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
};

function loadComments() {
  const commentsRef = collection(db, commentsCollectionName);
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = ''; // Clear previous comments
    snapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement('div');
      const commentText = document.createElement('p');
      const commentTimestamp = document.createElement('p');

      commentText.textContent = `${commentData.name}: ${commentData.comment}`;
      commentTimestamp.textContent = new Date(commentData.createdAt).toLocaleString();
      commentTimestamp.style.fontSize = 'small';
      commentTimestamp.style.fontStyle = 'italic';
      commentTimestamp.style.color = 'rgba(0, 0, 0, 0.6)';
      commentTimestamp.style.marginTop = '-10px';

      // Append elements to the comment container
      commentElement.appendChild(commentText);
      commentElement.appendChild(commentTimestamp);
      commentsContainer.appendChild(commentElement);
    });
  });
}

// Load comments dynamically based on the current page's collection
window.onload = function() {
  loadComments(); // Load comments on page load
};
