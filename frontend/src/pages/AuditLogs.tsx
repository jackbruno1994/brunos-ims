import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
}

const AuditLogs: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resource: '',
    severity: '',
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.audit.getLogs(filters);
      setAuditLogs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Audit logs error:', err);
    } finally {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'failure': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : prev.page
    }));
  };

  const exportLogs = async () => {
    try {
      // In a real implementation, this would trigger a CSV/Excel export
      const csvContent = [
        ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'Severity', 'IP Address'].join(','),
        ...auditLogs.map(log => [
          log.timestamp,
          log.userName,
          log.action,
          log.resource,
          log.status,
          log.severity,
          log.ipAddress || 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Audit Logs</h2>
        <p className="page-subtitle">Comprehensive audit trail of all system activities</p>
        <button className="export-button" onClick={exportLogs}>
          📥 Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="ACCESS">Access</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Resource</label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
            >
              <option value="">All Resources</option>
              <option value="user">User</option>
              <option value="restaurant">Restaurant</option>
              <option value="menu">Menu</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-range">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
              <span>to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>Audit Logs ({auditLogs.length} records)</h3>
          <div className="table-controls">
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Status</th>
                <th>Severity</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td>{formatTimestamp(log.timestamp)}</td>
                  <td>
                    <div className="user-info">
                      <strong>{log.userName}</strong>
                      <small>{log.userId}</small>
                    </div>
                  </td>
                  <td>
                    <span className="action-badge">{log.action}</span>
                  </td>
                  <td>
                    <div className="resource-info">
                      <strong>{log.resource}</strong>
                      <small>{log.resourceId}</small>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(log.status) }}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="severity-badge" 
                      style={{ backgroundColor: getSeverityColor(log.severity) }}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td>{log.ipAddress || 'N/A'}</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => viewLogDetails(log)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {auditLogs.length === 0 && !loading && (
          <div className="empty-state">
            <p>No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Audit Log Details</h3>
              <button className="modal-close" onClick={() => setSelectedLog(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{selectedLog.id}</span>
                </div>
                <div className="detail-item">
                  <label>Timestamp:</label>
                  <span>{formatTimestamp(selectedLog.timestamp)}</span>
                </div>
                <div className="detail-item">
                  <label>User:</label>
                  <span>{selectedLog.userName} ({selectedLog.userId})</span>
                </div>
                <div className="detail-item">
                  <label>Action:</label>
                  <span>{selectedLog.action}</span>
                </div>
                <div className="detail-item">
                  <label>Resource:</label>
                  <span>{selectedLog.resource} ({selectedLog.resourceId})</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(selectedLog.status) }}
                  >
                    {selectedLog.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Severity:</label>
                  <span 
                    className="severity-badge" 
                    style={{ backgroundColor: getSeverityColor(selectedLog.severity) }}
                  >
                    {selectedLog.severity}
                  </span>
                </div>
                <div className="detail-item">
                  <label>IP Address:</label>
                  <span>{selectedLog.ipAddress || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>User Agent:</label>
                  <span className="user-agent">{selectedLog.userAgent || 'N/A'}</span>
                </div>
              </div>

              {selectedLog.changes && (
                <div className="changes-section">
                  <h4>Changes Made:</h4>
                  <pre className="changes-json">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && (
                <div className="metadata-section">
                  <h4>Metadata:</h4>
                  <pre className="metadata-json">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;