// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: `${import.meta.env.FIREBASE_API_KEY}`,
  authDomain: "better-call-bob-app.firebaseapp.com",
  projectId: "better-call-bob-app",
  storageBucket: "better-call-bob-app.firebasestorage.app",
  messagingSenderId: `${import.meta.env.FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${import.meta.env.FIREBASE_APP_ID}`
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)