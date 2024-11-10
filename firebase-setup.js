// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
    element.textContent = '';
  }, 5000);
}

async function registerUser(username, password) {
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
    console.error("User must be logged in to submit a comment");
    return;
  }
  const comment = document.getElementById('comment').value.trim();
  if (!comment) {
    alert('Comment cannot be blank!');
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "comments"), {
      name: loggedInUser,
      comment: comment,
      createdAt: serverTimestamp()
    });
    console.log("Document written with ID: ", docRef.id);
    document.getElementById('comment').value = '';
    loadComments();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

window.loadComments = function() {
  const commentsRef = collection(db, "comments");
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';
    snapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement('p');
      commentElement.textContent = `${commentData.name}: ${commentData.comment}`;
      commentsContainer.appendChild(commentElement);
    });
  });
};

window.onload = function() {
  loadComments();
};
