import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from 'aws-amplify';
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchItem();
  }, [id]);
  
  const fetchItem = async () => {
    try {
      setLoading(true);
      // In a real app, fetch item from API
      // const response = await API.get('api', `/api/items/${id}`);
      
      // Using mock data for now
      const mockItem = {
        id,
        name: `Item ${id}`,
        description: `This is a detailed description for item ${id}. It contains all the important information about this specific item that users might need to know.`,
        type: 'type-a',
        status: 'active',
        createdAt: '2023-09-10T10:30:00Z',
        updatedAt: '2023-09-11T15:45:00Z',
        metadata: {
          origin: 'System',
          category: 'Important',
          tags: ['tag1', 'tag2', 'tag3']
        }
      };
      
      // Simulate API delay
      setTimeout(() => {
        setItem(mockItem);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching item:', err);
      setError(err.message || `Failed to load item ${id}`);
      setLoading(false);
    }
  };
  
  const handleEdit = () => {
    // In a real app, navigate to edit page or open edit dialog
    alert('Edit functionality would be implemented here');
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true);
        // In a real app, delete item via API
        // await API.del('api', `/api/items/${id}`);
        
        // Navigate back to items list
        navigate('/items');
      } catch (err) {
        console.error('Error deleting item:', err);
        setError(err.message || 'Failed to delete item');
        setLoading(false);
      }
    }
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
  
  if (!item) {
    return <Alert severity="warning">Item not found</Alert>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/items')}
        >
          Back to List
        </Button>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {item.name}
        </Typography>
        
        <Chip 
          label={item.status} 
          color={item.status === 'active' ? 'success' : 'warning'} 
          sx={{ mb: 2 }} 
        />
        
        <Typography variant="body1" paragraph>
          {item.description}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1" gutterBottom>
              {item.id}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1" gutterBottom>
              {item.type}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1" gutterBottom>
              {item.metadata?.category || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(item.createdAt).toLocaleString()}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Updated At
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(item.updatedAt).toLocaleString()}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Origin
            </Typography>
            <Typography variant="body1" gutterBottom>
              {item.metadata?.origin || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
        
        {item.metadata?.tags && item.metadata.tags.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Tags
            </Typography>
            <Box sx={{ mt: 1 }}>
              {item.metadata.tags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </>
        )}
      </Paper>
    </>
  );
};

export default ItemDetails;