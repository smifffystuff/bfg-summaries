import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { getVideoById, type Video } from '../services/api';

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await getVideoById(id);
        
        if (response.success) {
          setVideo(response.data);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Unable to load video. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 aspect-video rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 mb-4">⚠️ {error}</p>
            <Link
              to="/"
              className="inline-flex items-center bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Videos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Video not found.</p>
          <Link
            to="/"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Videos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <div className="aspect-video relative">
              <iframe
                src={video.embedUrl}
                title={video.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>

          {/* Video Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {video.title}
            </h1>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(video.publishedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
              <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Summary</h3>
              <div className="text-gray-700 leading-relaxed">
                {video.description}
              </div>
            </div>

            {/* Full Description */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Full Review</h3>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {video.longDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-display font-semibold text-xl mb-4">More Videos</h3>
            <div className="text-center text-gray-500">
              <p>Related videos will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;