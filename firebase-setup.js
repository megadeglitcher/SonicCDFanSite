// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
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
const analytics = getAnalytics(app);
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
    console.log("User registered successfully!");
    displayMessage('register-error-message', 'User registered successfully!', false);
  } catch (e) {
    console.error("Error registering user: ", e);
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
      console.log("User logged in successfully!");
      loggedInUser = username;
      displayMessage('login-error-message', 'User logged in successfully!', false);
    } else {
      displayMessage('login-error-message', 'Incorrect password!');
    }
  } catch (e) {
    console.error("Error logging in: ", e);
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

  const createdAt = new Date().toISOString();  // Store in UTC

  try {
    const docRef = await addDoc(collection(db, "comments"), {
      name: loggedInUser,
      comment: comment,
      createdAt: createdAt
    });
    console.log("Document written with ID: ", docRef.id);
    document.getElementById('comment').value = '';
    loadComments();  // Load comments after submitting
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(); // Convert UTC to local time for display
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
        
        // Apply normal rainbow effect on the comment text
        const commentParts = commentData.comment.split('\n').map(part => rainbowText(part));
        commentParts.forEach(part => {
          commentText.appendChild(part);
          commentText.appendChild(document.createElement('br'));
        });

        // Add a black outline around the comment text
        commentText.style.textShadow = '1px 1px 0px black';
        commentText.style.textShadow = '-1px -1px 0px black';
        commentText.style.textShadow = '1px 0px 0px black';
        commentText.style.textShadow = '0px 1px 0px black';
        commentText.style.textShadow = '-1px 0px 0px black';
        commentText.style.textShadow = '0px -1px 0px black';
        commentText.style.textShadow = '1px -1px 0px black';
        commentText.style.textShadow = '-1px 1px 0px black';
      } else {
        // Regular style for other users
        commentText.textContent = `${commentData.name}: ${commentData.comment}`;
      }

      // Timestamp formatting
      commentTimestamp.textContent = formatTimestamp(commentData.createdAt);
      commentTimestamp.style.fontSize = 'small';
      commentTimestamp.style.fontStyle = 'italic';
      commentTimestamp.style.color = 'rgba(0, 0, 0, 0.6)';
      commentTimestamp.style.marginTop = '-10px';

      // Append elements to the comment container
      commentElement.appendChild(commentText);
      commentElement.appendChild(commentTimestamp);
      commentsContainer.appendChild(commentElement);  // Append to show newest comments at the bottom
    });
  });
};

// Ensure comments load immediately when the page loads
window.onload = function() {
  loadComments();
};

document.getElementById('comment').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.altKey && !event.ctrlKey) {
    event.preventDefault();
    submitComment();
  } else if ((event.key === 'Enter' && event.altKey) || (event.key === 'Enter' && event.ctrlKey)) {
    event.preventDefault();
    this.value += '\n';
  }
});

document.getElementById('login-username').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    loginUser(document.getElementById('login-username').value, document.getElementById('login-password').value);
  }
});
