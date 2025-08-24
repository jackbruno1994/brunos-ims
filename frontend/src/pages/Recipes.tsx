import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Recipe, RecipeFilters } from '../types';
import RecipeList from '../components/RecipeList';
import RecipeForm from '../components/RecipeForm';
import RecipeDetail from '../components/RecipeDetail';

type View = 'list' | 'create' | 'detail' | 'edit';

const Recipes: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecipeFilters>({});

  // Load recipes
  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRecipes(filters);
      setRecipes(response.data);
    } catch (err) {
      setError('Failed to load recipes');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [filters]);

  // Handle recipe creation
  const handleCreateRecipe = async (recipeData: any) => {
    try {
      setLoading(true);
      await apiService.createRecipe(recipeData);
      await loadRecipes();
      setCurrentView('list');
    } catch (err) {
      setError('Failed to create recipe');
      console.error('Error creating recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle recipe update
  const handleUpdateRecipe = async (id: string, recipeData: any) => {
    try {
      setLoading(true);
      await apiService.updateRecipe(id, recipeData);
      await loadRecipes();
      setCurrentView('list');
    } catch (err) {
      setError('Failed to update recipe');
      console.error('Error updating recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle recipe deletion
  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteRecipe(id);
      await loadRecipes();
      if (currentView === 'detail' && selectedRecipe?.id === id) {
        setCurrentView('list');
      }
    } catch (err) {
      setError('Failed to delete recipe');
      console.error('Error deleting recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing recipe details
  const handleViewRecipe = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiService.getRecipe(id);
      setSelectedRecipe(response.data);
      setCurrentView('detail');
    } catch (err) {
      setError('Failed to load recipe details');
      console.error('Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing recipe
  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('edit');
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <RecipeList
            recipes={recipes}
            filters={filters}
            onFiltersChange={setFilters}
            onViewRecipe={handleViewRecipe}
            onEditRecipe={handleEditRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            loading={loading}
          />
        );
      case 'create':
        return (
          <RecipeForm
            onSubmit={handleCreateRecipe}
            onCancel={() => setCurrentView('list')}
            loading={loading}
          />
        );
      case 'edit':
        return (
          <RecipeForm
            recipe={selectedRecipe}
            onSubmit={(data) => selectedRecipe && handleUpdateRecipe(selectedRecipe.id, data)}
            onCancel={() => setCurrentView('list')}
            loading={loading}
          />
        );
      case 'detail':
        return (
          <RecipeDetail
            recipe={selectedRecipe}
            onEdit={() => selectedRecipe && handleEditRecipe(selectedRecipe)}
            onDelete={() => selectedRecipe && handleDeleteRecipe(selectedRecipe.id)}
            onBack={() => setCurrentView('list')}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="page-title">Recipe Management</h2>
        {currentView === 'list' && (
          <button 
            onClick={() => setCurrentView('create')}
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
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {renderCurrentView()}
    </div>
  );
};

export default Recipes;