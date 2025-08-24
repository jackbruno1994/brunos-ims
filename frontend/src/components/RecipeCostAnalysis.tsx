import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { RecipeCostAnalysis } from '../types/recipe';

interface RecipeCostAnalysisProps {
  recipeId: string;
  recipeName: string;
  onClose: () => void;
}

const RecipeCostAnalysisComponent: React.FC<RecipeCostAnalysisProps> = ({
  recipeId,
  recipeName,
  onClose
}) => {
  const [costAnalysis, setCostAnalysis] = useState<RecipeCostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCostAnalysis();
  }, [recipeId]);

  const fetchCostAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getRecipeCostAnalysis(recipeId);
      setCostAnalysis(result);
    } catch (err) {
      setError('Failed to load cost analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (percentage: number) => `${percentage.toFixed(1)}%`;

  if (loading) {
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
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div>Loading cost analysis...</div>
        </div>
      </div>
    );
  }

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
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Cost Analysis - {recipeName}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        {error && (
          <div style={{ color: '#dc3545', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {costAnalysis && (
          <div>
            {/* Cost Summary */}
            <div style={{ marginBottom: '25px' }}>
              <h3>Cost Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                  <h4 style={{ color: '#007bff', margin: '0 0 5px 0' }}>{formatCurrency(costAnalysis.totalCost)}</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>Total Recipe Cost</p>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <h4 style={{ color: '#28a745', margin: '0 0 5px 0' }}>{formatCurrency(costAnalysis.costPerServing)}</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>Cost per Serving</p>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                  <h4 style={{ color: '#856404', margin: '0 0 5px 0' }}>{formatPercentage(costAnalysis.profitMargin)}</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>Profit Margin</p>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                  <h4 style={{ color: '#0056b3', margin: '0 0 5px 0' }}>{formatCurrency(costAnalysis.suggestedPrice)}</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>Suggested Price</p>
                </div>
              </div>
            </div>

            {/* Ingredient Cost Breakdown */}
            <div style={{ marginBottom: '25px' }}>
              <h3>Ingredient Cost Breakdown</h3>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {costAnalysis.ingredientCosts.map((ingredient, index) => (
                  <div
                    key={ingredient.ingredientId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                    }}
                  >
                    <div>
                      <strong>{ingredient.name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span>{formatCurrency(ingredient.cost)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div
                          style={{
                            width: '60px',
                            height: '8px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${ingredient.percentage}%`,
                              height: '100%',
                              backgroundColor: ingredient.percentage > 30 ? '#dc3545' : ingredient.percentage > 15 ? '#ffc107' : '#28a745',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', color: '#6c757d', minWidth: '35px' }}>
                          {formatPercentage(ingredient.percentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Costs */}
            {(costAnalysis.laborCost || costAnalysis.overheadCost) && (
              <div style={{ marginBottom: '25px' }}>
                <h3>Additional Costs</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  {costAnalysis.laborCost && (
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                      <h4 style={{ color: '#6c757d', margin: '0 0 5px 0' }}>{formatCurrency(costAnalysis.laborCost)}</h4>
                      <p style={{ margin: 0, fontSize: '14px' }}>Labor Cost</p>
                    </div>
                  )}
                  {costAnalysis.overheadCost && (
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                      <h4 style={{ color: '#6c757d', margin: '0 0 5px 0' }}>{formatCurrency(costAnalysis.overheadCost)}</h4>
                      <p style={{ margin: 0, fontSize: '14px' }}>Overhead Cost</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cost Optimization Tips */}
            <div style={{ padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px', marginBottom: '15px' }}>
              <h4>💡 Cost Optimization Tips</h4>
              <ul style={{ margin: '10px 0 0 20px' }}>
                {costAnalysis.ingredientCosts.some(i => i.percentage > 40) && (
                  <li>Consider finding alternative suppliers for high-cost ingredients (&gt;40% of total cost)</li>
                )}
                {costAnalysis.ingredientCosts.length > 8 && (
                  <li>Recipe has many ingredients - consider simplifying or combining similar items</li>
                )}
                {costAnalysis.profitMargin < 50 && (
                  <li>Profit margin is below 50% - consider increasing price or reducing costs</li>
                )}
                {costAnalysis.profitMargin > 80 && (
                  <li>High profit margin - could reduce price for competitive advantage</li>
                )}
                <li>Regular price monitoring recommended for seasonal ingredients</li>
                <li>Consider bulk purchasing for frequently used ingredients</li>
              </ul>
            </div>

            {/* Last Updated */}
            <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'right' }}>
              Last updated: {new Date(costAnalysis.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCostAnalysisComponent;