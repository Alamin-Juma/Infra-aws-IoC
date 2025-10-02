const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize Express
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const dynamoDb = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME || 'itrack-items-production';

// Define routes
app.get('/', (req, res) => {
  res.json({ message: 'iTrack API is running!' });
});

// Health check endpoint for ECS
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to the iTrack API!', 
    version: '1.0',
    endpoints: {
      items: '/api/items',
      health: '/health'
    }
  });
});

app.get('/api/items', async (req, res) => {
  try {
    console.log('Fetching items from table:', tableName);
    
    // Simply scan for all items without creating a test item
    const params = {
      TableName: tableName
    };
    
    console.log('Sending ScanCommand with params:', JSON.stringify(params));
    const result = await dynamoDb.send(new ScanCommand(params));
    console.log('Scan result count:', result.Count);
    
    res.json({
      items: result.Items || [],
      count: result.Count || 0,
      message: 'Items retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items', details: error.message });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const params = {
      TableName: tableName,
      Key: {
        id: req.params.id
      }
    };
    
    const result = await dynamoDb.send(new GetCommand(params));
    
    if (!result.Item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.Item);
  } catch (error) {
    console.error(`Error fetching item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch item', details: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  if (!req.body || !req.body.name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const timestamp = new Date().toISOString();
  const item = {
    id: `item-${Date.now()}`, // Generate a unique ID
    name: req.body.name,
    description: req.body.description || '',
    type: req.body.type || 'default',
    status: req.body.status || 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  try {
    const params = {
      TableName: tableName,
      Item: item
    };
    
    await dynamoDb.send(new PutCommand(params));
    
    res.json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item', details: error.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Empty request body' });
  }
  
  try {
    // First check if item exists
    const getParams = {
      TableName: tableName,
      Key: {
        id: req.params.id
      }
    };
    
    const existingItem = await dynamoDb.send(new GetCommand(getParams));
    
    if (!existingItem.Item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Update the item
    const timestamp = new Date().toISOString();
    const item = {
      ...existingItem.Item,
      ...req.body,
      updatedAt: timestamp
    };
    
    const putParams = {
      TableName: tableName,
      Item: item
    };
    
    await dynamoDb.send(new PutCommand(putParams));
    
    res.json(item);
  } catch (error) {
    console.error(`Error updating item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update item', details: error.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const params = {
      TableName: tableName,
      Key: {
        id: req.params.id
      }
    };
    
    await dynamoDb.send(new DeleteCommand(params));
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete item', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});