import React, { useState } from 'react';

interface RecipeSearchProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ onSearch, searchQuery }) => {
  const [query, setQuery] = useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="recipe-search">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search recipes by name, ingredients, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary search-btn">
            🔍 Search
          </button>
          {query && (
            <button 
              type="button" 
              className="btn btn-secondary clear-btn"
              onClick={handleClear}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RecipeSearch;