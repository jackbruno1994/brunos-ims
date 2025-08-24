import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Recipe, RecipeCategory, RecipeFilters } from '../types/recipe';
import RecipeList from '../components/RecipeList';
import RecipeSearch from '../components/RecipeSearch';
import RecipeFiltersComponent from '../components/RecipeFilters';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadRecipes();
    loadCategories();
  }, [filters, pagination.page]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRecipes({
        page: pagination.page,
        limit: pagination.limit,
        category: filters.category,
        search: filters.search,
        difficulty: filters.difficulty
      });
      setRecipes(response.data || []);
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        }));
      }
    } catch (err) {
      setError('Failed to load recipes');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getRecipeCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        setLoading(true);
        const response = await apiService.searchRecipes({
          q: query,
          page: 1,
          limit: pagination.limit
        });
        setRecipes(response.data || []);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            page: 1,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages
          }));
        }
      } catch (err) {
        setError('Failed to search recipes');
        console.error('Error searching recipes:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setFilters({});
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleFilterChange = (newFilters: RecipeFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleRecipeDelete = async (recipeId: string) => {
    try {
      await apiService.deleteRecipe(recipeId);
      loadRecipes(); // Reload recipes after deletion
    } catch (err) {
      setError('Failed to delete recipe');
      console.error('Error deleting recipe:', err);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => { setError(null); loadRecipes(); }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Recipe Management</h2>
        <p>Manage your restaurant's recipes, ingredients, and cooking instructions</p>
      </div>

      <div className="recipes-container">
        <div className="recipes-toolbar">
          <RecipeSearch 
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
          
          <div className="toolbar-actions">
            <button 
              className="btn btn-primary"
              onClick={() => {
                // TODO: Implement navigation to create recipe page
                alert('Create Recipe functionality will be implemented');
              }}
            >
              + Create Recipe
            </button>
          </div>
        </div>

        <div className="recipes-content">
          <aside className="recipes-sidebar">
            <RecipeFiltersComponent
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <main className="recipes-main">
            {loading ? (
              <div className="loading">Loading recipes...</div>
            ) : (
              <>
                <RecipeList
                  recipes={recipes}
                  onDelete={handleRecipeDelete}
                />
                
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </button>
                    
                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    
                    <button 
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Recipes;