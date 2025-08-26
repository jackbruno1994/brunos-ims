import React, { useState, useEffect, useRef } from 'react';
import { searchService } from '../services/orderProcessingService';

interface SearchResult {
  id: string;
  type: 'recipe' | 'ingredient' | 'menu_item' | 'prep_task' | 'order';
  title: string;
  description: string;
  relevanceScore: number;
  category?: string;
  tags: string[];
  metadata: any;
}

interface SmartSearchProps {
  restaurantId: string;
  userId: string;
  context?: string;
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  restaurantId,
  userId,
  context = 'general',
  placeholder = 'Search recipes, ingredients, menu items...',
  onResultSelect
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Handle clicks outside search component
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Get suggestions for partial queries
    if (query.length > 1) {
      loadSuggestions(query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, userId]);

  const loadSuggestions = async (partialQuery: string) => {
    try {
      const suggestions = await searchService.getSearchSuggestions(userId, partialQuery);
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchService.search(restaurantId, searchQuery, userId, context);
      setResults(searchResults);
      setShowResults(true);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (value.length >= 3) {
        performSearch(value);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemCount = showSuggestions ? suggestions.length : results.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < itemCount - 1 ? prev + 1 : prev);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (showSuggestions) {
            const suggestion = suggestions[selectedIndex];
            setQuery(suggestion);
            performSearch(suggestion);
          } else if (showResults) {
            const result = results[selectedIndex];
            handleResultSelect(result);
          }
        } else if (query.trim()) {
          performSearch(query);
        }
        break;
        
      case 'Escape':
        setShowResults(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const handleResultSelect = async (result: SearchResult) => {
    await searchService.recordSelection(userId, result.id);
    setShowResults(false);
    setSelectedIndex(-1);
    
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'recipe': return '👨‍🍳';
      case 'ingredient': return '🥕';
      case 'menu_item': return '🍽️';
      case 'prep_task': return '📋';
      case 'order': return '📋';
      default: return '📄';
    }
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="search-highlight">{part}</mark> : 
        part
    );
  };

  return (
    <div className="smart-search" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 3) setShowResults(true);
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="search-input"
        />
        <div className="search-icon">
          {isLoading ? (
            <div className="loading-spinner-small"></div>
          ) : (
            <span>🔍</span>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-dropdown suggestions">
          <div className="dropdown-header">Recent Searches</div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-icon">🕒</span>
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="search-dropdown results">
          {results.length > 0 ? (
            <>
              <div className="dropdown-header">
                Search Results ({results.length})
              </div>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`result-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="result-icon">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="result-content">
                    <div className="result-title">
                      {highlightQuery(result.title, query)}
                    </div>
                    <div className="result-description">
                      {highlightQuery(result.description, query)}
                    </div>
                    <div className="result-meta">
                      <span className="result-type">{result.type.replace('_', ' ')}</span>
                      {result.category && (
                        <span className="result-category">{result.category}</span>
                      )}
                      <span className="result-score">
                        {Math.round(result.relevanceScore * 100)}% match
                      </span>
                    </div>
                    {result.tags.length > 0 && (
                      <div className="result-tags">
                        {result.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-text">
                No results found for "{query}"
              </div>
              <div className="no-results-suggestion">
                Try different keywords or check spelling
              </div>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .smart-search {
          position: relative;
          width: 100%;
          max-width: 600px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 100%;
          padding: 12px 50px 12px 16px;
          font-size: 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .search-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 4px;
        }

        .dropdown-header {
          padding: 12px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          font-weight: 600;
          font-size: 14px;
          color: #495057;
        }

        .suggestion-item, .result-item {
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid #f8f9fa;
        }

        .suggestion-item:hover, .result-item:hover,
        .suggestion-item.selected, .result-item.selected {
          background-color: #f8f9fa;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .suggestion-icon {
          color: #6c757d;
        }

        .suggestion-text {
          color: #495057;
        }

        .result-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .result-icon {
          font-size: 20px;
          margin-top: 4px;
        }

        .result-content {
          flex: 1;
          min-width: 0;
        }

        .result-title {
          font-weight: 600;
          color: #212529;
          margin-bottom: 4px;
        }

        .result-description {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .result-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 8px;
        }

        .result-type {
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .result-category {
          background: #e7f3ff;
          color: #0066cc;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .result-score {
          color: #28a745;
          font-weight: 500;
        }

        .result-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .tag {
          background: #f8f9fa;
          color: #495057;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 11px;
          border: 1px solid #e9ecef;
        }

        .search-highlight {
          background: #fff3cd;
          padding: 0 2px;
          border-radius: 2px;
          font-weight: 600;
        }

        .no-results {
          padding: 40px 20px;
          text-align: center;
          color: #6c757d;
        }

        .no-results-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .no-results-text {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .no-results-suggestion {
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .search-input {
            font-size: 16px; /* Prevents zoom on iOS */
          }
          
          .search-dropdown {
            max-height: 300px;
          }
        }
        `
      }} />
    </div>
  );
};

export default SmartSearch;