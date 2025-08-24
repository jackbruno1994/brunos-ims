import React, { useState } from 'react';
import { Recipe, RecipeFilters } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
  onViewRecipe: (id: string) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  loading: boolean;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  filters,
  onFiltersChange,
  onViewRecipe,
  onEditRecipe,
  onDeleteRecipe,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchTerm });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Search and Filters */}
      <div style={{ marginBottom: '20px', padding: '20px', borderBottom: '1px solid #dee2e6' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button 
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={filters.published === true}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                published: e.target.checked ? true : undefined 
              })}
            />
            Published only
          </label>
          
          <select
            value={filters.category || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              category: e.target.value || undefined 
            })}
            style={{
              padding: '6px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="">All Categories</option>
            <option value="Italian">Italian</option>
            <option value="Chinese">Chinese</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
            <option value="American">American</option>
            <option value="French">French</option>
            <option value="Mediterranean">Mediterranean</option>
          </select>

          {(filters.search || filters.category || filters.published !== undefined) && (
            <button
              onClick={() => {
                setSearchTerm('');
                onFiltersChange({});
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No recipes found. Create your first recipe!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          padding: '20px'
        }}>
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              style={{
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <h3 
                  style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '18px',
                    color: '#333'
                  }}
                  onClick={() => onViewRecipe(recipe.id)}
                >
                  {recipe.name}
                </h3>
                <p style={{ 
                  margin: '0', 
                  color: '#666', 
                  fontSize: '14px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {recipe.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: '#e9ecef',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#495057'
                }}>
                  {recipe.category}
                </span>
                {recipe.difficulty && (
                  <span style={{
                    backgroundColor: getDifficultyColor(recipe.difficulty),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {recipe.difficulty}
                  </span>
                )}
                {!recipe.published && (
                  <span style={{
                    backgroundColor: '#ffc107',
                    color: '#212529',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    Draft
                  </span>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '12px',
                color: '#666',
                marginBottom: '12px'
              }}>
                <span>🕐 Prep: {formatTime(recipe.preparationTime)}</span>
                <span>🔥 Cook: {formatTime(recipe.cookingTime)}</span>
                <span>👥 Serves: {recipe.servingSize}</span>
              </div>

              {recipe.cost && (
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#28a745',
                  marginBottom: '12px'
                }}>
                  ${recipe.cost.toFixed(2)} ({recipe.currency})
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewRecipe(recipe.id);
                  }}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRecipe(recipe);
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRecipe(recipe.id);
                  }}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;