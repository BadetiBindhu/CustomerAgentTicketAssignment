'use client'

import { useState, useEffect } from 'react'
import { db } from '@configs/firebaseConfig'
import { collection, getDocs, query, where, deleteDoc, doc,getDoc, addDoc } from 'firebase/firestore'
import { TableContainer,Table, TableHead, TableRow, TableCell, TableBody, Button ,Paper } from '@mui/material'
import { useSearchParams, useRouter } from 'next/navigation'
import { format } from 'date-fns' // Install with: npm install date-fns
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { IconButton ,Box} from '@mui/material'
import TicketForm from './TicketForm/page'
import EditTicket from './EditTicket/page'
import ViewTicket from './ViewTicket/page'

const CustomerTickets = () => {
  const router = useRouter()
  const [tickets, setTickets] = useState([])
  const [selectedETicket,setSelectedETicket]=useState();
  const [selectedTicket,setSelectedTicket]=useState();
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isViewFormOpen, setIsViewFormOpen] = useState(false)

  const searchParams = useSearchParams()
  const uid = searchParams.get('uid') // Get uid from URL

  useEffect(() => {
    if (uid) {
      fetchTickets(uid)
    }
  }, [uid])

  // Fetch tickets for the current user (uid)
  const fetchTickets = async userId => {
    try {
      const q = query(collection(db, 'tickets'), where('createdBy', '==', userId))
      const querySnapshot = await getDocs(q)
      const ticketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      console.log('ticketsData:', ticketsData)
      setTickets(ticketsData)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  } 

  // Format Firestore timestamp to a readable format
  const formatTimestamp = timestamp => {
    if (!timestamp || !timestamp.seconds) return 'N/A'
    return format(new Date(timestamp.seconds * 1000), 'yyyy-MM-dd HH:mm:ss')
  }

  const handleDelete = async (id) => {
    try {
      console.log('Attempting to delete ticket with ID:', id);
  
      // Delete the ticket from Firestore
      const ticketRef = doc(db, 'tickets', id);
      await deleteDoc(ticketRef);
      console.log('Ticket deleted successfully.');
  
      // Remove the deleted ticket from local state (optimistic UI update)
      setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== id));
  
      alert('Ticket Deleted Successfully');
    } catch (error) {
      console.error('Error deleting ticket: ', error);
      alert('Failed to delete the ticket. Please try again.');
    }
  };

  // Handle add new ticket (open form)
  const handleAddTicket = () => {
    setIsFormOpen(true)
  }


// Handle when a ticket is updated
const handleTicketUpdated = (updatedTicket) => {
  setTickets((prevTickets) =>
    prevTickets.map((ticket) =>
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    )
  );
};

// Handle opening the EditTicket component
const handleEditTicket = (ticketData) => {
  setSelectedETicket(ticketData);
  setIsEditFormOpen(true);
};

const handleViewTicket=(ticketData)=>{
  setSelectedTicket(ticketData);
  setIsViewFormOpen(true);
}
  // Handle logout
  const handleLogout = () => {
    router.push('/login')
  }

  // Handle newly created ticket from TicketForm
  const handleAddNewTicket = newTicket => {
    setTickets(prevTickets => [...prevTickets, newTicket])
  }

 
  return (
    <div>
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <Button variant="contained" color="success" onClick={handleAddTicket}>
        Add Ticket
      </Button>
      <Button variant="contained" color="error" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
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
            <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} align="left">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickets.map(ticket => (
            <TableRow key={ticket.id}>
              <TableCell align="left">{ticket.id}</TableCell>
              <TableCell align="left">{ticket.title}</TableCell>
              <TableCell align="left">{ticket.description}</TableCell>
              <TableCell align="left">{ticket.priority}</TableCell>
              <TableCell align="left">{ticket.status}</TableCell>
              <TableCell align="left">{ticket.createdBy}</TableCell>
              <TableCell align="left">{ticket.assignedTo}</TableCell>
              <TableCell align="left">{formatTimestamp(ticket.createdAt)}</TableCell>
              <TableCell>
              <Box display="flex" gap={1}>
                {/* Delete Icon in Red */}
                <IconButton sx={{ color: 'red' }}>
                  <DeleteIcon onClick={()=>handleDelete(ticket.id)} />
                </IconButton>

                {/* Edit Icon in Blue */}
                <IconButton sx={{ color: 'blue' }}>
                  <EditIcon onClick={()=>handleEditTicket(ticket)}/>
                </IconButton>

                {/* View Icon */}
                <IconButton sx={{ color: 'green' }}>
                  <VisibilityIcon onClick={()=>handleViewTicket(ticket)}/>
                </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isFormOpen && (
        <TicketForm
          onClose={() => setIsFormOpen(false)}
          uid={uid}
          setIsFormOpen={setIsFormOpen}
          onTicketAdded={handleAddNewTicket}
        />
      )}
      {isEditFormOpen && <EditTicket setIsEditFormOpen={setIsEditFormOpen} ticketData={selectedETicket}  onTicketUpdated={handleTicketUpdated}/>}
      {isViewFormOpen && <ViewTicket setIsViewFormOpen={setIsViewFormOpen} ticketData={selectedTicket}/>} 
      </TableContainer>
    </div>
  )
}

export default CustomerTickets
