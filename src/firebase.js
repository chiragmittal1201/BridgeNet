import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBu6EASttj9gzKpkhCE33jklSgON2nQEhc",
  authDomain: "alumni-management-240b6.firebaseapp.com",
  projectId: "alumni-management-240b6",
  storageBucket: "alumni-management-240b6.firebasestorage.app",
  messagingSenderId: "611540078044",
  appId: "1:611540078044:web:982cbfe56ca048a23a5319"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);