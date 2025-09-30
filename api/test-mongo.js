// Simple MongoDB connection test
import mongoose from 'mongoose';

const testConnection = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    console.log('Testing MongoDB connection...');
    console.log('URI format check:', mongoUri.startsWith('mongodb+srv://') ? 'Valid' : 'Invalid');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('DNS resolution failed - check your MongoDB cluster hostname');
    }
    if (error.message.includes('Authentication failed')) {
      console.error('Authentication failed - check your username and password');
    }
    if (error.message.includes('Server selection timed out')) {
      console.error('Connection timeout - check network access and IP whitelist');
    }
  }
};

// Test endpoint for Vercel
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await testConnection();
      res.status(200).json({ success: true, message: 'MongoDB connection test completed - check logs' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}