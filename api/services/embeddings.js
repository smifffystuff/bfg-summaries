import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for vector search functionality');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

/**
 * Generate embedding vector for given text using OpenAI's text-embedding-3-small model
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - Array of numbers representing the embedding vector
 */
export const generateEmbedding = async (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    // Clean and prepare text
    const cleanText = text.replace(/\n/g, ' ').trim();
    
    if (cleanText.length === 0) {
      throw new Error('Text cannot be empty after cleaning');
    }

    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: cleanText,
      encoding_format: 'float',
    });

    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      throw new Error('Invalid response from OpenAI API');
    }

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Generate search text from video data for embedding
 * @param {Object} video - Video object with Title, Summary, and LongSummary
 * @returns {string} - Combined text for embedding generation
 */
export const generateSearchText = (video) => {
  const parts = [];
  
  if (video.Title) parts.push(video.Title);
  if (video.Summary) parts.push(video.Summary);
  if (video.LongSummary) parts.push(video.LongSummary);
  
  return parts.join(' ').trim();
};