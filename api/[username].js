import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase setup
const db = getFirestore();

export default async function handler(req, res) {
  const { username } = req.query;  // Extract the username from the URL (e.g., /api/SDG)

  try {
    // Fetch the user document from Firebase Firestore
    const userDoc = await getDoc(doc(db, "users", username));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      res.status(200).json(userData);  // Return user data as a JSON response
    } else {
      res.status(404).json({ message: 'User not found' });  // If user doesn't exist
    }
  } catch (error) {
    res.status(500).json({ message: 'Error loading user data' });  // Handle server error
  }
}
