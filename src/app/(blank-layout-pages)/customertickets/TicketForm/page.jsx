"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@configs/firebaseConfig";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Paper,
} from "@mui/material";

const TicketForm = ({ onClose, setIsFormOpen, onTicketAdded, uid }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  // Manage ticket state
  const [ticket, setTicket] = useState({
    title: '',
    description: '',
    priority: 'low',
    status: '',
    createdBy: uid,
    assignedTo: '',
    phoneNumber: '', // New field for phone number
    createdAt: Timestamp.now(),
  });

  // Set initial value for ID on mount
  useEffect(() => {
    setValue("id", uuidv4());
  }, [setValue]);

  // Handle form submission
  const submitForm = async (data) => {
    try {
      // Create a new ticket object with the provided form data
      const newTicket = {
        ...ticket, 
        title: data.title,
        description: data.description,
        priority: data.priority,
        phoneNumber: data.phoneNumber, // Include phone number in the new ticket
        createdAt: Timestamp.now(),
      };

      // Add new ticket to Firestore
      const newTicketRef = await addDoc(collection(db, "tickets"), newTicket);
      console.log("New ticket added with ID:", newTicketRef.id);

      // Call the callback function to update the tickets in the parent component
      onTicketAdded({ ...newTicket, id: newTicketRef.id });
      alert("New Ticket Created Successfully");
      
      // Close the form
      setIsFormOpen(false);
      onClose();  // Close the form and return to the tickets list
    } catch (error) {
      console.error("Error adding new ticket: ", error);
    }
  };

  // Handle input change in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicket({
      ...ticket,
      [name]: value,
    });
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <Paper elevation={4} sx={{ padding: 3 }}>
        <DialogTitle>Add New Ticket</DialogTitle>
        <form onSubmit={handleSubmit(submitForm)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Ticket ID (Read-only) */}
            <TextField
              label="Ticket ID"
              defaultValue=""
              fullWidth
              {...register("id")}
              disabled
            />

            {/* Title */}
            <TextField
              label="Title"
              fullWidth
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title?.message}
              onChange={handleInputChange} // Sync input with state
            />

            {/* Description */}
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              {...register("description", { required: "Description is required" })}
              error={!!errors.description}
              helperText={errors.description?.message}
              onChange={handleInputChange} // Sync input with state
            />

            {/* Priority */}
            <TextField
              select
              label="Priority"
              fullWidth
              {...register("priority", { required: "Select a priority" })}
              error={!!errors.priority}
              helperText={errors.priority?.message}
              onChange={handleInputChange} // Sync input with state
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>

            {/* Phone Number */}
            <TextField
              label="Phone Number"
              fullWidth
              {...register("phoneNumber", { required: "Phone number is required" })}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
              onChange={handleInputChange} // Sync input with state
            />

            {/* Status (optional, can uncomment and use if needed) */}
            {/* <TextField
              select
              label="Status"
              fullWidth
              {...register("status", { required: "Select a status" })}
              error={!!errors.status}
              helperText={errors.status?.message}
              onChange={handleInputChange} // Sync input with state
            >
              <MenuItem value="opened">Opened</MenuItem>
              <MenuItem value="inprogress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </TextField> */}
          </DialogContent>

          {/* Buttons */}
          <DialogActions>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </Paper>
    </Dialog>
  );
};

export default TicketForm;
