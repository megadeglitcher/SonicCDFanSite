import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Firestore initialization
const db = getFirestore();

export default async function handler(req, res) {
  const { username } = req.query;  // Extract the username from the URL

  try {
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }

    // Attempt to fetch the user data from Firestore
    const userDoc = await getDoc(doc(db, "users", username));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      res.status(200).json(userData);  // Return user data as JSON
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);  // Log any errors to the console
    res.status(500).json({ message: "Error loading user data" });
  }
}
