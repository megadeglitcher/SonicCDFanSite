// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

window.submitComment = async function() {
  const name = document.getElementById('name').value || "Anonymous";
  const comment = document.getElementById('comment').value || "No comment provided";

  try {
    const docRef = await addDoc(collection(db, "comments"), {
      name: name,
      comment: comment,
      createdAt: serverTimestamp()  // Add a timestamp
    });
    console.log("Document written with ID: ", docRef.id);
    document.getElementById('name').value = '';
    document.getElementById('comment').value = '';
    loadComments();  // Load comments immediately after submitting
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

window.loadComments = function() {
  const commentsRef = collection(db, "comments");
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));  // Order by timestamp descending
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
