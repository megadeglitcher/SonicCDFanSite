// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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

async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), { email: user.email, createdAt: new Date().toISOString() });
    displayMessage('register-error-message', 'User registered successfully!', false);
  } catch (e) {
    displayMessage('register-error-message', `Error: ${e.message}`);
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    loggedInUser = user.uid;
    setCookie("loggedInUser", user.uid, 1993);  // Set cookie for 1993 days
    displayMessage('login-error-message', 'User logged in successfully!', false);
    loadComments(); // Load comments after login
  } catch (e) {
    displayMessage('login-error-message', `Error: ${e.message}`);
  }
}

window.registerUser = registerUser;
window.loginUser = loginUser;

// Extract the current HTML filename without extension
const currentPage = window.location.pathname.split('/').pop().split('.')[0];

// Determine the Firebase collection name based on the current page
const commentsCollectionName = `comments-${currentPage}`;

window.submitComment = async function() {
  const user = auth.currentUser;
  if (!user) {
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
      userId: user.uid,
      username: user.email, // Or username if you store that separately
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
  signOut(auth).then(() => {
    eraseCookie("loggedInUser"); // Clear the cookie
    loggedInUser = null; // Reset logged-in user in JavaScript
    displayMessage('login-error-message', 'You have been logged out.', false);
    loadComments();
    document.getElementById('comment-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
  }).catch((e) => {
    displayMessage('login-error-message', `Error logging out: ${e.message}`);
  });
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
      commentText.textContent = `${commentData.username}: ${commentData.comment}`;
      const commentTimestamp = document.createElement('p');
      commentTimestamp.textContent = new Date(commentData.createdAt).toLocaleString();
      commentsContainer.appendChild(commentElement);
    });
  });
}

// Check if the user is authenticated on page load
window.onload = function() {
  loadComments(); // Load comments on page load
  
  
  
  if (loggedInUser !== "SDG") {
    const detectDevTools = () => {
      const threshold = 160; // Height/Width of the console when open
      const isDevToolsOpen = () => {
        return (
          window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold
        );
      };

      let devToolsOpened = isDevToolsOpen();

      if (devToolsOpened) {
        window.close(); // Attempt to close the window
        setTimeout(() => {
          window.location.href = "about:blank"; // Fallback by navigating to an empty page
        }, 500); // Ensure window.close is triggered
      }
    };

    // Use requestAnimationFrame to check every frame
    const checkDevTools = () => {
      detectDevTools(); // Check on every frame
      requestAnimationFrame(checkDevTools); // Recurse on next frame
    };
};

