// firebase.js
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCur7_zE5Y7Lh6EKg94YQ7is7Ju9iQdlws",
  authDomain: "chat-app-gs-262d9.firebaseapp.com",
  projectId: "chat-app-gs-262d9",
  storageBucket: "chat-app-gs-262d9.appspot.com",
  messagingSenderId: "504285833123",
  appId: "1:504285833123:web:afa3ae70afb5c55d93dc16",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Set user document
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hello dear",
      lastSeen: Date.now(),
    });

    // Initialize an empty chat for the user
    await setDoc(doc(db, "chats", user.uid), {
      chatData: [],
    });

    toast.success("Account created successfully!");
  } catch (error) {
    console.error("Signup error:", error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

export { signup, login, logout, auth, db, storage };
