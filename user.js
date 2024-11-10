// Function to display user profile
async function displayUserProfile(username) {
  try {
    // Log the username to ensure it is being passed correctly
    console.log("Fetching profile for:", username);

    const response = await fetch(`/api/${username}`); // This is the dynamic serverless function URL
    if (response.ok) {
      const userData = await response.json();

      // Log the user data to check if it's being fetched correctly
      console.log("User data:", userData);

      // Display the user profile
      const profileContainer = document.getElementById('profile-container');
      profileContainer.innerHTML = ''; // Clear any existing content

      // Display username
      const usernameElement = document.createElement('h2');
      usernameElement.textContent = `Username: ${userData.username}`;
      profileContainer.appendChild(usernameElement);

      // Display account creation date
      const createdAtElement = document.createElement('p');
      const createdDate = new Date(userData.createdAt).toLocaleString();
      createdAtElement.textContent = `Account Created: ${createdDate}`;
      profileContainer.appendChild(createdAtElement);

    } else {
      // If the user doesn't exist or an error occurs
      displayMessage('User not found.');
    }
  } catch (error) {
    // If there's an error fetching the data
    console.error("Error fetching user data:", error);
    displayMessage('Error loading user data.');
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

  if (username) {
    displayUserProfile(username);  // Call function to load user profile
  } else {
    displayMessage('No username specified.');
  }
};
