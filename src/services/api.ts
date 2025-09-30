import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface Video {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  youtubeUrl: string;
  embedUrl: string;
  publishedAt: string;
  updatedAt: string;
  similarity?: number; // For vector search results
}

export interface VideosResponse {
  success: boolean;
  data: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VectorSearchResponse {
  success: boolean;
  data: Video[];
  query: string;
  resultsCount: number;
}

export interface VideoResponse {
  success: boolean;
  data: Video;
}

// Get all videos with pagination (initial load only)
export const getVideos = async (params?: {
  page?: number;
  limit?: number;
}): Promise<VideosResponse> => {
  const response = await api.get('/videos', { params });
  return response.data;
};

// Vector search for videos
export const vectorSearchVideos = async (query: string, limit = 10): Promise<VectorSearchResponse> => {
  const response = await api.get('/search/vector', { 
    params: { q: query, limit } 
  });
  return response.data;
};

// Get single video by ID
export const getVideoById = async (id: string): Promise<VideoResponse> => {
  const response = await api.get(`/videos/${id}`);
  return response.data;
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Check vector search status
export const getVectorSearchStatus = async () => {
  const response = await api.get('/search/status');
  return response.data;
};