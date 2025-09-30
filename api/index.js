import mongoose from 'mongoose';
import Video from './models/Video.js';

// Global MongoDB connection variable
let cachedConnection = null;

// MongoDB connection optimized for serverless
const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    mongoose.set('bufferCommands', false);
    
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      bufferCommands: false
    });
    
    console.log('✅ Connected to MongoDB');
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    cachedConnection = null;
    throw error;
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to database
    await connectDB();

    const { url } = req;
    
    // Health check endpoint
    if (url === '/api/health') {
      return res.json({ status: 'OK', message: 'BFG Showcase API is running' });
    }
    
    // Get all videos
    if (url === '/api/videos' && req.method === 'GET') {
      const { page = 1, limit = 12, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let query = {};
      
      if (search) {
        query = {
          $or: [
            { Title: { $regex: search, $options: 'i' } },
            { Summary: { $regex: search, $options: 'i' } },
            { LongSummary: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const videos = await Video.find(query)
        .sort({ PublishedUtc: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Video.countDocuments(query);

      const transformedVideos = videos.map(video => ({
        id: video._id,
        title: video.Title,
        description: video.Summary,
        longDescription: video.LongSummary,
        thumbnail: video.ThumbnailUrl,
        youtubeUrl: `https://www.youtube.com/watch?v=${video._id}`,
        embedUrl: `https://www.youtube.com/embed/${video._id}`,
        publishedAt: video.PublishedUtc,
        updatedAt: video.UpdatedUtc
      }));

      return res.json({
        success: true,
        data: transformedVideos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }
    
    // Get single video by ID
    if (url && url.startsWith('/api/videos/') && req.method === 'GET') {
      const id = url.split('/api/videos/')[1];
      
      const video = await Video.findById(id);
      
      if (!video) {
        return res.status(404).json({ 
          success: false, 
          error: 'Video not found' 
        });
      }

      const transformedVideo = {
        id: video._id,
        title: video.Title,
        description: video.Summary,
        longDescription: video.LongSummary,
        thumbnail: video.ThumbnailUrl,
        youtubeUrl: `https://www.youtube.com/watch?v=${video._id}`,
        embedUrl: `https://www.youtube.com/embed/${video._id}`,
        publishedAt: video.PublishedUtc,
        updatedAt: video.UpdatedUtc
      };

      return res.json({
        success: true,
        data: transformedVideo
      });
    }
    
    // Route not found
    return res.status(404).json({ 
      success: false, 
      error: 'Endpoint not found' 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
}