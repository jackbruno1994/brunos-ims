import React, { useState, useEffect } from 'react';
import './Audit.css';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  restaurantId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_change' | 'system' | 'user_action';
}

interface AuditFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string[];
  category?: string[];
  restaurantId?: string;
  search?: string;
}

interface AuditStats {
  totalLogs: number;
  criticalAlerts: number;
  highSeverity: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ user: string; count: number }>;
  severityBreakdown: Array<{ severity: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  timelineData: Array<{ time: string; count: number }>;
}

const Audit: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStats();
  }, [currentPage, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== undefined && value !== '' && 
            !(Array.isArray(value) && value.length === 0)
          )
        )
      });

      const response = await fetch(`/api/audit/logs?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setAuditLogs(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const response = await fetch('/api/audit/stats?period=7d');
      if (!response.ok) {
        throw new Error('Failed to fetch audit statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleFilterChange = (key: keyof AuditFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch('/api/audit/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          filters,
          includeDetails: true
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="audit-container">
        <div className="loading">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="audit-container">
      <div className="audit-header">
        <h2 className="page-title">Audit System</h2>
        <div className="audit-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="export-group">
            <button
              className="btn btn-primary"
              onClick={() => exportData('json')}
            >
              Export JSON
            </button>
            <button
              className="btn btn-primary"
              onClick={() => exportData('csv')}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="audit-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Logs (7d)</h4>
              <p className="stat-number">{stats.totalLogs}</p>
            </div>
            <div className="stat-card critical">
              <h4>Critical Alerts</h4>
              <p className="stat-number">{stats.criticalAlerts}</p>
            </div>
            <div className="stat-card high">
              <h4>High Severity</h4>
              <p className="stat-number">{stats.highSeverity}</p>
            </div>
          </div>

          <div className="stats-charts">
            <div className="chart-container">
              <h4>Top Actions</h4>
              <div className="chart-list">
                {stats.topActions.map((item, index) => (
                  <div key={index} className="chart-item">
                    <span>{item.action}</span>
                    <span className="count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-container">
              <h4>Severity Breakdown</h4>
              <div className="chart-list">
                {stats.severityBreakdown.map((item, index) => (
                  <div key={index} className="chart-item">
                    <span style={{ color: getSeverityColor(item.severity) }}>
                      {item.severity}
                    </span>
                    <span className="count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="audit-filters">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="datetime-local"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="datetime-local"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Action:</label>
              <input
                type="text"
                placeholder="Filter by action..."
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Resource:</label>
              <input
                type="text"
                placeholder="Filter by resource..."
                value={filters.resource || ''}
                onChange={(e) => handleFilterChange('resource', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="audit-logs">
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td title={formatTimestamp(log.timestamp)}>
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td>{log.userName}</td>
                  <td>{log.action}</td>
                  <td>{log.resource}</td>
                  <td>
                    <span 
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(log.severity) }}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td>{log.category}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setSelectedLog(log)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="btn btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Audit Log Details</h3>
              <button
                className="btn btn-sm"
                onClick={() => setSelectedLog(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><strong>ID:</strong> {selectedLog.id}</div>
                <div><strong>Timestamp:</strong> {formatTimestamp(selectedLog.timestamp)}</div>
                <div><strong>User:</strong> {selectedLog.userName} ({selectedLog.userId})</div>
                <div><strong>Action:</strong> {selectedLog.action}</div>
                <div><strong>Resource:</strong> {selectedLog.resource}</div>
                <div><strong>Resource ID:</strong> {selectedLog.resourceId}</div>
                <div><strong>Severity:</strong> 
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(selectedLog.severity) }}
                  >
                    {selectedLog.severity}
                  </span>
                </div>
                <div><strong>Category:</strong> {selectedLog.category}</div>
                {selectedLog.ipAddress && (
                  <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
                )}
                {selectedLog.restaurantId && (
                  <div><strong>Restaurant ID:</strong> {selectedLog.restaurantId}</div>
                )}
                <div className="detail-full-width">
                  <strong>Details:</strong>
                  <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;