import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Sparkles } from 'lucide-react';
import { getVideos, type Video } from '../services/api';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isVectorSearch, setIsVectorSearch] = useState<boolean>(false);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getVideos({
        page: 1,
        limit: 12
      });

      if (response.success) {
        setVideos(response.data);
      } else {
        setError('Failed to load videos');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Unable to connect to the server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search results from SearchBar
  const handleSearchResults = useCallback((results: Video[], term?: string) => {
    if (results.length === 0 && (!term || term.trim() === '')) {
      // If no results and no search term, reload initial videos
      fetchVideos();
    } else {
      setVideos(results);
      setSearchTerm(term || '');
      setIsVectorSearch(true); // Always AI search since we removed text search
      setError(null);
    }
  }, [fetchVideos]);

  // Handle loading state from SearchBar
  const handleSearchLoading = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          <span className="text-primary-500">Bald Foodie Guy</span> Video Summaries
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Your go-to resource for honest supermarket food reviews. I test products from local 
          supermarkets so you know what's worth buying and what to avoid, saving you time and money.
        </p>
        <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          Subscribe for Latest Videos
        </button>
      </section>

      {/* Search Section */}
      <SearchBar 
        onResults={handleSearchResults}
        onLoading={handleSearchLoading}
      />

      {/* Videos Section */}
      <section>
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">
          {searchTerm 
            ? `Search Results ${isVectorSearch ? '(AI Search)' : '(Text Search)'}`
            : 'Latest Videos'
          }
          {searchTerm && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              for "{searchTerm}"
            </span>
          )}
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 mb-2">⚠️ {error}</p>
              <button 
                onClick={fetchVideos}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No videos found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                to={`/video/${video.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                    </div>
                    {video.similarity && (
                      <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                        <Sparkles className="h-3 w-3" />
                        <span>{Math.round(video.similarity * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;