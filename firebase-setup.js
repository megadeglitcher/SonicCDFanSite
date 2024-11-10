// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
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

let loggedInUser = null;

function displayMessage(elementId, message, isError = true) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    if (element.textContent === message) {
      element.textContent = '';
    }
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
    await setDoc(doc(db, "users", username), {
      username: username,
      password: password
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
      displayMessage('login-error-message', 'User logged in successfully!', false);
    } else {
      displayMessage('login-error-message', 'Incorrect password!');
    }
  } catch (e) {
    displayMessage('login-error-message', 'Error logging in.');
  }
}

window.registerUser = registerUser;
window.loginUser = loginUser;

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

  const createdAt = new Date();
  const datePart = createdAt.toLocaleDateString('en-GB').replaceAll('/', '');
  const timePart = createdAt.toLocaleTimeString('en-GB').replaceAll(':', '');
  const timestamp = datePart + timePart;

  try {
    const docRef = await addDoc(collection(db, "comments"), {
      name: loggedInUser,
      comment: comment,
      createdAt: timestamp
    });
    document.getElementById('comment').value = '';
    loadComments();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

function formatTimestamp(timestamp) {
  const datePart = timestamp.slice(0, 8);
  const timePart = timestamp.slice(8, 14);
  const dateFormatted = `${datePart.slice(0, 2)}/${datePart.slice(2, 4)}/${datePart.slice(4, 8)}`;
  const timeFormatted = `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}:${timePart.slice(4, 6)}`;
  return `${dateFormatted} ~ ${timeFormatted}`;
}

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

window.loadComments = function() {
  const commentsRef = collection(db, "comments");
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';  // Clear existing comments

    snapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement('div');
      const commentText = document.createElement('p');
      const commentTimestamp = document.createElement('p');

      // Apply custom styling for SDG user
      if (commentData.name === "SDG") {
        commentText.appendChild(rainbowText(`${commentData.name}: `, true));
        const commentParts = commentData.comment.split('\n').map(part => rainbowText(part));
        commentParts.forEach(part => {
          commentText.appendChild(part);
          commentText.appendChild(document.createElement('br'));
        });
      } else {
        commentText.textContent = `${commentData.name}: ${commentData.comment}`;
      }

      // Format and display timestamp in local time
      commentTimestamp.textContent = formatTimestamp(commentData.createdAt);
      commentTimestamp.style.fontSize = 'small';
      commentTimestamp.style.fontStyle = 'italic';
      commentTimestamp.style.color = 'rgba(0, 0, 0, 0.6)';
      commentTimestamp.style.marginTop = '-10px';

      // Prepend the new comment to ensure the newest comment appears at the top
      commentElement.appendChild(commentText);
      commentElement.appendChild(commentTimestamp);
      commentsContainer.prepend(commentElement);  
    });
  });
};

// Ensure comments load immediately when the page first appears
document.addEventListener('DOMContentLoaded', loadComments);

// Add event listeners to allow pressing Enter for login and register
document.getElementById('login-username').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    loginUser(document.getElementById('login-username').value, document.getElementById('login-password').value);
  }
});

document.getElementById('login-password').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    loginUser(document.getElementById('login-username').value, document.getElementById('login-password').value);
  }
});

document.getElementById('register-username').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    registerUser(document.getElementById('register-username').value, document.getElementById('register-password').value);
  }
});

document.getElementById('register-password').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    registerUser(document.getElementById('register-username').value, document.getElementById('register-password').value);
  }
});
