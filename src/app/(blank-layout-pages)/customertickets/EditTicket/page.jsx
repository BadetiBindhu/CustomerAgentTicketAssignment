"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
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

const EditTicket = ({ ticketData,setIsEditFormOpen, onTicketUpdated }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  // Manage ticket state (initially set to the ticketData passed in)
  const [ticket, setTicket] = useState(ticketData);

  // Set initial value for ID on mount
  useEffect(() => {
    setValue("id", ticketData.id); // Set the initial ticket ID
    setTicket(ticketData); // Update the local ticket state with the props data
  }, [ticketData, setValue]);

  // Handle form submission
  const submitForm = async (data) => {
    try {
      // Create an updated ticket object with the form data
      const updatedTicket = {
        ...ticket,
        title: data.title,
        description: data.description,
        priority: data.priority,
        updatedAt: Timestamp.now(),
      };

      // Update the ticket in Firestore
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, updatedTicket);
      console.log("Ticket updated with ID:", ticket.id);

      // Call the callback function to update the ticket in the parent component
      onTicketUpdated(updatedTicket);
      alert("Ticket Updated Successfully");
      // Close the form
      setIsEditFormOpen(false);
    } catch (error) {
      console.error("Error updating ticket: ", error);
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

  const handleCancel=()=>{
    setIsEditFormOpen(false);
  };
  return (
    <Dialog open={true} fullWidth maxWidth="sm">
      <Paper elevation={4} sx={{ padding: 3 }}>
        <DialogTitle>Edit Ticket</DialogTitle>
        <form onSubmit={handleSubmit(submitForm)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Ticket ID (Read-only) */}
            <TextField
              label="Ticket ID"
              value={ticket.id}  // Display the ticket ID
              fullWidth
              disabled
            />

            {/* Title */}
            <TextField
              label="Title"
              fullWidth
              value={ticket.title}
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
              value={ticket.description}
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
              value={ticket.priority}
              {...register("priority", { required: "Select a priority" })}
              error={!!errors.priority}
              helperText={errors.priority?.message}
              onChange={handleInputChange} // Sync input with state
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
          </DialogContent>

          {/* Buttons */}
          <DialogActions>
            <Button onClick={handleCancel} color="secondary">
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

export default EditTicket;