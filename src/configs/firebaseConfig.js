// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Import the functions you need from the SDKs you need
const firebaseConfig = {
  apiKey: "AIzaSyC_oMAK8eiIpoRwlozE-dB-fn7Ye-f5Fp0",
  authDomain: "customeragentticketsdb.firebaseapp.com",
  projectId: "customeragentticketsdb",
  storageBucket: "customeragentticketsdb.firebasestorage.app",
  messagingSenderId: "164080315963",
  appId: "1:164080315963:web:45e3fdf401232ca85ef61e"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ✅ Firebase Authentication Listener (Keeps track of logged-in users)
// const onAuthStateChange = (callback) => {
//     return onAuthStateChanged(auth, callback);
//   };
  
export { firebaseApp, db};
  