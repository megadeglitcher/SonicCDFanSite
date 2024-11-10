import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Function to display user profile
async function displayUserProfile() {
  // Extract the username from the URL hash (e.g., #/User/SDG)
  const hash = window.location.hash;
  const parts = hash.split('/');  // Split the hash string by "/"
  
  // Ensure the hash follows the correct format "#/User/{username}"
  if (parts.length < 3 || parts[1] !== 'User') {
    document.getElementById('error-message').textContent = 'Invalid URL format. Expected: /user-profile.html#/User/{username}';
    return;
  }

  const username = parts[2];  // Extract username (the part after "/User/")

  if (!username) {
    document.getElementById('error-message').textContent = 'Username is required in the URL.';
    return;
  }

  // Fetch the user data from Firestore
  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      document.getElementById('error-message').textContent = `User "${username}" not found.`;
      return;
    }

    const userData = userDoc.data();
    document.getElementById('username').textContent = userData.username;
    document.getElementById('created-at').textContent = new Date(userData.createdAt).toLocaleString();
  } catch (e) {
    document.getElementById('error-message').textContent = 'Error fetching user data.';
  }
}

// Run the function to display the profile when the page loads
window.onload = displayUserProfile;
