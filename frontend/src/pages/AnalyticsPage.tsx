import React, { useState, useEffect } from 'react';
import { analyticsService, cachingService } from '../services/orderProcessingService';

interface AnalyticsPageProps {
  restaurantId?: string;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ restaurantId = 'rest1' }) => {
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [costAnalysis, setCostAnalysis] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [cacheMetrics, setCacheMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('predictive');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [restaurantId, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [predictive, cost, performance, cache] = await Promise.all([
        analyticsService.generatePredictiveAnalytics(restaurantId, 7),
        analyticsService.generateCostAnalysis(restaurantId, dateRange.start, dateRange.end),
        analyticsService.getPerformanceMetrics(restaurantId),
        cachingService.getCacheMetrics()
      ]);

      setPredictiveData(predictive);
      setCostAnalysis(cost);
      setPerformanceMetrics(performance);
      setCacheMetrics(cache);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPredictiveAnalytics = () => (
    <div className="analytics-section">
      <h2>Predictive Analytics</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Ingredient Demand Forecast</h3>
          <div className="forecast-data">
            {predictiveData?.ingredientDemand ? 
              Object.entries(predictiveData.ingredientDemand).map(([ingredient, demand]: [string, any]) => (
                <div key={ingredient} className="forecast-item">
                  <span className="ingredient-name">{ingredient}</span>
                  <span className="demand-value">{demand} units</span>
                </div>
              )) :
              <p>No demand data available</p>
            }
          </div>
        </div>

        <div className="analytics-card">
          <h3>Expected Waste</h3>
          <div className="waste-data">
            {predictiveData?.expectedWaste ?
              Object.entries(predictiveData.expectedWaste).map(([ingredient, waste]: [string, any]) => (
                <div key={ingredient} className="waste-item">
                  <span className="ingredient-name">{ingredient}</span>
                  <span className="waste-value">{waste} units</span>
                  <span className="waste-percentage">
                    {((waste / (predictiveData.ingredientDemand[ingredient] || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              )) :
              <p>No waste data available</p>
            }
          </div>
        </div>

        <div className="analytics-card wide">
          <h3>Order Recommendations</h3>
          <div className="recommendations">
            {predictiveData?.recommendedOrders ?
              Object.entries(predictiveData.recommendedOrders).map(([ingredient, quantity]: [string, any]) => (
                <div key={ingredient} className="recommendation-item">
                  <span className="ingredient-name">{ingredient}</span>
                  <span className="recommended-quantity">Order: {quantity} units</span>
                  <span className="recommendation-reason">
                    Based on 7-day forecast + 10% safety margin
                  </span>
                </div>
              )) :
              <p>No recommendations available</p>
            }
          </div>
        </div>

        <div className="analytics-card">
          <h3>Cost Optimization</h3>
          <div className="cost-optimization">
            <div className="potential-savings">
              <h4>Potential Savings</h4>
              <div className="savings-amount">
                ${predictiveData?.costOptimization?.potentialSavings || 0}
              </div>
            </div>
            <div className="optimization-recommendations">
              <h4>Recommendations</h4>
              <ul>
                {predictiveData?.costOptimization?.recommendations?.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                )) || <li>No recommendations available</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCostAnalysis = () => (
    <div className="analytics-section">
      <h2>Cost Analysis</h2>
      
      <div className="date-range-selector">
        <label>
          Start Date:
          <input 
            type="date" 
            value={dateRange.start.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
          />
        </label>
        <label>
          End Date:
          <input 
            type="date" 
            value={dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
          />
        </label>
        <button onClick={loadAnalyticsData} className="refresh-btn">Update</button>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Revenue vs Costs</h3>
          <div className="revenue-costs">
            <div className="metric-item">
              <span className="metric-label">Total Revenue:</span>
              <span className="metric-value revenue">${costAnalysis?.data?.totalRevenue || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Total Costs:</span>
              <span className="metric-value costs">${costAnalysis?.data?.totalCosts || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Net Profit:</span>
              <span className="metric-value profit">
                ${(costAnalysis?.data?.totalRevenue || 0) - (costAnalysis?.data?.totalCosts || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Cost Breakdown</h3>
          <div className="cost-breakdown">
            {costAnalysis?.data?.costBreakdown ?
              Object.entries(costAnalysis.data.costBreakdown).map(([category, amount]: [string, any]) => (
                <div key={category} className="breakdown-item">
                  <span className="category-name">{category}</span>
                  <span className="category-amount">${amount}</span>
                  <div className="category-bar">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${(amount / costAnalysis.data.totalCosts) * 100}%`,
                        backgroundColor: getCategoryColor(category)
                      }}
                    ></div>
                  </div>
                </div>
              )) :
              <p>No cost breakdown available</p>
            }
          </div>
        </div>

        <div className="analytics-card">
          <h3>Waste Analysis</h3>
          <div className="waste-analysis">
            <div className="waste-summary">
              <div className="waste-metric">
                <span className="waste-label">Total Waste Cost:</span>
                <span className="waste-value">${costAnalysis?.data?.wasteAnalysis?.totalCost || 0}</span>
              </div>
              <div className="waste-metric">
                <span className="waste-label">Waste Percentage:</span>
                <span className="waste-value">
                  {costAnalysis?.data?.wasteAnalysis?.percentage || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card wide">
          <h3>Profit Margin Analysis</h3>
          <div className="profit-margins">
            {costAnalysis?.data?.profitMargins ?
              Object.entries(costAnalysis.data.profitMargins).map(([item, margin]: [string, any]) => (
                <div key={item} className="margin-item">
                  <span className="item-name">{item}</span>
                  <span className="margin-percentage">{margin}%</span>
                  <div className="margin-bar">
                    <div 
                      className="margin-fill"
                      style={{ 
                        width: `${Math.abs(margin)}%`,
                        backgroundColor: margin > 0 ? '#28a745' : '#dc3545'
                      }}
                    ></div>
                  </div>
                </div>
              )) :
              <p>No profit margin data available</p>
            }
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="analytics-section">
      <h2>Performance Metrics</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Orders Completed</h3>
          <div className="metric-value">{performanceMetrics?.ordersCompleted || 0}</div>
        </div>

        <div className="analytics-card">
          <h3>Average Order Time</h3>
          <div className="metric-value">{performanceMetrics?.averageOrderTime || 0} min</div>
        </div>

        <div className="analytics-card">
          <h3>Kitchen Efficiency</h3>
          <div className="metric-value">{performanceMetrics?.efficiency || 0}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${performanceMetrics?.efficiency || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Today's Revenue</h3>
          <div className="metric-value">${performanceMetrics?.totalRevenue || 0}</div>
        </div>

        <div className="analytics-card wide">
          <h3>Popular Menu Items</h3>
          <div className="popular-items">
            {performanceMetrics?.popularItems?.map((item: any, index: number) => (
              <div key={index} className="popular-item">
                <span className="item-rank">#{index + 1}</span>
                <span className="item-name">{item.menuItemId}</span>
                <span className="item-count">{item.count} orders</span>
              </div>
            )) || <p>No popular items data available</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemMetrics = () => (
    <div className="analytics-section">
      <h2>System Performance</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Cache Performance</h3>
          <div className="cache-metrics">
            <div className="cache-metric">
              <span className="metric-label">Hit Rate:</span>
              <span className="metric-value">{cacheMetrics?.hitRate || 0}%</span>
            </div>
            <div className="cache-metric">
              <span className="metric-label">Total Requests:</span>
              <span className="metric-value">{cacheMetrics?.totalRequests || 0}</span>
            </div>
            <div className="cache-metric">
              <span className="metric-label">Cache Size:</span>
              <span className="metric-value">{cacheMetrics?.size || 0} entries</span>
            </div>
            <div className="cache-metric">
              <span className="metric-label">Evictions:</span>
              <span className="metric-value">{cacheMetrics?.evictions || 0}</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Cache Actions</h3>
          <div className="cache-actions">
            <button 
              onClick={() => cachingService.clearCache()}
              className="action-btn danger"
            >
              Clear Cache
            </button>
            <button 
              onClick={() => cachingService.preloadFrequentData(restaurantId)}
              className="action-btn primary"
            >
              Preload Data
            </button>
            <button 
              onClick={() => cachingService.warmCache(restaurantId)}
              className="action-btn secondary"
            >
              Warm Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      food: '#28a745',
      labor: '#ffc107',
      overhead: '#17a2b8',
      utilities: '#6f42c1',
      rent: '#fd7e14'
    };
    return colors[category] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Advanced Analytics Dashboard</h1>
        <button onClick={loadAnalyticsData} className="refresh-all-btn">
          🔄 Refresh All Data
        </button>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'predictive' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictive')}
        >
          Predictive Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cost' ? 'active' : ''}`}
          onClick={() => setActiveTab('cost')}
        >
          Cost Analysis
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance Metrics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System Metrics
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'predictive' && renderPredictiveAnalytics()}
        {activeTab === 'cost' && renderCostAnalysis()}
        {activeTab === 'performance' && renderPerformanceMetrics()}
        {activeTab === 'system' && renderSystemMetrics()}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .analytics-page {
          padding: 20px;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .refresh-all-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .analytics-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tab-btn {
          padding: 12px 24px;
          border: 2px solid #e9ecef;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .tab-btn:hover {
          border-color: #007bff;
        }

        .tab-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .analytics-section h2 {
          margin-bottom: 20px;
          color: #495057;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .analytics-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .analytics-card.wide {
          grid-column: span 2;
        }

        .analytics-card h3 {
          margin: 0 0 15px 0;
          color: #495057;
          font-size: 18px;
          font-weight: 600;
          border-bottom: 2px solid #f8f9fa;
          padding-bottom: 10px;
        }

        .metric-value {
          font-size: 2.5em;
          font-weight: bold;
          color: #212529;
          margin-bottom: 10px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }

        .progress-fill {
          height: 100%;
          background: #28a745;
          transition: width 0.3s;
        }

        .forecast-data, .waste-data, .recommendations {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .forecast-item, .waste-item, .recommendation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .recommendation-item {
          flex-direction: column;
          align-items: flex-start;
        }

        .recommendation-reason {
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
        }

        .date-range-selector {
          display: flex;
          gap: 20px;
          align-items: center;
          margin-bottom: 20px;
          padding: 15px;
          background: white;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .date-range-selector label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-weight: 500;
        }

        .date-range-selector input {
          padding: 8px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
        }

        .refresh-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .revenue-costs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .metric-value.revenue {
          color: #28a745;
          font-weight: bold;
        }

        .metric-value.costs {
          color: #dc3545;
          font-weight: bold;
        }

        .metric-value.profit {
          color: #17a2b8;
          font-weight: bold;
        }

        .cost-breakdown, .profit-margins {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .breakdown-item, .margin-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .category-bar, .margin-bar {
          width: 100px;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          margin-left: 10px;
        }

        .bar-fill, .margin-fill {
          height: 100%;
          transition: width 0.3s;
        }

        .popular-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .popular-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .item-rank {
          background: #007bff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: bold;
          min-width: 30px;
          text-align: center;
        }

        .cache-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .cache-metric {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .cache-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .action-btn {
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .action-btn.primary {
          background: #007bff;
          color: white;
        }

        .action-btn.secondary {
          background: #6c757d;
          color: white;
        }

        .action-btn.danger {
          background: #dc3545;
          color: white;
        }

        .action-btn:hover {
          opacity: 0.9;
        }

        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
          
          .analytics-card.wide {
            grid-column: span 1;
          }
          
          .analytics-tabs {
            flex-wrap: wrap;
          }
          
          .date-range-selector {
            flex-direction: column;
            align-items: stretch;
          }
        }
        `
      }} />
    </div>
  );
};

export default AnalyticsPage;