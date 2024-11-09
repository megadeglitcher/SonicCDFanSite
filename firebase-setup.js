// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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
const database = getDatabase(app);

window.submitComment = function() {
  const name = document.getElementById('name').value;
  const comment = document.getElementById('comment').value;

  if(name && comment) {
    const commentsRef = ref(database, 'comments');
    const newCommentRef = push(commentsRef);
    newCommentRef.set({
      name: name,
      comment: comment
    }).then(() => {
      document.getElementById('name').value = '';
      document.getElementById('comment').value = '';
    }).catch((error) => {
      console.error("Error adding comment: ", error);
    });
  }
};

window.loadComments = function() {
  const commentsRef = ref(database, 'comments');
  onValue(commentsRef, (snapshot) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      const commentElement = document.createElement('p');
      commentElement.textContent = `${childData.name}: ${childData.comment}`;
      commentsContainer.appendChild(commentElement);
    });
  });
};

window.onload = function() {
  loadComments();
}
