import { db } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDoc 
} from "firebase/firestore";

/**
 * Fetch all tickets (Only Agents can view all tickets)
 */
export const getAllTickets = async () => {
  try {
    const ticketsCollection = collection(db, "tickets");
    const ticketSnapshot = await getDocs(ticketsCollection);
    return ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw new Error("Failed to retrieve tickets.");
  }
};

/**
 * Fetch tickets for a specific user (Customers see their own, Agents see assigned)
 */
export const getUserTickets = async (userId, role) => {
  try {
    const ticketsCollection = collection(db, "tickets");
    let q;

    if (role === "customer") {
      q = query(ticketsCollection, where("createdBy", "==", userId));
    } else if (role === "agent") {
      q = query(ticketsCollection, where("assignedTo", "==", userId));
    } else {
      throw new Error("Invalid role.");
    }

    const ticketSnapshot = await getDocs(q);
    return ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw new Error("Failed to fetch tickets.");
  }
};

/**
 * Create a new ticket (Only Customers can create)
 */
export const createTicket = async (ticketData) => {
  try {
    if (!ticketData.createdBy) {
      throw new Error("Unauthorized: Missing 'createdBy' field.");
    }

    const ticketsCollection = collection(db, "tickets");
    const newTicket = await addDoc(ticketsCollection, {
      ...ticketData,
      status: "Open",
      createdAt: new Date().toISOString()
    });

    return { id: newTicket.id, ...ticketData };
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw new Error("Failed to create ticket.");
  }
};

/**
 * Update a ticket (Only Agents can update)
 */
export const updateTicket = async (ticketId, updatedData, userRole) => {
  try {
    if (userRole !== "agent") {
      throw new Error("Unauthorized: Only agents can update tickets.");
    }

    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, updatedData);
    return { id: ticketId, ...updatedData };
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw new Error("Failed to update ticket.");
  }
};

/**
 * Delete a ticket (Only Customers can delete their own)
 */
export const deleteTicket = async (ticketId, userId, userRole) => {
  try {
    if (userRole !== "customer") {
      throw new Error("Unauthorized: Only customers can delete tickets.");
    }

    const ticketRef = doc(db, "tickets", ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (!ticketSnap.exists()) {
      throw new Error("Ticket not found.");
    }

    const ticketData = ticketSnap.data();
    if (ticketData.createdBy !== userId) {
      throw new Error("Unauthorized: You can only delete your own tickets.");
    }

    await deleteDoc(ticketRef);
    return true;
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw new Error("Failed to delete ticket.");
  }
};
