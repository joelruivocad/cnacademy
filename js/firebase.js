import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3cV8LtZfOQlTJ3UUa5eMT9Zv-IoSUYaI",
  authDomain: "cnacademy-eb202.firebaseapp.com",
  projectId: "cnacademy-eb202",
  storageBucket: "cnacademy-eb202.firebasestorage.app",
  messagingSenderId: "372322516007",
  appId: "1:372322516007:web:163ef42cbef775bd7aa202"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
