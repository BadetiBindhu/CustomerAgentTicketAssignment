import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, Paper } from "@mui/material";

const ViewTicket = ({ ticketData, setIsViewFormOpen }) => {
  // Initialize the ticket data from the props
  const [ticket, setTicket] = useState(ticketData);

  // Set initial value for ticket when ticketData changes
  useEffect(() => {
    setTicket(ticketData); // Update the ticket state with the props data
  }, [ticketData]);

  // Handle the Cancel button click to close the form
  const handleCancel = () => {
    setIsViewFormOpen(false);  // Close the form
  };

  return (
    <Dialog open={true} fullWidth maxWidth="sm">
      <Paper elevation={4} sx={{ padding: 3 }}>
        <DialogTitle>View Ticket</DialogTitle>
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
            disabled  // Disable the field so it is view-only
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={ticket.description}
            disabled  // Disable the field so it is view-only
          />

          {/* Priority */}
          <TextField
            select
            label="Priority"
            fullWidth
            value={ticket.priority}
            disabled  // Disable the field so it is view-only
          >
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
        </DialogContent>

        {/* Buttons */}
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
};

export default ViewTicket;
