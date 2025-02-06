import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// Fetch all users from Firestore
export const getAllUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return userList;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
