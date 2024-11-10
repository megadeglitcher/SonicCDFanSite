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

async function registerUser(username, password) {
  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (userDoc.exists()) {
      console.error("Username already exists!");
      return;
    }
    await setDoc(doc(db, "users", username), {
      username: username,
      password: password
    });
    console.log("User registered successfully!");
  } catch (e) {
    console.error("Error registering user: ", e);
  }
}

async function loginUser(username, password) {
  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      console.error("Username does not exist!");
      return;
    }
    const userData = userDoc.data();
    if (userData.password === password) {
      console.log("User logged in successfully!");
      loggedInUser = username;  // Store the logged-in user's username
      // Handle successful login
    } else {
      console.error("Incorrect password!");
    }
  } catch (e) {
    console.error("Error logging in: ", e);
  }
}

window.registerUser = registerUser;
window.loginUser = loginUser;

window.submitComment = async function() {
  if (!loggedInUser) {
    console.error("User must be logged in to submit a comment");
    return;
  }
  const comment = document.getElementById('comment').value || "No comment provided";

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
