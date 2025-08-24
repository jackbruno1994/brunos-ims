import React, { useState } from 'react';
import { apiService } from '../services/api';
import { RecipeScaling } from '../types/recipe';

interface RecipeScalingCalculatorProps {
  recipeId: string;
  currentServings: number;
  onClose: () => void;
}

const RecipeScalingCalculator: React.FC<RecipeScalingCalculatorProps> = ({
  recipeId,
  currentServings,
  onClose
}) => {
  const [targetServings, setTargetServings] = useState(currentServings);
  const [scaling, setScaling] = useState<RecipeScaling | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScale = async () => {
    if (targetServings <= 0) {
      setError('Target servings must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiService.scaleRecipe(recipeId, targetServings);
      setScaling(result);
    } catch (err) {
      setError('Failed to scale recipe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scalingFactor = targetServings / currentServings;

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Recipe Scaling Calculator</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="targetServings" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Target Servings:
          </label>
          <input
            id="targetServings"
            type="number"
            min="1"
            value={targetServings}
            onChange={(e) => setTargetServings(parseInt(e.target.value) || 1)}
            style={{
              width: '100px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              marginRight: '10px'
            }}
          />
          <span style={{ color: '#6c757d' }}>
            (Original: {currentServings} servings)
          </span>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div>
              <strong>Scaling Factor:</strong> {scalingFactor.toFixed(2)}x
            </div>
            <div>
              <strong>Change:</strong> {scalingFactor > 1 ? 'Increase' : scalingFactor < 1 ? 'Decrease' : 'No change'}
            </div>
            <div>
              <strong>Percentage:</strong> {((scalingFactor - 1) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <button
          onClick={handleScale}
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          {loading ? 'Calculating...' : 'Calculate Scaling'}
        </button>

        {error && (
          <div style={{ color: '#dc3545', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {scaling && (
          <div>
            <h3>Scaled Recipe</h3>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
              <h4>Scaling Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                <div><strong>Original Servings:</strong> {scaling.originalServings}</div>
                <div><strong>Target Servings:</strong> {scaling.targetServings}</div>
                <div><strong>Scaling Factor:</strong> {scaling.scalingFactor.toFixed(2)}x</div>
                {scaling.adjustedCookTime && (
                  <div><strong>Adjusted Cook Time:</strong> {scaling.adjustedCookTime} min</div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4>Adjusted Ingredients</h4>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {scaling.adjustedIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: ingredient.isSeasonal ? '#fff3cd' : 'transparent'
                    }}
                  >
                    <span>
                      <strong>{ingredient.name}</strong>
                      {ingredient.isSeasonal && <span style={{ color: '#856404', marginLeft: '5px' }}>(Seasonal)</span>}
                    </span>
                    <span>
                      <strong>{ingredient.quantity} {ingredient.unit}</strong>
                      {ingredient.cost && <span style={{ color: '#6c757d', marginLeft: '10px' }}>(${ingredient.cost.toFixed(2)})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {scaling.notes && (
              <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '15px' }}>
                <strong>Important Notes:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{scaling.notes}</p>
              </div>
            )}

            {scalingFactor > 2 && (
              <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '15px' }}>
                <strong>⚠️ Large Scale Warning:</strong>
                <p style={{ margin: '5px 0 0 0' }}>
                  Scaling by more than 2x may affect cooking times, mixing techniques, and equipment requirements. 
                  Consider preparing in multiple batches for best results.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeScalingCalculator;