import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD99-Mk_GB1BQ7Z1i8QASD0Xxhj7nJO9dw",
  authDomain: "blockchain-traceability-9454d.firebaseapp.com",
  projectId: "blockchain-traceability-9454d",
  storageBucket: "blockchain-traceability-9454d.firebasestorage.app",
  messagingSenderId: "308776254213",
  appId: "1:308776254213:web:34a137923180c58fe8556c",
  measurementId: "G-VYRQX68XV2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
