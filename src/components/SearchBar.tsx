import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, AlertCircle } from 'lucide-react';
import { vectorSearchVideos, getVectorSearchStatus, type Video } from '../services/api';

interface SearchBarProps {
  onResults: (videos: Video[], searchTerm?: string, isVector?: boolean) => void;
  onLoading: (loading: boolean) => void;
  initialSearch?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResults, onLoading, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isSearching, setIsSearching] = useState(false);
  const [vectorSearchAvailable, setVectorSearchAvailable] = useState(true);
  const [vectorSearchError, setVectorSearchError] = useState<string | null>(null);

  // Manual AI search function
  const performAISearch = useCallback(async () => {
    const term = searchTerm.trim();
    
    if (term.length === 0) {
      return;
    }

    if (!vectorSearchAvailable) {
      console.error('Vector search is not available');
      return;
    }

    try {
      setIsSearching(true);
      onLoading(true);
      
      console.log('Performing AI vector search for:', term);
      const vectorResponse = await vectorSearchVideos(term, 20);
      onResults(vectorResponse.data, term, true);
    } catch (error: any) {
      console.error('AI search error:', error);
      onResults([], term, true);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  }, [searchTerm, vectorSearchAvailable, onResults, onLoading]);

  // Check vector search availability on mount
  useEffect(() => {
    const checkVectorSearchStatus = async () => {
      try {
        const status = await getVectorSearchStatus();
        setVectorSearchAvailable(status.vectorSearch.available);
        if (!status.vectorSearch.available) {
          if (!status.vectorSearch.openaiConfigured) {
            setVectorSearchError('OpenAI API key not configured');
          } else if (!status.vectorSearch.embeddingsExist) {
            setVectorSearchError('No embeddings found in database');
          }
        }
      } catch (error) {
        console.warn('Failed to check vector search status:', error);
        setVectorSearchAvailable(false);
        setVectorSearchError('Unable to check vector search status');
      }
    };
    
    checkVectorSearchStatus();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performAISearch();
    }
  };

  const handleSearchClick = () => {
    performAISearch();
  };

  const clearSearch = () => {
    setSearchTerm('');
    // Notify parent to reset to initial videos
    onResults([], '', false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about the videos... (e.g., 'cooking techniques', 'healthy recipes')"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              disabled={!vectorSearchAvailable}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={handleSearchClick}
            disabled={!vectorSearchAvailable || isSearching || searchTerm.trim().length === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              vectorSearchAvailable && searchTerm.trim().length > 0 && !isSearching
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSearching ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI Search</span>
              </>
            )}
          </button>
        </div>

        {/* AI Search Status */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              vectorSearchAvailable 
                ? 'bg-purple-100 text-purple-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span>AI Search Only</span>
              {!vectorSearchAvailable && <AlertCircle className="w-4 h-4" />}
            </div>
            
            {!vectorSearchAvailable && vectorSearchError && (
              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                {vectorSearchError}
              </div>
            )}
          </div>
        </div>

        {/* Search Info */}
        <div className="mt-2 text-xs text-gray-500">
          {vectorSearchAvailable ? (
            <p className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI-powered semantic search finds videos by meaning and context. Press Enter or click Search.</span>
            </p>
          ) : (
            <p className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>AI search unavailable. Please ensure embeddings exist in database.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};



export default SearchBar;