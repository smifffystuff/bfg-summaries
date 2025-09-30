import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the project root (parent directory) only in development
if (!process.env.VERCEL) {
  dotenv.config({ path: join(__dirname, '..', '.env') });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global MongoDB connection variable
let cachedConnection = null;

// MongoDB connection optimized for serverless
const connectDB = async () => {
  // If we have a cached connection that's ready, use it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    // Configure mongoose for serverless
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferMaxEntries', 0);
    
    // Connect with optimized settings for serverless
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Reduced timeout for serverless
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Limit connection pool size
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0
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

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
  cachedConnection = null;
});

// Import models
import Video from './models/Video.js';

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BFG Showcase API is running' });
});

// Get all videos with pagination and search
app.get('/api/videos', async (req, res) => {
  try {
    // Ensure MongoDB is connected
    await connectDB();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = {};
    
    // Add search functionality
    if (search) {
      query = {
        $or: [
          { Title: { $regex: search, $options: 'i' } },
          { Summary: { $regex: search, $options: 'i' } },
          { LongSummary: { $regex: search, $options: 'i' } }
        ]
      };
    }

    console.log('Search Query:', query);
    const videos = await Video.find(query)
      .sort({ PublishedUtc: -1 })
      .skip(skip)
      .limit(limit);

      console.log('Videos Found:', videos.length);
    const total = await Video.countDocuments(query);

    // Transform data to match frontend expectations
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

    res.json({
      success: true,
      data: transformedVideos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch videos',
      details: error.message
    });
  }
});

// Get single video by ID
app.get('/api/videos/:id', async (req, res) => {
  try {
    // Ensure MongoDB is connected
    await connectDB();

    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ 
        success: false, 
        error: 'Video not found' 
      });
    }

    // Transform data to match frontend expectations
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

    res.json({
      success: true,
      data: transformedVideo
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch video',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;

// Start server in development mode
if (!process.env.VERCEL) {
  // Connect to database in development
  connectDB().catch(console.error);
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
export default app;