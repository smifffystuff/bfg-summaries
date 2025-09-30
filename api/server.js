import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

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
    
    // Connect with optimized settings for serverless
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // Timeout for serverless
      socketTimeoutMS: 45000,
      maxPoolSize: 5, // Limit connection pool size for serverless
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

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
  cachedConnection = null;
});

// Import models and services
import Video from './models/Video.js';
import { vectorSearch } from './services/vectorSearch.js';

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BFG Showcase API is running' });
});

// Vector search status endpoint
app.get('/api/search/status', async (req, res) => {
  try {
    await connectDB();
    
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const videoWithEmbedding = await Video.findOne({ Embeddings: { $exists: true, $ne: null } });
    const hasEmbeddings = !!videoWithEmbedding;
    const totalVideos = await Video.countDocuments();
    const videosWithEmbeddings = await Video.countDocuments({ Embeddings: { $exists: true, $ne: null } });

    // Detailed diagnostics
    const diagnostics = {
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasEnvFile: existsSync(join(__dirname, '..', '.env')),
        openaiKeySet: hasOpenAI,
        openaiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
        mongoConnected: mongoose.connection.readyState === 1
      },
      database: {
        totalVideos,
        videosWithEmbeddings,
        embeddingCoverage: totalVideos > 0 ? (videosWithEmbeddings / totalVideos * 100).toFixed(1) + '%' : '0%',
        sampleVideoIds: await Video.find({}, { _id: 1 }).limit(3).then(videos => videos.map(v => v._id))
      }
    };
    
    res.json({
      success: true,
      vectorSearch: {
        available: hasOpenAI && hasEmbeddings,
        openaiConfigured: hasOpenAI,
        embeddingsExist: hasEmbeddings,
        totalVideos,
        videosWithEmbeddings,
        embeddingCoverage: totalVideos > 0 ? (videosWithEmbeddings / totalVideos * 100).toFixed(1) + '%' : '0%'
      },
      diagnostics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check vector search status',
      details: error.message
    });
  }
});

// Vector search endpoint
app.get('/api/search/vector', async (req, res) => {
  try {
    // Ensure MongoDB is connected
    await connectDB();

    const { q: query, limit = 10, numCandidates = 100 } = req.query;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    console.log('Vector search query:', query);
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return res.status(503).json({
        success: false,
        error: 'Vector search is not available - missing OpenAI API key',
        details: 'Please set OPENAI_API_KEY environment variable'
      });
    }

    // Check if any videos have embeddings
    const videoWithEmbedding = await Video.findOne({ Embeddings: { $exists: true, $ne: null } });
    if (!videoWithEmbedding) {
      console.log('No videos with embeddings found');
      return res.status(503).json({
        success: false,
        error: 'Vector search is not available - no embeddings found',
        details: 'Please ensure embeddings are created in your external system and populated in the database'
      });
    }
    
    const results = await vectorSearch(
      query.trim(),
      parseInt(limit),
      parseInt(numCandidates)
    );

    res.json({
      success: true,
      data: results,
      query: query.trim(),
      resultsCount: results.length
    });
  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({
      success: false,
      error: 'Vector search failed',
      details: error.message
    });
  }
});



// Get all videos with pagination (no text search, only initial load)
app.get('/api/videos', async (req, res) => {
  try {
    // Ensure MongoDB is connected
    await connectDB();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get videos sorted by published date (latest first)
    console.log('Loading initial videos...');
    const videos = await Video.find({})
      .sort({ PublishedUtc: -1 })
      .skip(skip)
      .limit(limit);

    console.log('Videos Found:', videos.length);
    const total = await Video.countDocuments({});

    // Transform data to match frontend expectations
    const transformedVideos = videos.map(video => ({
      id: video._id || video.id,
      title: video.Title || video.title,
      description: video.Summary || video.description,
      longDescription: video.LongSummary || video.longDescription,
      thumbnail: video.ThumbnailUrl || video.thumbnail,
      youtubeUrl: video.youtubeUrl || `https://www.youtube.com/watch?v=${video._id || video.id}`,
      embedUrl: video.embedUrl || `https://www.youtube.com/embed/${video._id || video.id}`,
      publishedAt: video.PublishedUtc || video.publishedAt,
      updatedAt: video.UpdatedUtc || video.updatedAt,
      ...(video.similarity && { similarity: video.similarity })
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

const PORT = process.env.PORT || 3002;

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