// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYfGKVJZPr26tT093UQRbeKKWMO3yBUhM",
  authDomain: "job-int-123.firebaseapp.com",
  projectId: "job-int-123",
  storageBucket: "job-int-123.firebasestorage.app",
  messagingSenderId: "759572272093",
  appId: "1:759572272093:web:f5cb0a5139b8d6bcf99c34",
  measurementId: "G-86H81Q82KH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;