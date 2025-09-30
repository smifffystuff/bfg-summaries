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
  }
}, {
  collection: 'video_summaries', // Specify the collection name
  _id: false // We're using custom _id
});

// Index for search functionality
videoSchema.index({ Title: 'text', Summary: 'text', LongSummary: 'text' });

export default mongoose.model('Video', videoSchema);