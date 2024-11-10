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

// Register user function
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

// Login user function
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
      document.getElementById('logoff-btn').style.display = 'inline'; // Show log off button
    } else {
      displayMessage('login-error-message', 'Incorrect password!');
    }
  } catch (e) {
    displayMessage('login-error-message', 'Error logging in.');
  }
}

// Format timestamp as DDMMYYYYHHMMSS
function getFormattedTimestamp() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits for day
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Ensure two digits for month
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0'); // Ensure two digits for hours
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Ensure two digits for minutes
  const seconds = String(now.getSeconds()).padStart(2, '0'); // Ensure two digits for seconds

  // Return timestamp in DDMMYYYYHHMMSS format
  return `${day}${month}${year}${hours}${minutes}${seconds}`;
}

// Submit comment function
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

  const createdAt = getFormattedTimestamp();  // Use the new timestamp format

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

      // Format the timestamp from DDMMYYYYHHMMSS
      const formattedTimestamp = formatTimestamp(commentData.createdAt);
      commentTimestamp.textContent = formattedTimestamp;
      commentTimestamp.style.fontSize = 'small';
      commentTimestamp.style.fontStyle = 'italic';
      commentTimestamp.style.color = 'rgba(0, 0, 0, 0.5)';

      commentElement.appendChild(commentText);
      commentElement.appendChild(commentTimestamp);
      commentsContainer.appendChild(commentElement);
    });
  });
}

// Function to format timestamp
function formatTimestamp(timestamp) {
  const day = timestamp.substring(0, 2);
  const month = timestamp.substring(2, 4);
  const year = timestamp.substring(4, 8);
  const hour = timestamp.substring(8, 10);
  const minute = timestamp.substring(10, 12);
  const second = timestamp.substring(12, 14);

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

// Log off function
window.logOff = function() {
  eraseCookie("loggedInUser");
  loggedInUser = null;
  loadComments();
  document.getElementById('logoff-btn').style.display = 'none';
  alert('You have logged off!');
};

// Apply rainbow text effect
function rainbowText(text, isUsername = false) {
  const rainbowColors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"];
  const spanElement = document.createElement('span');
  let colorIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const letter = document.createElement('span');
    letter.textContent = text[i];
    letter.style.color = rainbowColors[colorIndex];
    if (isUsername) {
      letter.style.fontWeight = 'bold';
    }
    spanElement.appendChild(letter);
    colorIndex = (colorIndex + 1) % rainbowColors.length;  // Loop through colors
  }

  return spanElement;
}

// Apply outline effect
function applyOutlineStyle(element) {
  const style = `
    text-shadow:
      2px 2px 0px #000, 0px 2px 0px #000, -2px 2px 0px #000, 
      2px -2px 0px #000, -2px -2px 0px #000, 
      2px 0px 0px #000, 0px 2px 0px #000, -2px 0px 0px #000, 0px -2px 0px #000;
  `;
  element.style.cssText += style;
}
