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

export interface VideoResponse {
  success: boolean;
  data: Video;
}

// Get all videos with optional search and pagination
export const getVideos = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<VideosResponse> => {
  const response = await api.get('/videos', { params });
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