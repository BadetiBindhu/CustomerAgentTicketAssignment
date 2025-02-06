import { auth, db } from "./firebaseConfig";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ✅ User Login Function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("login in Authpage:",userCredential.user);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// ✅ User Signup Function (Registers Customer by Default)
export const signup = async (email, password, role = "customer") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Store user role in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      role, // Role can be 'customer' or 'agent'
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// ✅ Get User Role
export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().role : null;
  } catch (error) {
    throw error;
  }
};

// ✅ Logout Function
export const logout = async () => {
  await signOut(auth);
};
