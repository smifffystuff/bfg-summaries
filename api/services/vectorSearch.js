import Video from '../models/Video.js';
import { generateEmbedding } from './embeddings.js';

/**
 * Perform vector search using MongoDB Atlas Vector Search
 * @param {string} searchQuery - The search query text
 * @param {number} limit - Number of results to return (default: 10)
 * @param {number} numCandidates - Number of candidate documents for vector search (default: 100)
 * @returns {Promise<Array>} - Array of matching videos with similarity scores
 */
export const vectorSearch = async (searchQuery, limit = 10, numCandidates = 100) => {
  try {
    if (!searchQuery || typeof searchQuery !== 'string') {
      throw new Error('Search query must be a non-empty string');
    }

    // Generate embedding for the search query
    console.log('Generating embedding for search query:', searchQuery);
    const queryEmbedding = await generateEmbedding(searchQuery);

    console.log('Performing vector search with embedding of length:', queryEmbedding.length);

    // Perform vector search using MongoDB aggregation pipeline
    const results = await Video.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index', // Your vector search index name
          path: 'Embeddings',
          queryVector: queryEmbedding,
          numCandidates: numCandidates,
          limit: limit
        }
      },
      {
        $addFields: {
          score: { $meta: 'vectorSearchScore' }
        }
      },
      {
        $project: {
          _id: 1,
          Title: 1,
          Summary: 1,
          LongSummary: 1,
          ThumbnailUrl: 1,
          PublishedUtc: 1,
          UpdatedUtc: 1,
          score: 1
        }
      }
    ]);

    console.log(`Vector search returned ${results.length} results`);

    // Transform results to match frontend expectations
    const transformedResults = results.map(video => ({
      id: video._id,
      title: video.Title,
      description: video.Summary,
      longDescription: video.LongSummary,
      thumbnail: video.ThumbnailUrl,
      youtubeUrl: `https://www.youtube.com/watch?v=${video._id}`,
      embedUrl: `https://www.youtube.com/embed/${video._id}`,
      publishedAt: video.PublishedUtc,
      updatedAt: video.UpdatedUtc,
      similarity: video.score
    }));

    return transformedResults;
  } catch (error) {
    console.error('Error performing vector search:', error);
    throw new Error(`Vector search failed: ${error.message}`);
  }
};