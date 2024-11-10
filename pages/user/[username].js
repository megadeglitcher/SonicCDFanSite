// pages/user/[username].js

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

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

export default function UserPage({ userData, error }) {
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile: {userData.username}</h1>
      <p>Account Created On: {new Date(userData.createdAt).toLocaleString()}</p>
      {/* Display other user details here */}
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { username } = params;  // Get username from the URL

  try {
    // Fetch the user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', username));

    if (!userDoc.exists()) {
      return { props: { error: 'User not found' } };
    }

    const userData = userDoc.data();
    return {
      props: { userData }
    };
  } catch (error) {
    return {
      props: { error: 'Failed to fetch user data' }
    };
  }
}
