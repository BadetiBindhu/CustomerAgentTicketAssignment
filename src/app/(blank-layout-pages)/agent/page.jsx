"use client";

import { useState, useEffect } from "react";
import { db } from "@configs/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Paper, TextField, MenuItem } from "@mui/material";
import { format } from "date-fns";
import {useRouter} from "next/navigation"; // Make sure Router is imported if using Next.js routing

const AgentTickets = () => {
  const [tickets, setTickets] = useState([]);
   const router=useRouter();
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tickets"));
      const ticketsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "N/A"; // Handle missing timestamp
    return format(new Date(timestamp.seconds * 1000), "yyyy-MM-dd HH:mm:ss"); // Convert to readable format
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Handle field editing and update in Firestore
  const handleEdit = async (ticketId, field, value) => {
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
    );
    setTickets(updatedTickets);  // Optimistic UI update

    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, { [field]: value });
      console.log(`${field} updated for ticket ${ticketId}`);
    } catch (error) {
      console.error("Error updating field:", error);
      alert("Error updating field. Please try again.");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "red"; 
      case "Medium": return "orange"; 
      case "Low": return "green"; 
      default: return "black"; 
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Opened": return "blue"; 
      case "Assigned": return "purple"; 
      case "InProgress": return "yellow"; 
      case "OnHold": return "gray"; 
      case "Resolved": return "green"; 
      case "Closed": return "black"; 
      default: return "black"; 
    }
  };

  return (
    <div>
      <Button variant="contained" color="error" onClick={handleLogout}>
        Logout
      </Button>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">ID</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">Title</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">Description</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">Priority</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">Status</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">CreatedBy</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">AssignedTo</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">CreatedAt</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">Contact</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell align="left">{ticket.id}</TableCell>

                {/* Static Title */}
                <TableCell align="left">{ticket.title}</TableCell>

                {/* Static Description */}
                <TableCell align="left">{ticket.description}</TableCell>

                {/* Editable Priority with Color */}
                <TableCell align="left" sx={{ color: getPriorityColor(ticket.priority) }}>
                  <TextField
                    value={ticket.priority}
                    onChange={(e) => handleEdit(ticket.id, "priority", e.target.value)}
                    fullWidth
                    variant="outlined"
                    select
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </TextField>
                </TableCell>

                {/* Editable Status with Color */}
                <TableCell align="left" sx={{ color: getStatusColor(ticket.status) }}>
                  <TextField
                    value={ticket.status}
                    onChange={(e) => handleEdit(ticket.id, "status", e.target.value)}
                    fullWidth
                    variant="outlined"
                    select  // Dropdown for status selection
                  >
                    <MenuItem value="Opened">Opened</MenuItem>
                    <MenuItem value="Assigned">Assigned</MenuItem>
                    <MenuItem value="InProgress">In Progress</MenuItem>
                    <MenuItem value="OnHold">On Hold</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </TextField>
                </TableCell>

                {/* Static CreatedBy */}
                <TableCell align="left">{ticket.createdBy}</TableCell>

                {/* Editable AssignedTo */}
                <TableCell align="left">
                  <TextField
                    value={ticket.assignedTo}
                    onChange={(e) => handleEdit(ticket.id, "assignedTo", e.target.value)}
                    fullWidth
                    variant="outlined"
                  />
                </TableCell>

                {/* Timestamp (CreatedAt) */}
                <TableCell align="left">{formatTimestamp(ticket.createdAt)}</TableCell>
                <TableCell align="left">{ticket.phoneNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AgentTickets;
