import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase setup
const db = getFirestore();

// Function to display user profile
async function displayUserProfile(username) {
  try {
    const userDoc = await getDoc(doc(db, "users", username));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const profileContainer = document.getElementById('profile-container');
      
      // Clear any previous content
      profileContainer.innerHTML = '';

      // Display user data
      const usernameElement = document.createElement('h2');
      usernameElement.textContent = `Username: ${userData.username}`;
      profileContainer.appendChild(usernameElement);

      const createdAtElement = document.createElement('p');
      const createdDate = new Date(userData.createdAt).toLocaleString();
      createdAtElement.textContent = `Account Created: ${createdDate}`;
      profileContainer.appendChild(createdAtElement);

    } else {
      displayMessage('User not found.');
    }
  } catch (error) {
    displayMessage('Error loading user data.');
    console.error(error);
  }
}

// Utility function to display messages
function displayMessage(message) {
  const profileContainer = document.getElementById('profile-container');
  profileContainer.innerHTML = `<p>${message}</p>`;
}

// Extract username from URL
window.onload = function() {
  const pathParts = window.location.pathname.split('/');
  const username = pathParts[pathParts.length - 1];  // Get the last part of the URL (username)
  displayUserProfile(username);
};
