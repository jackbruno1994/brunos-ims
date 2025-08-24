import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Recipe, RecipeFilters } from '../types/recipe';
import RecipeScalingCalculator from '../components/RecipeScalingCalculator';
import RecipeCostAnalysis from '../components/RecipeCostAnalysis';
import RecipeNotes from '../components/RecipeNotes';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  // const [showCreateForm, setShowCreateForm] = useState(false);
  // TODO: Implement create form functionality
  
  // Phase 1 Feature States
  const [showScaling, setShowScaling] = useState(false);
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [scalingRecipe, setScalingRecipe] = useState<Recipe | null>(null);
  const [costAnalysisRecipe, setCostAnalysisRecipe] = useState<Recipe | null>(null);
  const [notesRecipe, setNotesRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, [filters]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRecipes(filters);
      setRecipes(data);
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#fd7e14';
      case 'expert': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#28a745';
      case 'approved': return '#007bff';
      case 'testing': return '#ffc107';
      case 'draft': return '#6c757d';
      case 'archived': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Phase 1 Feature Handlers
  const handleShowScaling = (recipe: Recipe) => {
    setScalingRecipe(recipe);
    setShowScaling(true);
  };

  const handleShowCostAnalysis = (recipe: Recipe) => {
    setCostAnalysisRecipe(recipe);
    setShowCostAnalysis(true);
  };

  const handleShowNotes = (recipe: Recipe) => {
    setNotesRecipe(recipe);
    setShowNotes(true);
  };

  const handleNotesUpdate = (recipeId: string, updatedNotes: any[]) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, notes: updatedNotes }
        : recipe
    ));
  };

  if (loading) return <div>Loading recipes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="page-title">Recipe Management</h2>
        <button 
          onClick={() => {/* TODO: setShowCreateForm(true) */}}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create New Recipe
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select 
            value={filters.category || ''} 
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Categories</option>
            <option value="Appetizer">Appetizer</option>
            <option value="Main Course">Main Course</option>
            <option value="Dessert">Dessert</option>
            <option value="Beverage">Beverage</option>
            <option value="Side Dish">Side Dish</option>
          </select>

          <select 
            value={filters.difficulty || ''} 
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value || undefined }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>

          <select 
            value={filters.status || ''} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="testing">Testing</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <input
            type="text"
            placeholder="Search recipes..."
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value || undefined }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
          />
        </div>
      </div>

      {/* Recipe Stats */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Recipe Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#007bff', margin: '0 0 5px 0' }}>{recipes.length}</h4>
            <p style={{ margin: 0, color: '#6c757d' }}>Total Recipes</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#28a745', margin: '0 0 5px 0' }}>
              {recipes.filter(r => r.status === 'published').length}
            </h4>
            <p style={{ margin: 0, color: '#6c757d' }}>Published</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#ffc107', margin: '0 0 5px 0' }}>
              {recipes.filter(r => r.status === 'testing').length}
            </h4>
            <p style={{ margin: 0, color: '#6c757d' }}>In Testing</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#dc3545', margin: '0 0 5px 0' }}>
              {recipes.filter(r => r.difficulty === 'expert').length}
            </h4>
            <p style={{ margin: 0, color: '#6c757d' }}>Expert Level</p>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="card">
        <h3>Recipes</h3>
        {recipes.length === 0 ? (
          <p>No recipes found. Start by creating your first recipe.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => setSelectedRecipe(recipe)}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{recipe.name}</h4>
                    <p style={{ margin: '0 0 10px 0', color: '#6c757d' }}>{recipe.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span 
                      style={{ 
                        backgroundColor: getDifficultyColor(recipe.difficulty),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}
                    >
                      {recipe.difficulty}
                    </span>
                    <span 
                      style={{ 
                        backgroundColor: getStatusColor(recipe.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}
                    >
                      {recipe.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <strong>Servings:</strong> {recipe.servings}
                  </div>
                  <div>
                    <strong>Prep:</strong> {formatTime(recipe.prepTime)}
                  </div>
                  <div>
                    <strong>Cook:</strong> {formatTime(recipe.cookTime)}
                  </div>
                  <div>
                    <strong>Total:</strong> {formatTime(recipe.totalTime)}
                  </div>
                  <div>
                    <strong>Cost/Serving:</strong> ${recipe.portionCost?.toFixed(2)}
                  </div>
                  <div>
                    <strong>Rating:</strong> ⭐ {recipe.averageRating?.toFixed(1)}
                  </div>
                </div>

                {recipe.dietaryRestrictions?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Dietary:</strong> {recipe.dietaryRestrictions.join(', ')}
                  </div>
                )}

                {recipe.chefsTips && (
                  <div style={{ backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '4px', fontSize: '14px', marginBottom: '10px' }}>
                    <strong>Chef's Tip:</strong> {recipe.chefsTips}
                  </div>
                )}

                {/* Phase 1 Feature Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowScaling(recipe);
                    }}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    📏 Scale Recipe
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowCostAnalysis(recipe);
                    }}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    💰 Cost Analysis
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowNotes(recipe);
                    }}
                    style={{
                      backgroundColor: '#ffc107',
                      color: '#000',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    📝 Notes ({recipe.notes?.length || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal - Simple placeholder for now */}
      {selectedRecipe && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedRecipe(null)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              margin: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{selectedRecipe.name}</h2>
              <button onClick={() => setSelectedRecipe(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            <p>{selectedRecipe.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              <div><strong>Servings:</strong> {selectedRecipe.servings}</div>
              <div><strong>Prep Time:</strong> {formatTime(selectedRecipe.prepTime)}</div>
              <div><strong>Cook Time:</strong> {formatTime(selectedRecipe.cookTime)}</div>
              <div><strong>Difficulty:</strong> {selectedRecipe.difficulty}</div>
              <div><strong>Status:</strong> {selectedRecipe.status}</div>
              <div><strong>Cost/Serving:</strong> ${selectedRecipe.portionCost?.toFixed(2)}</div>
            </div>

            <h3>Ingredients</h3>
            <ul>
              {selectedRecipe.ingredients.map((ingredient) => (
                <li key={ingredient.id}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  {ingredient.isSeasonal && <span style={{ color: '#28a745', marginLeft: '5px' }}>(Seasonal)</span>}
                </li>
              ))}
            </ul>

            <h3>Instructions</h3>
            <ol>
              {selectedRecipe.instructions.map((instruction) => (
                <li key={instruction.id} style={{ marginBottom: '10px' }}>
                  {instruction.instruction}
                  {instruction.estimatedTime && (
                    <span style={{ color: '#6c757d', marginLeft: '10px' }}>
                      (~{formatTime(instruction.estimatedTime)})
                    </span>
                  )}
                </li>
              ))}
            </ol>

            {selectedRecipe.chefsTips && (
              <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '4px', marginTop: '20px' }}>
                <h4>Chef's Tips</h4>
                <p>{selectedRecipe.chefsTips}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 1 Feature Modals */}
      {showScaling && scalingRecipe && (
        <RecipeScalingCalculator
          recipeId={scalingRecipe.id}
          currentServings={scalingRecipe.servings}
          onClose={() => {
            setShowScaling(false);
            setScalingRecipe(null);
          }}
        />
      )}

      {showCostAnalysis && costAnalysisRecipe && (
        <RecipeCostAnalysis
          recipeId={costAnalysisRecipe.id}
          recipeName={costAnalysisRecipe.name}
          onClose={() => {
            setShowCostAnalysis(false);
            setCostAnalysisRecipe(null);
          }}
        />
      )}

      {showNotes && notesRecipe && (
        <RecipeNotes
          recipeId={notesRecipe.id}
          recipeName={notesRecipe.name}
          notes={notesRecipe.notes || []}
          onClose={() => {
            setShowNotes(false);
            setNotesRecipe(null);
          }}
          onNotesUpdate={(updatedNotes) => handleNotesUpdate(notesRecipe.id, updatedNotes)}
        />
      )}
    </div>
  );
};

export default Recipes;