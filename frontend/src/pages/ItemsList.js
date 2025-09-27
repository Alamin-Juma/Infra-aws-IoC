import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { 
  Typography, 
  Button, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Snackbar,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ItemsList = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState({ name: '', description: '', type: '', status: 'active' });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    fetchItems();
  }, []);
  
  const fetchItems = async () => {
    try {
      setLoading(true);
      // In a real app, fetch items from API
      // const response = await API.get('api', '/api/items');
      
      // Using mock data for now
      const mockItems = [
        { id: '1', name: 'Item 1', description: 'Description for item 1', type: 'type-a', status: 'active', createdAt: '2023-09-10T10:30:00Z' },
        { id: '2', name: 'Item 2', description: 'Description for item 2', type: 'type-b', status: 'inactive', createdAt: '2023-09-09T14:15:00Z' },
        { id: '3', name: 'Item 3', description: 'Description for item 3', type: 'type-a', status: 'active', createdAt: '2023-09-08T09:45:00Z' },
      ];
      
      setItems(mockItems);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message || 'Failed to load items');
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setIsEditing(true);
    } else {
      setCurrentItem({ name: '', description: '', type: '', status: 'active' });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveItem = async () => {
    try {
      if (isEditing) {
        // In a real app, update item via API
        // await API.put('api', `/api/items/${currentItem.id}`, { body: currentItem });
        
        // Update item in state
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === currentItem.id ? { ...item, ...currentItem } : item
          )
        );
        
        setSnackbar({ open: true, message: 'Item updated successfully', severity: 'success' });
      } else {
        // In a real app, create item via API
        // const newItem = await API.post('api', '/api/items', { body: currentItem });
        
        // Create mock item with ID
        const newItem = {
          ...currentItem,
          id: `item-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        // Add new item to state
        setItems(prevItems => [...prevItems, newItem]);
        
        setSnackbar({ open: true, message: 'Item created successfully', severity: 'success' });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving item:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to save item', severity: 'error' });
    }
  };
  
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // In a real app, delete item via API
        // await API.del('api', `/api/items/${id}`);
        
        // Remove item from state
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        
        setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
      } catch (err) {
        console.error('Error deleting item:', err);
        setSnackbar({ open: true, message: err.message || 'Failed to delete item', severity: 'error' });
      }
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Items List
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Item
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.status} 
                    color={item.status === 'active' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton 
                      component={Link} 
                      to={`/items/${item.id}`}
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenDialog(item)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteItem(item.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No items found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentItem.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={currentItem.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="type"
            label="Type"
            type="text"
            fullWidth
            variant="outlined"
            value={currentItem.type}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="status"
            label="Status"
            select
            fullWidth
            variant="outlined"
            value={currentItem.status}
            onChange={handleInputChange}
            SelectProps={{
              native: true,
            }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ItemsList;