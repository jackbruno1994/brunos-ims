import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { apiService } from '../services/api';

interface RecipeDetailProps {
  recipe: Recipe | null;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  loading: boolean;
}

interface RecipeCost {
  recipeId: string;
  cost: number;
  currency: string;
  servingSize: number;
  costPerServing: number;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onEdit,
  onDelete,
  onBack,
  loading
}) => {
  const [recipeCost, setRecipeCost] = useState<RecipeCost | null>(null);
  const [costLoading, setCostLoading] = useState(false);

  useEffect(() => {
    if (recipe) {
      loadRecipeCost();
    }
  }, [recipe]);

  const loadRecipeCost = async () => {
    if (!recipe) return;
    
    try {
      setCostLoading(true);
      const response = await apiService.getRecipeCost(recipe.id);
      setRecipeCost(response.data);
    } catch (error) {
      console.error('Failed to load recipe cost:', error);
    } finally {
      setCostLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !recipe) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading recipe details...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Recipes
        </button>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🖨️ Print
          </button>
          <button
            onClick={onEdit}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Edit Recipe
          </button>
          <button
            onClick={onDelete}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete Recipe
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '30px' }}>
        {/* Recipe Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#333' }}>
            {recipe.name}
          </h1>
          <p style={{ 
            margin: '0 0 20px 0', 
            fontSize: '18px', 
            color: '#666',
            lineHeight: '1.5'
          }}>
            {recipe.description}
          </p>

          {/* Status and metadata */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: '#e9ecef',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              color: '#495057'
            }}>
              📂 {recipe.category}
            </span>
            {recipe.difficulty && (
              <span style={{
                backgroundColor: getDifficultyColor(recipe.difficulty),
                color: 'white',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '14px'
              }}>
                🎯 {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </span>
            )}
            <span style={{
              backgroundColor: recipe.published ? '#28a745' : '#ffc107',
              color: recipe.published ? 'white' : '#212529',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '14px'
            }}>
              {recipe.published ? '✅ Published' : '📝 Draft'}
            </span>
            <span style={{
              backgroundColor: '#f8f9fa',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              color: '#495057'
            }}>
              v{recipe.version}
            </span>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recipe Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>🕐</div>
            <div style={{ fontWeight: 'bold', color: '#333' }}>Prep Time</div>
            <div style={{ color: '#666' }}>{formatTime(recipe.preparationTime)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔥</div>
            <div style={{ fontWeight: 'bold', color: '#333' }}>Cook Time</div>
            <div style={{ color: '#666' }}>{formatTime(recipe.cookingTime)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
            <div style={{ fontWeight: 'bold', color: '#333' }}>Serves</div>
            <div style={{ color: '#666' }}>{recipe.servingSize} people</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏱️</div>
            <div style={{ fontWeight: 'bold', color: '#333' }}>Total Time</div>
            <div style={{ color: '#666' }}>{formatTime(recipe.preparationTime + recipe.cookingTime)}</div>
          </div>
        </div>

        {/* Cost Information */}
        {costLoading ? (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Loading cost information...
          </div>
        ) : recipeCost && (
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>💰 Cost Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#155724' }}>Total Cost</div>
                <div style={{ fontSize: '18px', color: '#155724' }}>
                  ${recipeCost.cost.toFixed(2)} {recipeCost.currency}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#155724' }}>Cost per Serving</div>
                <div style={{ fontSize: '18px', color: '#155724' }}>
                  ${recipeCost.costPerServing.toFixed(2)} {recipeCost.currency}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Ingredients */}
          <div>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '24px', 
              color: '#333',
              borderBottom: '2px solid #007bff',
              paddingBottom: '10px'
            }}>
              🥕 Ingredients
            </h3>
            <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
              {recipe.ingredients.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No ingredients listed</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} style={{ 
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <span style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ flex: 1, fontWeight: 'bold' }}>
                        {ingredient.ingredientId}
                      </span>
                      <span style={{ color: '#007bff', fontWeight: 'bold' }}>
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '24px', 
              color: '#333',
              borderBottom: '2px solid #28a745',
              paddingBottom: '10px'
            }}>
              📝 Instructions
            </h3>
            <div>
              {recipe.instructions.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No instructions provided</p>
              ) : (
                recipe.instructions
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((instruction, index) => (
                    <div key={index} style={{ 
                      marginBottom: '20px',
                      display: 'flex',
                      gap: '15px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {instruction.stepNumber}
                      </div>
                      <div style={{ 
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '8px',
                        flex: 1,
                        lineHeight: '1.5'
                      }}>
                        {instruction.description}
                        {instruction.duration && (
                          <div style={{ 
                            marginTop: '8px', 
                            fontSize: '12px', 
                            color: '#666',
                            fontStyle: 'italic'
                          }}>
                            ⏱️ Duration: {instruction.duration} minutes
                          </div>
                        )}
                        {instruction.temperature && (
                          <div style={{ 
                            marginTop: '4px', 
                            fontSize: '12px', 
                            color: '#666',
                            fontStyle: 'italic'
                          }}>
                            🌡️ Temperature: {instruction.temperature}°C
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Allergens */}
        {recipe.allergens && recipe.allergens.length > 0 && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '30px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Allergen Information</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {recipe.allergens.map((allergen) => (
                <span
                  key={allergen}
                  style={{
                    backgroundColor: '#f39c12',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nutritional Info */}
        {recipe.nutritionalInfo && (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #bbdefb',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>📊 Nutritional Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
              {Object.entries(recipe.nutritionalInfo).map(([key, value]) => (
                value !== undefined && (
                  <div key={key} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#1976d2', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ fontSize: '18px', color: '#333' }}>
                      {value}{key === 'calories' ? '' : 'g'}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #dee2e6',
          fontSize: '14px',
          color: '#666'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>Created:</strong> {formatDate(recipe.createdAt)}
            </div>
            <div>
              <strong>Last Updated:</strong> {formatDate(recipe.updatedAt)}
            </div>
            <div>
              <strong>Author:</strong> {recipe.author}
            </div>
            <div>
              <strong>Recipe ID:</strong> {recipe.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;