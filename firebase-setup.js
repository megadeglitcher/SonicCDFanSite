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
  // Check if username is valid
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
    const createdAt = new Date().toISOString();  // Get the current date and time
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
      loadComments();  // Load comments after login
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

    // Update password
    await setDoc(doc(db, "users", username), { ...userData, password: newPassword });
    alert('Password changed successfully!');
  } catch (e) {
    alert('Error changing password.');
  }
};

// Submit comment function
window.submitComment = async function() {
  const comment = document.getElementById('comment').value.trim();
  if (!comment) {
    alert('Please write a comment.');
    return;
  }

  const createdAt = new Date().toISOString();  // Store in UTC

  try {
    const docRef = await addDoc(collection(db, "comments"), {
      name: "User",  // Replace with logged-in user's name
      comment,
      createdAt
    });
    document.getElementById('comment').value = '';  // Clear comment field
    loadComments();  // Reload comments after submission
  } catch (e) {
    console.error("Error adding comment:", e);
  }
};

// Load comments function
function loadComments() {
  const commentsRef = collection(db, "comments");
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';  // Clear existing comments
    snapshot.forEach((doc) => {
      const commentData = doc.data();

      // Create a comment container
      const commentElement = document.createElement('div');
      commentElement.classList.add('comment');

      // Create the username element
      const usernameElement = document.createElement('p');
      if (commentData.name === "SDG") {
        usernameElement.appendChild(rainbowText(commentData.name));  // Apply rainbow effect to SDG's name
      } else {
        usernameElement.textContent = commentData.name;  // Regular name for others
      }
      usernameElement.classList.add('username');

      // Create the comment text
      const commentText = document.createElement('p');
      commentText.textContent = commentData.comment;

      // Append username and comment text to the comment container
      commentElement.appendChild(usernameElement);
      commentElement.appendChild(commentText);

      // Append the comment to the container
      commentsContainer.appendChild(commentElement);
    });
  });
}

// Function to apply the rainbow effect to SDG's name
function rainbowText(text) {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  const span = document.createElement('span');
  for (let i = 0; i < text.length; i++) {
    const charSpan = document.createElement('span');
    charSpan.style.color = colors[i % colors.length];
    charSpan.textContent = text[i];
    span.appendChild(charSpan);
  }
  return span;
}
