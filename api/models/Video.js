import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  Title: {
    type: String,
    required: true
  },
  Summary: {
    type: String,
    required: true
  },
  LongSummary: {
    type: String,
    required: true
  },
  ThumbnailUrl: {
    type: String,
    required: true
  },
  PublishedUtc: {
    type: Date,
    required: true
  },
  UpdatedUtc: {
    type: Date,
    required: true
  },
  Embeddings: {
    type: [Number], // Array of numbers for the embedding vector
    select: false // Don't include in queries by default
  }
}, {
  collection: 'video_summaries', // Specify the collection name
  _id: false // We're using custom _id
});

export default mongoose.model('Video', videoSchema);