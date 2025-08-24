import React from 'react';
import { Recipe } from '../types/recipe';

interface RecipeListProps {
  recipes: Recipe[];
  onDelete: (recipeId: string) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onDelete }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'draft': return '#6c757d';
      case 'archived': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="empty-state">
        <h3>No recipes found</h3>
        <p>Start by creating your first recipe or adjust your search filters.</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="recipe-card">
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name}
              className="recipe-image"
            />
          ) : (
            <div className="recipe-image-placeholder">
              🍽️
            </div>
          )}
          
          <div className="recipe-content">
            <div className="recipe-header">
              <h3 className="recipe-name">{recipe.name}</h3>
              <div className="recipe-badges">
                <span 
                  className="badge"
                  style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                >
                  {recipe.difficulty}
                </span>
                <span 
                  className="badge"
                  style={{ backgroundColor: getStatusColor(recipe.status) }}
                >
                  {recipe.status}
                </span>
              </div>
            </div>
            
            <p className="recipe-description">{recipe.description}</p>
            
            <div className="recipe-meta">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{recipe.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Servings:</span>
                <span className="meta-value">{recipe.servings}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total Time:</span>
                <span className="meta-value">{formatTime(recipe.totalTime)}</span>
              </div>
              {recipe.costPerServing && (
                <div className="meta-item">
                  <span className="meta-label">Cost per serving:</span>
                  <span className="meta-value">${recipe.costPerServing.toFixed(2)}</span>
                </div>
              )}
            </div>

            {recipe.tags.length > 0 && (
              <div className="recipe-tags">
                {recipe.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {recipe.allergens.length > 0 && (
              <div className="recipe-allergens">
                <span className="allergens-label">⚠️ Allergens:</span>
                <span className="allergens-list">
                  {recipe.allergens.join(', ')}
                </span>
              </div>
            )}
          </div>
          
          <div className="recipe-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                // TODO: Implement view recipe details
                alert(`View recipe: ${recipe.name}`);
              }}
            >
              View
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                // TODO: Implement edit recipe
                alert(`Edit recipe: ${recipe.name}`);
              }}
            >
              Edit
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm(`Are you sure you want to archive the recipe "${recipe.name}"?`)) {
                  onDelete(recipe.id);
                }
              }}
            >
              Archive
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;