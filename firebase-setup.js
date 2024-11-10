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
  document.cookie = name + '=; Max-Age=-99999999;';  // Clear the cookie
}

// Check if the user is logged in by checking cookies
let loggedInUser = getCookie("loggedInUser");

// Function to display messages (error/success)
function displayMessage(elementId, message, isError = true) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    element.textContent = '';
  }, 5000);
}

// Register User
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
    await setDoc(doc(db, "users", username), { username, password });
    displayMessage('register-error-message', 'User registered successfully!', false);
  } catch (e) {
    displayMessage('register-error-message', 'Error registering user.');
  }
}

// Login User
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
      setCookie("loggedInUser", username, 7);  // Set cookie only on successful login
      displayMessage('login-error-message', 'User logged in successfully!', false);
      loadComments();  // Load comments after login
    } else {
      displayMessage('login-error-message', 'Incorrect password!');
    }
  } catch (e) {
    displayMessage('login-error-message', 'Error logging in.');
  }
}

// Logout User
window.logOff = function() {
  eraseCookie("loggedInUser");  // Clear the cookie
  loggedInUser = null;  // Reset logged-in user in JavaScript

  displayMessage('login-error-message', 'You have been logged out.', false);

  // Reload the comments to show the state after logging out
  loadComments();

  // Hide the comment section and show the register section
  document.getElementById('comment-section').style.display = 'none';
  document.getElementById('register-section').style.display = 'block';
  document.getElementById('logout-button').style.display = 'none';
};

// Submit Comment
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

  const createdAt = new Date().toISOString();  // Store in UTC

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

// Load Comments
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
      const commentTimestamp = document.createElement('p');

      // Check if the comment is from the user "SDG"
      if (commentData.name === "SDG") {
        // Apply reverse rainbow effect on username
        commentText.appendChild(rainbowText(`${commentData.name}: `, true));
        
        // Apply rainbow effect to the comment text
        const commentParts = commentData.comment.split('\n').map(part => rainbowText(part));
        commentParts.forEach(part => {
          commentText.appendChild(part);
          commentText.appendChild(document.createElement('br'));
        });

        // Apply outline effect to SDG comment text
        applyOutlineStyle(commentText);  // Add black outline
      } else {
        // Regular style for other users
        commentText.textContent = `${commentData.name}: ${commentData.comment}`;
      }

      // Timestamp formatting
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

// Initialize page behavior when loaded
window.onload = function() {
  // Check if a user is already logged in by checking the cookie
  if (loggedInUser) {
    // User is logged in - hide the registration form and show the comment section
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('comment-section').style.display = 'block';
    
    // Optionally, you can show the user's username or a logout button
    document.getElementById('logged-in-user').textContent = `Logged in as: ${loggedInUser}`;
    document.getElementById('logout-button').style.display = 'block';
  } else {
    // If no user is logged in, show the registration form
    document.getElementById('register-section').style.display = 'block';
    document.getElementById('comment-section').style.display = 'none';
    document.getElementById('logout-button').style.display = 'none';
  }
};

// Function for rainbow text effect
function rainbowText(text, reverse = false) {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  if (reverse) colors.reverse();
  const span = document.createElement('span');
  for (let i = 0; i < text.length; i++) {
    const charSpan = document.createElement('span');
    charSpan.style.color = colors[i % colors.length];
    charSpan.textContent = text[i];
    span.appendChild(charSpan);
  }
  return span;
}

// Function for outline effect
function applyOutlineStyle(element) {
  // Apply webkit text stroke (real outline effect)
  element.style.webkitTextStroke = '0.5px black'; // Black outline
  element.style.textFillColor = 'white'; // Text color
}

