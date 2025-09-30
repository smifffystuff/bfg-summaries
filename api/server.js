import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the project root (parent directory)
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not found in environment variables. Please update your .env file.');
      console.warn('   Video endpoints will return errors until MongoDB is connected.');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('   Server will continue running, but video endpoints will not work.');
  }
};

// Connect to database
connectDB();

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error(`MongoDB connection error when trying to connect to ${process.env.MONGODB_URI}:`, error);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
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
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected. Please check MongoDB connection string in .env file.',
        hint: 'Update MONGODB_URI in your .env file with your MongoDB Atlas connection string.'
      });
    }

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
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected. Please check MongoDB connection string in .env file.',
        hint: 'Update MONGODB_URI in your .env file with your MongoDB Atlas connection string.'
      });
    }

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
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
export default app;