// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

let loggedInUser = null;

// Display messages in the UI
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

// Register user function
window.registerUser = async function() {
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();

  if (!username || !password) {
    displayMessage('register-error-message', 'Username and Password cannot be empty or just whitespace!');
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
};

// Fetch IP address using ipify API
async function getIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip; // Return the user's IP address
  } catch (error) {
    console.error('Error fetching IP address', error);
    return null;
  }
}

// Login user function
window.loginUser = async function() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    displayMessage('login-error-message', 'Username and Password cannot be empty or just whitespace!');
    return;
  }

  const machineName = prompt("Do you want to be remembered on this device? If so, please provide your machine name (or leave empty).");

  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      displayMessage('login-error-message', 'Username does not exist!');
      return;
    }
    const userData = userDoc.data();
    if (userData.password === password) {
      console.log("User logged in successfully!");

      // Save the user's IP and machine name (if provided) when they log in
      const ip = await getIP();
      if (ip) {
        const userSession = {
          ip: ip,
          machineName: machineName || 'default-machine', // If no machine name, use a default
        };
        // Store user session in database or cookies/localStorage
        localStorage.setItem('userSession', JSON.stringify(userSession));
        loggedInUser = username;
        displayMessage('login-error-message', 'User logged in successfully!', false);
        loadComments(); // Load comments once logged in
      }
    } else {
      displayMessage('login-error-message', 'Incorrect password!');
    }
  } catch (e) {
    console.error("Error logging in: ", e);
    displayMessage('login-error-message', 'Error logging in.');
  }
};

// Submit a new comment
window.submitComment = async function() {
  if (!loggedInUser) {
    alert('You need to be logged in to post a comment.');
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
    loadComments(); // Reload comments after posting
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

// Load and display comments
window.loadComments = function() {
  const commentsRef = collection(db, "comments");
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = ''; // Clear existing comments

    snapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement('div');
      commentElement.classList.add('comment');
      
      const commentText = document.createElement('p');
      commentText.textContent = `${commentData.name}: ${commentData.comment}`;
      commentElement.appendChild(commentText);

      const commentTimestamp = document.createElement('p');
      commentTimestamp.textContent = formatTimestamp(commentData.createdAt);
      commentTimestamp.classList.add('timestamp');
      commentElement.appendChild(commentTimestamp);

      commentsContainer.prepend(commentElement);  // Newest comments appear at the top
    });
  });
};

// Format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(); // Convert UTC to local time for display
}
