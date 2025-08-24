import React from 'react';
import { RecipeCategory, RecipeFilters } from '../types/recipe';

interface RecipeFiltersProps {
  categories: RecipeCategory[];
  filters: RecipeFilters;
  onFilterChange: (filters: RecipeFilters) => void;
}

const RecipeFiltersComponent: React.FC<RecipeFiltersProps> = ({ 
  categories, 
  filters, 
  onFilterChange 
}) => {
  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: category === 'all' ? undefined : category
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    onFilterChange({
      ...filters,
      difficulty: difficulty === 'all' ? undefined : difficulty as 'easy' | 'medium' | 'hard'
    });
  };

  const handleMaxTimeChange = (maxTime: string) => {
    onFilterChange({
      ...filters,
      maxTime: maxTime ? parseInt(maxTime) : undefined
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.maxTime;

  return (
    <div className="recipe-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button 
            className="btn btn-link clear-filters"
            onClick={clearFilters}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-label">Category</label>
        <select 
          className="filter-select"
          value={filters.category || 'all'}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Difficulty</label>
        <select 
          className="filter-select"
          value={filters.difficulty || 'all'}
          onChange={(e) => handleDifficultyChange(e.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Max Cooking Time</label>
        <select 
          className="filter-select"
          value={filters.maxTime?.toString() || ''}
          onChange={(e) => handleMaxTimeChange(e.target.value)}
        >
          <option value="">Any duration</option>
          <option value="15">Under 15 minutes</option>
          <option value="30">Under 30 minutes</option>
          <option value="60">Under 1 hour</option>
          <option value="120">Under 2 hours</option>
        </select>
      </div>

      <div className="filter-summary">
        {categories.length > 0 && (
          <div className="categories-summary">
            <h4>Categories ({categories.length})</h4>
            <div className="category-list">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className={`category-item ${filters.category === category.name ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.name)}
                  style={{ borderLeft: `4px solid ${category.color || '#ccc'}` }}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeFiltersComponent;