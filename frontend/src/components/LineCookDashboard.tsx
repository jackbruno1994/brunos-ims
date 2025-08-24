import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './Dashboard.css';

interface PrepListItem {
  recipeId: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

interface PrepList {
  id: string;
  date: Date;
  userId: string;
  recipes: PrepListItem[];
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

const LineCookDashboard: React.FC = () => {
  const [prepList, setPrepList] = useState<PrepList | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [prepListData, recipesData] = await Promise.all([
        apiService.getTodaysPrepList(),
        apiService.getRecipes()
      ]);
      setPrepList(prepListData);
      setRecipes(recipesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePrepItem = async (itemId: string, completed: boolean) => {
    if (!prepList) return;

    try {
      await apiService.updatePrepListItem(prepList.id, itemId, { completed });
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update prep item:', error);
    }
  };

  const getRecipeName = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe?.name || 'Unknown Recipe';
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading your prep list...</div>;
  }

  const completedItems = prepList?.recipes.filter(item => item.completed).length || 0;
  const totalItems = prepList?.recipes.length || 0;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="dashboard linecook-dashboard">
      <div className="dashboard-header">
        <h2>Today's Prep List</h2>
        <div className="completion-badge">
          {completedItems}/{totalItems} Complete ({completionPercentage}%)
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Tasks Remaining</h3>
          <div className="stat-number">{totalItems - completedItems}</div>
        </div>
        <div className="stat-card">
          <h3>Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="prep-list">
        <h3>Prep Tasks</h3>
        {!prepList || prepList.recipes.length === 0 ? (
          <div className="empty-state">
            <p>No prep tasks for today! Great job!</p>
          </div>
        ) : (
          <div className="prep-items">
            {prepList.recipes.map((item, index) => (
              <div 
                key={index} 
                className={`prep-item ${item.completed ? 'completed' : ''} ${getPriorityClass(item.priority)}`}
              >
                <div className="prep-item-header">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => togglePrepItem(item.recipeId, e.target.checked)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <div className="prep-item-info">
                    <h4>{getRecipeName(item.recipeId)}</h4>
                    <div className="prep-details">
                      <span className="quantity">Qty: {item.quantity}</span>
                      <span className={`priority ${getPriorityClass(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                {item.notes && (
                  <div className="prep-notes">
                    <strong>Notes:</strong> {item.notes}
                  </div>
                )}
                {item.completed && item.completedAt && (
                  <div className="completion-time">
                    Completed at {new Date(item.completedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="assigned-recipes">
        <h3>My Assigned Recipes</h3>
        <div className="recipe-grid">
          {recipes.length === 0 ? (
            <p>No recipes assigned yet.</p>
          ) : (
            recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <h4>{recipe.name}</h4>
                <p>{recipe.description}</p>
                <div className="recipe-meta">
                  <span>Prep: {recipe.prepTime}min</span>
                  <span>Cook: {recipe.cookTime}min</span>
                  <span className={`difficulty ${recipe.difficulty}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LineCookDashboard;