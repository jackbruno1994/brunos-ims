import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface DashboardData {
  overview: {
    totalAuditLogs: number;
    activeSecurityEvents: number;
    openInvestigations: number;
    complianceScore: number;
    riskLevel: string;
  };
  recentActivity: {
    criticalEvents: number;
    newInvestigations: number;
    resolvedIncidents: number;
    generatedReports: number;
  };
  trends: {
    logVolumeChange: string;
    securityEventsChange: string;
    complianceChange: string;
    performanceChange: string;
  };
  quickActions: Array<{
    action: string;
    url: string;
  }>;
}

const AuditDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiService.audit.getDashboard();
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#ffc107';
    if (score >= 50) return '#fd7e14';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading audit dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h3>No Data Available</h3>
          <p>Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Audit & Security Dashboard</h2>
        <p className="page-subtitle">Comprehensive overview of system security, compliance, and audit activities</p>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>System Overview</h3>
          <div className="cards-grid">
            <div className="metric-card">
              <div className="metric-header">
                <h4>Total Audit Logs</h4>
                <span className="metric-icon">📋</span>
              </div>
              <div className="metric-value">{dashboardData.overview.totalAuditLogs.toLocaleString()}</div>
              <div className="metric-change positive">{dashboardData.trends.logVolumeChange}</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h4>Active Security Events</h4>
                <span className="metric-icon">🚨</span>
              </div>
              <div className="metric-value">{dashboardData.overview.activeSecurityEvents}</div>
              <div className="metric-change negative">{dashboardData.trends.securityEventsChange}</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h4>Open Investigations</h4>
                <span className="metric-icon">🔍</span>
              </div>
              <div className="metric-value">{dashboardData.overview.openInvestigations}</div>
              <div className="metric-subtitle">Active cases</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h4>Compliance Score</h4>
                <span className="metric-icon">✅</span>
              </div>
              <div 
                className="metric-value" 
                style={{ color: getComplianceColor(dashboardData.overview.complianceScore) }}
              >
                {dashboardData.overview.complianceScore}%
              </div>
              <div className="metric-change positive">{dashboardData.trends.complianceChange}</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h4>Risk Level</h4>
                <span className="metric-icon">⚠️</span>
              </div>
              <div 
                className="metric-value" 
                style={{ color: getRiskLevelColor(dashboardData.overview.riskLevel) }}
              >
                {dashboardData.overview.riskLevel.toUpperCase()}
              </div>
              <div className="metric-subtitle">Current assessment</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h3>Recent Activity</h3>
          <div className="activity-grid">
            <div className="activity-item">
              <div className="activity-icon critical">🔥</div>
              <div className="activity-content">
                <div className="activity-title">Critical Events</div>
                <div className="activity-value">{dashboardData.recentActivity.criticalEvents}</div>
                <div className="activity-subtitle">Require immediate attention</div>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon new">🆕</div>
              <div className="activity-content">
                <div className="activity-title">New Investigations</div>
                <div className="activity-value">{dashboardData.recentActivity.newInvestigations}</div>
                <div className="activity-subtitle">Started today</div>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon resolved">✅</div>
              <div className="activity-content">
                <div className="activity-title">Resolved Incidents</div>
                <div className="activity-value">{dashboardData.recentActivity.resolvedIncidents}</div>
                <div className="activity-subtitle">Closed today</div>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon reports">📊</div>
              <div className="activity-content">
                <div className="activity-title">Generated Reports</div>
                <div className="activity-value">{dashboardData.recentActivity.generatedReports}</div>
                <div className="activity-subtitle">This week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            {dashboardData.quickActions.map((action, index) => (
              <button key={index} className="action-button">
                <span className="action-text">{action.action}</span>
                <span className="action-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="dashboard-section">
          <h3>Performance Trends</h3>
          <div className="trends-grid">
            <div className="trend-item">
              <div className="trend-label">Log Volume</div>
              <div className="trend-value positive">{dashboardData.trends.logVolumeChange}</div>
            </div>
            <div className="trend-item">
              <div className="trend-label">Security Events</div>
              <div className="trend-value negative">{dashboardData.trends.securityEventsChange}</div>
            </div>
            <div className="trend-item">
              <div className="trend-label">Compliance</div>
              <div className="trend-value positive">{dashboardData.trends.complianceChange}</div>
            </div>
            <div className="trend-item">
              <div className="trend-label">Performance</div>
              <div className="trend-value positive">{dashboardData.trends.performanceChange}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="insights-section">
        <h3>🤖 AI-Powered Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">🔍</span>
              <h4>Anomaly Detection</h4>
            </div>
            <p>AI has detected 3 unusual patterns in user access behavior during off-hours. Consider reviewing access policies.</p>
            <button className="insight-action">View Details</button>
          </div>

          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">📈</span>
              <h4>Predictive Analysis</h4>
            </div>
            <p>System load is predicted to increase by 25% next week. Consider scaling resources to maintain performance.</p>
            <button className="insight-action">View Predictions</button>
          </div>

          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">🛡️</span>
              <h4>Security Recommendation</h4>
            </div>
            <p>Enable multi-factor authentication for users accessing sensitive data to improve security posture.</p>
            <button className="insight-action">Implement</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;