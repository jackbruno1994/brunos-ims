import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/orderProcessingService';

interface DashboardProps {
  userId: string;
  restaurantId: string;
  role: string;
}

interface DashboardData {
  [key: string]: any;
}

const RoleBasedDashboard: React.FC<DashboardProps> = ({ userId, restaurantId, role }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [userId, restaurantId, role]);

  const loadDashboardData = async () => {
    try {
      const data = await analyticsService.getRoleDashboard(restaurantId, userId, role);
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChefDashboard = () => (
    <div className="chef-dashboard">
      <div className="dashboard-grid">
        <div className="metric-card primary">
          <h3>Active Orders</h3>
          <div className="metric-value">{dashboardData.activeOrders || 0}</div>
          <div className="metric-trend">
            {dashboardData.activeOrders > 10 ? '⚠️ High Volume' : '✅ Normal'}
          </div>
        </div>

        <div className="metric-card">
          <h3>Kitchen Efficiency</h3>
          <div className="metric-value">{dashboardData.kitchenEfficiency || 0}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${dashboardData.kitchenEfficiency || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <h3>Prep List Status</h3>
          <div className="prep-status">
            <div className="status-item">
              <span className="status-label">Completed:</span>
              <span className="status-value">{dashboardData.prepListStatus?.completed || 0}</span>
            </div>
            <div className="status-item">
              <span className="status-label">In Progress:</span>
              <span className="status-value">{dashboardData.prepListStatus?.inProgress || 0}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Pending:</span>
              <span className="status-value">{dashboardData.prepListStatus?.pending || 0}</span>
            </div>
          </div>
        </div>

        <div className="metric-card wide">
          <h3>Team Performance</h3>
          <div className="team-performance">
            {dashboardData.teamPerformance?.map((member: any, index: number) => (
              <div key={index} className="team-member">
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  <span className="member-role">{member.role}</span>
                </div>
                <div className="member-metrics">
                  <span className="metric">⏱️ {member.avgTime}min</span>
                  <span className="metric">✅ {member.tasksCompleted}</span>
                </div>
              </div>
            )) || <p>No team data available</p>}
          </div>
        </div>

        <div className="metric-card wide">
          <h3>Inventory Alerts</h3>
          <div className="alerts-list">
            {dashboardData.inventoryAlerts?.length > 0 ? (
              dashboardData.inventoryAlerts.map((alert: any, index: number) => (
                <div key={index} className={`alert-item ${alert.severity}`}>
                  <span className="alert-icon">
                    {alert.severity === 'critical' ? '🚨' : 
                     alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <span className="alert-text">{alert.message}</span>
                </div>
              ))
            ) : (
              <p className="no-alerts">✅ No critical alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderManagerDashboard = () => (
    <div className="manager-dashboard">
      <div className="dashboard-grid">
        <div className="metric-card primary">
          <h3>Daily Revenue</h3>
          <div className="metric-value">${dashboardData.dailyRevenue || 0}</div>
          <div className="metric-trend">
            {dashboardData.revenueChange > 0 ? 
              `📈 +${dashboardData.revenueChange}%` : 
              `📉 ${dashboardData.revenueChange}%`}
          </div>
        </div>

        <div className="metric-card">
          <h3>Profit Margin</h3>
          <div className="metric-value">{dashboardData.profitMargin || 0}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill profit"
              style={{ width: `${dashboardData.profitMargin || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <h3>Staff Efficiency</h3>
          <div className="metric-value">{dashboardData.staffEfficiency || 0}%</div>
          <div className="efficiency-breakdown">
            <small>Kitchen: {dashboardData.kitchenEfficiency || 0}%</small>
            <small>Service: {dashboardData.serviceEfficiency || 0}%</small>
          </div>
        </div>

        <div className="metric-card">
          <h3>Customer Satisfaction</h3>
          <div className="metric-value">{dashboardData.customerSatisfaction || 0}/5</div>
          <div className="rating-stars">
            {'★'.repeat(Math.floor(dashboardData.customerSatisfaction || 0))}
            {'☆'.repeat(5 - Math.floor(dashboardData.customerSatisfaction || 0))}
          </div>
        </div>

        <div className="metric-card wide">
          <h3>Cost Analysis</h3>
          <div className="cost-breakdown">
            <div className="cost-item">
              <span>Food Costs:</span>
              <span>${dashboardData.costAnalysis?.food || 0}</span>
            </div>
            <div className="cost-item">
              <span>Labor Costs:</span>
              <span>${dashboardData.costAnalysis?.labor || 0}</span>
            </div>
            <div className="cost-item">
              <span>Overhead:</span>
              <span>${dashboardData.costAnalysis?.overhead || 0}</span>
            </div>
            <div className="cost-item total">
              <span>Total:</span>
              <span>${dashboardData.costAnalysis?.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="metric-card wide">
          <h3>Trend Analysis</h3>
          <div className="trends">
            {dashboardData.trendAnalysis?.map((trend: any, index: number) => (
              <div key={index} className="trend-item">
                <span className="trend-metric">{trend.metric}</span>
                <span className={`trend-change ${trend.direction}`}>
                  {trend.direction === 'up' ? '📈' : '📉'} {trend.change}%
                </span>
              </div>
            )) || <p>No trend data available</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLineCookDashboard = () => (
    <div className="line-cook-dashboard">
      <div className="dashboard-grid">
        <div className="metric-card primary">
          <h3>Assigned Orders</h3>
          <div className="metric-value">{dashboardData.assignedOrders?.length || 0}</div>
          <div className="metric-trend">
            {dashboardData.assignedOrders?.length > 5 ? '⚠️ High Load' : '✅ Normal Load'}
          </div>
        </div>

        <div className="metric-card">
          <h3>Completion Rate</h3>
          <div className="metric-value">{dashboardData.completionRate || 0}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${dashboardData.completionRate || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <h3>Average Time</h3>
          <div className="metric-value">{dashboardData.averageTime || 0}min</div>
          <div className="time-target">
            Target: {dashboardData.targetTime || 0}min
          </div>
        </div>

        <div className="metric-card wide">
          <h3>Next Tasks</h3>
          <div className="next-tasks">
            {dashboardData.nextTasks?.slice(0, 3).map((task: any, index: number) => (
              <div key={index} className="task-preview">
                <div className="task-info">
                  <span className="task-name">{task.name}</span>
                  <span className="task-time">⏱️ {task.estimatedTime}min</span>
                </div>
                <span className={`task-priority ${task.priority}`}>
                  {task.priority}
                </span>
              </div>
            )) || <p>No upcoming tasks</p>}
          </div>
        </div>

        <div className="metric-card wide">
          <h3>Quick Access Items</h3>
          <div className="quick-access-grid">
            {dashboardData.quickAccess?.map((item: any, index: number) => (
              <div key={index} className="quick-access-item">
                <span className="item-icon">{item.icon}</span>
                <span className="item-name">{item.name}</span>
              </div>
            )) || <p>No quick access items</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrepCookDashboard = () => (
    <div className="prep-cook-dashboard">
      <div className="dashboard-grid">
        <div className="metric-card primary">
          <h3>Today's Prep List</h3>
          <div className="metric-value">
            {dashboardData.todaysPrepList?.items?.length || 0} items
          </div>
          <div className="metric-trend">
            {dashboardData.todaysPrepList?.completionRate || 0}% complete
          </div>
        </div>

        <div className="metric-card">
          <h3>Assigned Tasks</h3>
          <div className="metric-value">{dashboardData.assignedTasks?.length || 0}</div>
          <div className="task-breakdown">
            <small>High Priority: {dashboardData.highPriorityTasks || 0}</small>
            <small>Normal Priority: {dashboardData.normalPriorityTasks || 0}</small>
          </div>
        </div>

        <div className="metric-card">
          <h3>Completion Status</h3>
          <div className="metric-value">{dashboardData.completionStatus?.percentage || 0}%</div>
          <div className="completion-details">
            <small>Completed: {dashboardData.completionStatus?.completed || 0}</small>
            <small>Remaining: {dashboardData.completionStatus?.remaining || 0}</small>
          </div>
        </div>

        <div className="metric-card wide">
          <h3>Upcoming Deadlines</h3>
          <div className="deadlines-list">
            {dashboardData.upcomingDeadlines?.map((deadline: any, index: number) => (
              <div key={index} className="deadline-item">
                <span className="deadline-task">{deadline.task}</span>
                <span className="deadline-time">⏰ {deadline.timeRemaining}</span>
              </div>
            )) || <p>No upcoming deadlines</p>}
          </div>
        </div>

        <div className="metric-card wide">
          <h3>Inventory Needs</h3>
          <div className="inventory-needs">
            {dashboardData.inventoryNeeds?.map((need: any, index: number) => (
              <div key={index} className="inventory-item">
                <span className="item-name">{need.ingredient}</span>
                <span className="item-quantity">{need.quantity} {need.unit}</span>
                <span className={`item-urgency ${need.urgency}`}>
                  {need.urgency === 'urgent' ? '🚨' : 
                   need.urgency === 'soon' ? '⚠️' : 'ℹ️'}
                </span>
              </div>
            )) || <p>All inventory sufficient</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (role) {
      case 'head_chef':
        return renderChefDashboard();
      case 'manager':
        return renderManagerDashboard();
      case 'line_cook':
        return renderLineCookDashboard();
      case 'prep_cook':
        return renderPrepCookDashboard();
      default:
        return renderManagerDashboard();
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="role-based-dashboard">
      <div className="dashboard-header">
        <h1>{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Dashboard</h1>
        <div className="dashboard-controls">
          <button 
            onClick={loadDashboardData}
            className="refresh-btn"
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {renderDashboard()}

      <style dangerouslySetInnerHTML={{
        __html: `
        .role-based-dashboard {
          padding: 20px;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dashboard-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .refresh-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .last-updated {
          font-size: 14px;
          color: #6c757d;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .metric-card.primary {
          border-left: 4px solid #007bff;
        }

        .metric-card.wide {
          grid-column: span 2;
        }

        .metric-card h3 {
          margin: 0 0 15px 0;
          color: #495057;
          font-size: 16px;
          font-weight: 600;
        }

        .metric-value {
          font-size: 2.5em;
          font-weight: bold;
          color: #212529;
          margin-bottom: 10px;
        }

        .metric-trend {
          font-size: 14px;
          color: #6c757d;
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

        .progress-fill.profit {
          background: #ffc107;
        }

        .prep-status, .cost-breakdown, .efficiency-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-item, .cost-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .cost-item.total {
          border-top: 2px solid #dee2e6;
          font-weight: bold;
          margin-top: 10px;
        }

        .team-performance, .next-tasks, .deadlines-list, .inventory-needs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .team-member, .task-preview, .deadline-item, .inventory-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .member-info {
          display: flex;
          flex-direction: column;
        }

        .member-name {
          font-weight: 600;
        }

        .member-role {
          font-size: 12px;
          color: #6c757d;
        }

        .member-metrics {
          display: flex;
          gap: 10px;
          font-size: 12px;
        }

        .task-priority, .item-urgency {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .task-priority.high, .item-urgency.urgent {
          background: #dc3545;
          color: white;
        }

        .task-priority.normal, .item-urgency.soon {
          background: #ffc107;
          color: #212529;
        }

        .task-priority.low {
          background: #28a745;
          color: white;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 6px;
        }

        .alert-item.critical {
          background: #f8d7da;
          color: #721c24;
        }

        .alert-item.warning {
          background: #fff3cd;
          color: #856404;
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }

        .quick-access-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .quick-access-item:hover {
          background: #e9ecef;
        }

        .item-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .item-name {
          font-size: 12px;
          text-align: center;
        }

        .rating-stars {
          color: #ffc107;
          font-size: 18px;
        }

        .trends {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .trend-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .trend-change.up {
          color: #28a745;
        }

        .trend-change.down {
          color: #dc3545;
        }

        .no-alerts {
          text-align: center;
          color: #28a745;
          font-weight: 500;
        }

        .dashboard-loading {
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
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .metric-card.wide {
            grid-column: span 1;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }
        `
      }} />
    </div>
  );
};

export default RoleBasedDashboard;