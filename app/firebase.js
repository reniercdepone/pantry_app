// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZY9RUafYP61x99ap_u77V7Nt3gMpVJmY",
  authDomain: "pantry-app-7d406.firebaseapp.com",
  projectId: "pantry-app-7d406",
  storageBucket: "pantry-app-7d406.appspot.com",
  messagingSenderId: "426060320649",
  appId: "1:426060320649:web:1366a9c2976b3caf34db58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)