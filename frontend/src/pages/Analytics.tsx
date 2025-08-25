import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface AnalyticsData {
  id: string;
  type: 'anomaly_detection' | 'predictive' | 'pattern_recognition' | 'performance';
  title: string;
  description: string;
  generatedAt: string;
  data: Record<string, any>;
  insights: string[];
  alerts: AnalyticsAlert[];
  confidence: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

interface AnalyticsAlert {
  id: string;
  type: 'anomaly' | 'threshold' | 'prediction' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  metadata?: Record<string, any>;
}

interface PredictiveData {
  riskAssessment: {
    currentRiskLevel: string;
    predictedRiskLevel: string;
    confidence: number;
    factors: string[];
    recommendations: string[];
  };
  userBehavior: {
    anomalousUsers: number;
    predictedBreach: { probability: number; timeframe: string };
    trendAnalysis: string;
  };
  systemPerformance: {
    predictedLoad: { cpu: number; memory: number; disk: number };
    bottlenecks: string[];
    recommendations: string[];
  };
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'anomaly' | 'predictive' | 'patterns'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
    fetchPredictiveData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await apiService.audit.getAnalytics();
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    }
  };

  const fetchPredictiveData = async () => {
    try {
      const response = await apiService.audit.getPredictiveAnalytics();
      setPredictiveData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load predictive analytics');
      console.error('Predictive analytics error:', err);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.6) return '#ffc107';
    return '#fd7e14';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">🤖 AI-Powered Analytics</h2>
        <p className="page-subtitle">Advanced analytics, anomaly detection, and predictive insights</p>
      </div>

      {/* Analytics Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'anomaly' ? 'active' : ''}`}
            onClick={() => setActiveTab('anomaly')}
          >
            🔍 Anomaly Detection
          </button>
          <button 
            className={`tab ${activeTab === 'predictive' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictive')}
          >
            🔮 Predictive Analytics
          </button>
          <button 
            className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            🧩 Pattern Recognition
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analyticsData && (
        <div className="tab-content">
          <div className="analytics-overview">
            <div className="analytics-header">
              <h3>{analyticsData.title}</h3>
              <div className="analytics-meta">
                <span className="confidence-badge" style={{ backgroundColor: getConfidenceColor(analyticsData.confidence) }}>
                  {Math.round(analyticsData.confidence * 100)}% Confidence
                </span>
                <span className="timestamp">
                  Generated: {formatTimestamp(analyticsData.generatedAt)}
                </span>
              </div>
            </div>

            <p className="analytics-description">{analyticsData.description}</p>

            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <h4>Login Analysis</h4>
                <div className="metric-details">
                  <div className="metric-item">
                    <label>Total Attempts:</label>
                    <span>{analyticsData.data.loginAttempts?.toLocaleString()}</span>
                  </div>
                  <div className="metric-item">
                    <label>Failed Logins:</label>
                    <span className="failed">{analyticsData.data.failedLogins}</span>
                  </div>
                  <div className="metric-item">
                    <label>Success Rate:</label>
                    <span>{Math.round(((analyticsData.data.loginAttempts - analyticsData.data.failedLogins) / analyticsData.data.loginAttempts) * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <h4>Data Access Patterns</h4>
                <div className="metric-details">
                  <div className="metric-item">
                    <label>Normal Patterns:</label>
                    <span className="normal">{analyticsData.data.dataAccessPatterns?.normal}</span>
                  </div>
                  <div className="metric-item">
                    <label>Unusual Patterns:</label>
                    <span className="unusual">{analyticsData.data.dataAccessPatterns?.unusual}</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <h4>System Performance</h4>
                <div className="metric-details">
                  <div className="metric-item">
                    <label>Avg Response Time:</label>
                    <span>{analyticsData.data.performanceMetrics?.avgResponseTime}ms</span>
                  </div>
                  <div className="metric-item">
                    <label>Error Rate:</label>
                    <span className={analyticsData.data.performanceMetrics?.errorRate > 0.05 ? 'high' : 'normal'}>
                      {(analyticsData.data.performanceMetrics?.errorRate * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="insights-section">
              <h4>🧠 AI Insights</h4>
              <div className="insights-list">
                {analyticsData.insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <span className="insight-icon">💡</span>
                    <span className="insight-text">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Alerts */}
            <div className="alerts-section">
              <h4>🚨 Active Alerts</h4>
              <div className="alerts-list">
                {analyticsData.alerts.map((alert) => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-header">
                      <span 
                        className="alert-severity" 
                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                      >
                        {alert.severity}
                      </span>
                      <span className="alert-type">{alert.type}</span>
                      <span className="alert-status">{alert.status}</span>
                    </div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      <span>Triggered: {formatTimestamp(alert.triggeredAt)}</span>
                      {alert.metadata?.riskScore && (
                        <span>Risk Score: {alert.metadata.riskScore}/100</span>
                      )}
                      {alert.metadata?.confidence && (
                        <span>Confidence: {Math.round(alert.metadata.confidence * 100)}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Detection Tab */}
      {activeTab === 'anomaly' && (
        <div className="tab-content">
          <div className="anomaly-detection">
            <h3>🔍 Anomaly Detection</h3>
            <p>AI-powered detection of unusual patterns and behaviors in your system.</p>
            
            <div className="anomaly-categories">
              <div className="anomaly-category">
                <h4>User Behavior Anomalies</h4>
                <div className="anomaly-list">
                  <div className="anomaly-item high">
                    <div className="anomaly-icon">👤</div>
                    <div className="anomaly-content">
                      <div className="anomaly-title">Unusual Login Times</div>
                      <div className="anomaly-description">
                        3 users accessing system during non-business hours (2-6 AM)
                      </div>
                      <div className="anomaly-score">Risk Score: 85/100</div>
                    </div>
                  </div>

                  <div className="anomaly-item medium">
                    <div className="anomaly-icon">📊</div>
                    <div className="anomaly-content">
                      <div className="anomaly-title">Excessive Data Access</div>
                      <div className="anomaly-description">
                        User 'admin_user' accessed 300% more records than usual
                      </div>
                      <div className="anomaly-score">Risk Score: 72/100</div>
                    </div>
                  </div>

                  <div className="anomaly-item low">
                    <div className="anomaly-icon">🌍</div>
                    <div className="anomaly-content">
                      <div className="anomaly-title">Geographic Anomaly</div>
                      <div className="anomaly-description">
                        Login from new geographic region (IP: 203.45.67.89)
                      </div>
                      <div className="anomaly-score">Risk Score: 45/100</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="anomaly-category">
                <h4>System Performance Anomalies</h4>
                <div className="anomaly-list">
                  <div className="anomaly-item medium">
                    <div className="anomaly-icon">⚡</div>
                    <div className="anomaly-content">
                      <div className="anomaly-title">Response Time Spike</div>
                      <div className="anomaly-description">
                        API response times increased by 200% during peak hours
                      </div>
                      <div className="anomaly-score">Performance Impact: High</div>
                    </div>
                  </div>

                  <div className="anomaly-item low">
                    <div className="anomaly-icon">💾</div>
                    <div className="anomaly-content">
                      <div className="anomaly-title">Memory Usage Pattern</div>
                      <div className="anomaly-description">
                        Unusual memory consumption pattern detected in audit service
                      </div>
                      <div className="anomaly-score">Performance Impact: Low</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="anomaly-settings">
              <h4>⚙️ Detection Settings</h4>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Sensitivity Level</label>
                  <select defaultValue="high">
                    <option value="low">Low - Only critical anomalies</option>
                    <option value="medium">Medium - Balanced detection</option>
                    <option value="high">High - Sensitive detection</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Detection Frequency</label>
                  <select defaultValue="realtime">
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Alert Threshold</label>
                  <input type="range" min="1" max="100" defaultValue="70" />
                  <span>70/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictive Analytics Tab */}
      {activeTab === 'predictive' && predictiveData && (
        <div className="tab-content">
          <div className="predictive-analytics">
            <h3>🔮 Predictive Analytics</h3>
            <p>AI-powered predictions and forecasting for proactive security management.</p>

            <div className="prediction-sections">
              {/* Risk Assessment */}
              <div className="prediction-section">
                <h4>🎯 Risk Assessment</h4>
                <div className="risk-prediction">
                  <div className="risk-current">
                    <label>Current Risk Level:</label>
                    <span 
                      className="risk-level" 
                      style={{ color: getRiskColor(predictiveData.riskAssessment.currentRiskLevel) }}
                    >
                      {predictiveData.riskAssessment.currentRiskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="risk-arrow">→</div>
                  <div className="risk-predicted">
                    <label>Predicted Risk Level:</label>
                    <span 
                      className="risk-level" 
                      style={{ color: getRiskColor(predictiveData.riskAssessment.predictedRiskLevel) }}
                    >
                      {predictiveData.riskAssessment.predictedRiskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="risk-confidence">
                    <label>Confidence:</label>
                    <span>{Math.round(predictiveData.riskAssessment.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="risk-factors">
                  <h5>Contributing Factors:</h5>
                  <ul>
                    {predictiveData.riskAssessment.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>

                <div className="risk-recommendations">
                  <h5>Recommendations:</h5>
                  <ul>
                    {predictiveData.riskAssessment.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* User Behavior Predictions */}
              <div className="prediction-section">
                <h4>👥 User Behavior Predictions</h4>
                <div className="behavior-metrics">
                  <div className="behavior-metric">
                    <label>Anomalous Users Detected:</label>
                    <span className="metric-value">{predictiveData.userBehavior.anomalousUsers}</span>
                  </div>
                  <div className="behavior-metric">
                    <label>Breach Probability:</label>
                    <span className="metric-value">
                      {Math.round(predictiveData.userBehavior.predictedBreach.probability * 100)}%
                    </span>
                    <span className="metric-timeframe">
                      within {predictiveData.userBehavior.predictedBreach.timeframe}
                    </span>
                  </div>
                </div>
                <div className="trend-analysis">
                  <h5>Trend Analysis:</h5>
                  <p>{predictiveData.userBehavior.trendAnalysis}</p>
                </div>
              </div>

              {/* System Performance Predictions */}
              <div className="prediction-section">
                <h4>⚡ System Performance Predictions</h4>
                <div className="performance-predictions">
                  <div className="performance-metric">
                    <label>Predicted CPU Load:</label>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${predictiveData.systemPerformance.predictedLoad.cpu}%` }}
                      ></div>
                      <span>{predictiveData.systemPerformance.predictedLoad.cpu}%</span>
                    </div>
                  </div>
                  <div className="performance-metric">
                    <label>Predicted Memory Usage:</label>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${predictiveData.systemPerformance.predictedLoad.memory}%` }}
                      ></div>
                      <span>{predictiveData.systemPerformance.predictedLoad.memory}%</span>
                    </div>
                  </div>
                  <div className="performance-metric">
                    <label>Predicted Disk Usage:</label>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${predictiveData.systemPerformance.predictedLoad.disk}%` }}
                      ></div>
                      <span>{predictiveData.systemPerformance.predictedLoad.disk}%</span>
                    </div>
                  </div>
                </div>

                <div className="bottlenecks">
                  <h5>Predicted Bottlenecks:</h5>
                  <ul>
                    {predictiveData.systemPerformance.bottlenecks.map((bottleneck, index) => (
                      <li key={index}>{bottleneck}</li>
                    ))}
                  </ul>
                </div>

                <div className="performance-recommendations">
                  <h5>Performance Recommendations:</h5>
                  <ul>
                    {predictiveData.systemPerformance.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pattern Recognition Tab */}
      {activeTab === 'patterns' && (
        <div className="tab-content">
          <div className="pattern-recognition">
            <h3>🧩 Pattern Recognition</h3>
            <p>Advanced pattern analysis and correlation detection across system events.</p>

            <div className="pattern-categories">
              <div className="pattern-category">
                <h4>Security Patterns</h4>
                <div className="pattern-list">
                  <div className="pattern-item">
                    <div className="pattern-header">
                      <span className="pattern-title">Coordinated Attack Pattern</span>
                      <span className="pattern-confidence">95% Confidence</span>
                    </div>
                    <div className="pattern-description">
                      Multiple failed login attempts from different IPs in same geographic region, 
                      followed by successful logins to administrative accounts.
                    </div>
                    <div className="pattern-timeline">
                      <span>Pattern detected: 2024-08-24 14:30 - 15:45</span>
                      <span>Frequency: 3 times in past week</span>
                    </div>
                  </div>

                  <div className="pattern-item">
                    <div className="pattern-header">
                      <span className="pattern-title">Data Exfiltration Pattern</span>
                      <span className="pattern-confidence">78% Confidence</span>
                    </div>
                    <div className="pattern-description">
                      Large data downloads during off-hours, preceded by privilege escalation attempts.
                    </div>
                    <div className="pattern-timeline">
                      <span>Pattern detected: 2024-08-23 02:15 - 04:30</span>
                      <span>Frequency: 1 time detected</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pattern-category">
                <h4>Usage Patterns</h4>
                <div className="pattern-list">
                  <div className="pattern-item">
                    <div className="pattern-header">
                      <span className="pattern-title">Peak Usage Correlation</span>
                      <span className="pattern-confidence">92% Confidence</span>
                    </div>
                    <div className="pattern-description">
                      System usage peaks correlate with business hours and specific geographic regions.
                      Performance degradation occurs at 85% capacity threshold.
                    </div>
                    <div className="pattern-timeline">
                      <span>Pattern type: Recurring daily</span>
                      <span>Strength: Strong correlation (r=0.92)</span>
                    </div>
                  </div>

                  <div className="pattern-item">
                    <div className="pattern-header">
                      <span className="pattern-title">Weekend Access Anomaly</span>
                      <span className="pattern-confidence">67% Confidence</span>
                    </div>
                    <div className="pattern-description">
                      Increased administrative activity during weekends, outside normal business operations.
                    </div>
                    <div className="pattern-timeline">
                      <span>Pattern type: Weekly anomaly</span>
                      <span>Frequency: 3 out of 4 weekends</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pattern-category">
                <h4>System Health Patterns</h4>
                <div className="pattern-list">
                  <div className="pattern-item">
                    <div className="pattern-header">
                      <span className="pattern-title">Memory Leak Indicator</span>
                      <span className="pattern-confidence">88% Confidence</span>
                    </div>
                    <div className="pattern-description">
                      Memory usage gradually increases over 48-hour periods, suggesting potential memory leaks 
                      in specific services.
                    </div>
                    <div className="pattern-timeline">
                      <span>Pattern type: Gradual degradation</span>
                      <span>Cycle: Every 48-72 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="correlation-matrix">
              <h4>🔗 Event Correlation Matrix</h4>
              <div className="correlation-grid">
                <div className="correlation-item">
                  <div className="correlation-events">Failed Login → Privilege Escalation</div>
                  <div className="correlation-strength strong">Strong (0.85)</div>
                </div>
                <div className="correlation-item">
                  <div className="correlation-events">System Error → Performance Degradation</div>
                  <div className="correlation-strength moderate">Moderate (0.72)</div>
                </div>
                <div className="correlation-item">
                  <div className="correlation-events">Off-hours Access → Data Download</div>
                  <div className="correlation-strength weak">Weak (0.45)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;