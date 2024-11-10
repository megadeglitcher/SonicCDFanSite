// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
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
const db = getFirestore(app);

// Register user function
window.registerUser = async function(username, password) {
  username = username.trim();
  if (!username) {
    alert('Username cannot be empty or just whitespace!');
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (userDoc.exists()) {
      alert('Username already in use!');
      return;
    }
    const createdAt = new Date().toISOString();
    await setDoc(doc(db, "users", username), { username, password, createdAt });
    alert('User registered successfully!');
  } catch (e) {
    alert('Error registering user.');
  }
};

// Login user function
window.loginUser = async function(username, password) {
  username = username.trim();
  if (!username) {
    alert('Username cannot be empty or just whitespace!');
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      alert('Username does not exist!');
      return;
    }
    const userData = userDoc.data();
    if (userData.password === password) {
      alert('User logged in successfully!');
      loadComments();
    } else {
      alert('Incorrect password!');
    }
  } catch (e) {
    alert('Error logging in.');
  }
};

// Change password function
window.changePassword = async function(username, currentPassword, newPassword) {
  username = username.trim();
  currentPassword = currentPassword.trim();
  newPassword = newPassword.trim();

  if (!username || !currentPassword || !newPassword) {
    alert('All fields are required.');
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      alert('Username does not exist!');
      return;
    }

    const userData = userDoc.data();
    if (userData.password !== currentPassword) {
      alert('Current password is incorrect!');
      return;
    }

    await setDoc(doc(db, "users", username), { ...userData, password: newPassword });
    alert('Password changed successfully!');
  } catch (e) {
    alert('Error changing password.');
  }
};

// Comment functionality (submit and load comments)
window.submitComment = async function() {
  // Check if user is logged in (you can implement a check using cookies or state)
  const comment = document.getElementById('comment').value.trim();
  if (!comment) {
    alert('Comment cannot be blank!');
    return;
  }

  const createdAt = new Date().toISOString();

  try {
    await addDoc(collection(db, "comments"), {
      name: "Logged In User",  // Use the logged-in username here
      comment,
      createdAt
    });
    document.getElementById('comment').value = '';
    loadComments();
  } catch (e) {
    console.error('Error adding comment:', e);
  }
};

// Load comments function
function loadComments() {
  const commentsRef = collection(db, "comments");
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';
    snapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement('div');
      const commentText = document.createElement('p');
      commentText.textContent = `${commentData.name}: ${commentData.comment}`;
      commentElement.appendChild(commentText);
      commentsContainer.appendChild(commentElement);
    });
  });
}

// Log out function
window.logOff = function() {
  alert('You have logged off!');
  // Implement logout functionality (clear session or cookies if needed)
};

