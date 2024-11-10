// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
      comment: comment
    });
    console.log("Document written with ID: ", docRef.id);
    document.getElementById('name').value = '';
    document.getElementById('comment').value = '';
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

window.loadComments = async function() {
  const commentsContainer = document.getElementById('comments-container');
  commentsContainer.innerHTML = '';
  
  try {
    const querySnapshot = await getDocs(collection(db, "comments"));
    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentElement = document.createElement('p');
      commentElement.textContent = `${commentData.name}: ${commentData.comment}`;
      commentsContainer.appendChild(commentElement);
    });
  } catch (e) {
    console.error("Error loading comments: ", e);
  }
};

window.onload = function() {
  loadComments();
};
