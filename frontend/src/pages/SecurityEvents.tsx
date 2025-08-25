import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'system_change' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceAffected?: string;
  detectionMethod: 'automated' | 'manual' | 'ai_powered';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  timestamp: string;
  resolvedAt?: string;
  additionalData?: Record<string, any>;
}

const SecurityEvents: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    type: '',
    page: 1,
    limit: 20
  });
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [newEventForm, setNewEventForm] = useState({
    type: 'authentication',
    severity: 'medium',
    description: '',
    resourceAffected: '',
    detectionMethod: 'manual'
  });
  const [showNewEventForm, setShowNewEventForm] = useState(false);

  useEffect(() => {
    fetchSecurityEvents();
  }, [filters]);

  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.audit.getSecurityEvents(filters);
      setSecurityEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load security events');
      console.error('Security events error:', err);
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
      case 'open': return '#dc3545';
      case 'investigating': return '#ffc107';
      case 'resolved': return '#28a745';
      case 'false_positive': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication': return '🔐';
      case 'authorization': return '🛡️';
      case 'data_access': return '📊';
      case 'system_change': return '⚙️';
      case 'policy_violation': return '⚠️';
      default: return '🔍';
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

  const createSecurityEvent = async () => {
    try {
      const eventData = {
        ...newEventForm,
        userId: 'current_user', // In real app, get from auth context
        ipAddress: '192.168.1.1', // In real app, get from request
        status: 'open'
      };

      await apiService.audit.createSecurityEvent(eventData);
      setShowNewEventForm(false);
      setNewEventForm({
        type: 'authentication',
        severity: 'medium',
        description: '',
        resourceAffected: '',
        detectionMethod: 'manual'
      });
      fetchSecurityEvents();
    } catch (err) {
      console.error('Create event error:', err);
      setError('Failed to create security event');
    }
  };

  const viewEventDetails = (event: SecurityEvent) => {
    setSelectedEvent(event);
  };

  const updateEventStatus = async (eventId: string, newStatus: string) => {
    try {
      // In a real implementation, this would update the event status
      console.log(`Updating event ${eventId} to status ${newStatus}`);
      // Refresh the list
      fetchSecurityEvents();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading security events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Security Events</h2>
        <p className="page-subtitle">Monitor and manage security incidents and threats</p>
        <button 
          className="create-button"
          onClick={() => setShowNewEventForm(true)}
        >
          ➕ Report Security Event
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card critical">
          <div className="summary-icon">🚨</div>
          <div className="summary-content">
            <div className="summary-value">
              {securityEvents.filter(e => e.severity === 'critical').length}
            </div>
            <div className="summary-label">Critical Events</div>
          </div>
        </div>

        <div className="summary-card high">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <div className="summary-value">
              {securityEvents.filter(e => e.severity === 'high').length}
            </div>
            <div className="summary-label">High Severity</div>
          </div>
        </div>

        <div className="summary-card open">
          <div className="summary-icon">🔓</div>
          <div className="summary-content">
            <div className="summary-value">
              {securityEvents.filter(e => e.status === 'open').length}
            </div>
            <div className="summary-label">Open Events</div>
          </div>
        </div>

        <div className="summary-card investigating">
          <div className="summary-icon">🔍</div>
          <div className="summary-content">
            <div className="summary-value">
              {securityEvents.filter(e => e.status === 'investigating').length}
            </div>
            <div className="summary-label">Under Investigation</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Event Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="authentication">Authentication</option>
              <option value="authorization">Authorization</option>
              <option value="data_access">Data Access</option>
              <option value="system_change">System Change</option>
              <option value="policy_violation">Policy Violation</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Security Events List */}
      <div className="events-section">
        <h3>Security Events ({securityEvents.length} total)</h3>
        <div className="events-list">
          {securityEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div className="event-type">
                  <span className="type-icon">{getTypeIcon(event.type)}</span>
                  <span className="type-name">{event.type.replace('_', ' ')}</span>
                </div>
                <div className="event-meta">
                  <span 
                    className="severity-badge" 
                    style={{ backgroundColor: getSeverityColor(event.severity) }}
                  >
                    {event.severity}
                  </span>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(event.status) }}
                  >
                    {event.status}
                  </span>
                </div>
              </div>

              <div className="event-content">
                <div className="event-description">
                  {event.description}
                </div>
                <div className="event-details">
                  <div className="detail-item">
                    <strong>Time:</strong> {formatTimestamp(event.timestamp)}
                  </div>
                  {event.ipAddress && (
                    <div className="detail-item">
                      <strong>IP:</strong> {event.ipAddress}
                    </div>
                  )}
                  {event.resourceAffected && (
                    <div className="detail-item">
                      <strong>Resource:</strong> {event.resourceAffected}
                    </div>
                  )}
                  <div className="detail-item">
                    <strong>Detection:</strong> {event.detectionMethod.replace('_', ' ')}
                  </div>
                  {event.assignedTo && (
                    <div className="detail-item">
                      <strong>Assigned to:</strong> {event.assignedTo}
                    </div>
                  )}
                </div>
              </div>

              <div className="event-actions">
                <button
                  className="action-button view"
                  onClick={() => viewEventDetails(event)}
                >
                  View Details
                </button>
                {event.status === 'open' && (
                  <button
                    className="action-button investigate"
                    onClick={() => updateEventStatus(event.id, 'investigating')}
                  >
                    Start Investigation
                  </button>
                )}
                {event.status === 'investigating' && (
                  <button
                    className="action-button resolve"
                    onClick={() => updateEventStatus(event.id, 'resolved')}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {securityEvents.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🛡️</div>
            <h3>No Security Events</h3>
            <p>No security events found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* New Event Form Modal */}
      {showNewEventForm && (
        <div className="modal-overlay" onClick={() => setShowNewEventForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Security Event</h3>
              <button className="modal-close" onClick={() => setShowNewEventForm(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Event Type</label>
                  <select
                    value={newEventForm.type}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="authentication">Authentication</option>
                    <option value="authorization">Authorization</option>
                    <option value="data_access">Data Access</option>
                    <option value="system_change">System Change</option>
                    <option value="policy_violation">Policy Violation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Severity</label>
                  <select
                    value={newEventForm.severity}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, severity: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={newEventForm.description}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the security event..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Resource Affected</label>
                  <input
                    type="text"
                    value={newEventForm.resourceAffected}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, resourceAffected: e.target.value }))}
                    placeholder="e.g., user_database, login_system"
                  />
                </div>

                <div className="form-group">
                  <label>Detection Method</label>
                  <select
                    value={newEventForm.detectionMethod}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, detectionMethod: e.target.value as any }))}
                  >
                    <option value="manual">Manual</option>
                    <option value="automated">Automated</option>
                    <option value="ai_powered">AI Powered</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowNewEventForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="submit-button"
                  onClick={createSecurityEvent}
                  disabled={!newEventForm.description.trim()}
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Security Event Details</h3>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Event ID:</label>
                  <span>{selectedEvent.id}</span>
                </div>
                <div className="detail-item">
                  <label>Type:</label>
                  <span>
                    {getTypeIcon(selectedEvent.type)} {selectedEvent.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Severity:</label>
                  <span 
                    className="severity-badge" 
                    style={{ backgroundColor: getSeverityColor(selectedEvent.severity) }}
                  >
                    {selectedEvent.severity}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(selectedEvent.status) }}
                  >
                    {selectedEvent.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Timestamp:</label>
                  <span>{formatTimestamp(selectedEvent.timestamp)}</span>
                </div>
                <div className="detail-item">
                  <label>Detection Method:</label>
                  <span>{selectedEvent.detectionMethod.replace('_', ' ')}</span>
                </div>
                <div className="detail-item">
                  <label>IP Address:</label>
                  <span>{selectedEvent.ipAddress || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Resource Affected:</label>
                  <span>{selectedEvent.resourceAffected || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Assigned To:</label>
                  <span>{selectedEvent.assignedTo || 'Unassigned'}</span>
                </div>
                {selectedEvent.resolvedAt && (
                  <div className="detail-item">
                    <label>Resolved At:</label>
                    <span>{formatTimestamp(selectedEvent.resolvedAt)}</span>
                  </div>
                )}
              </div>

              <div className="description-section">
                <h4>Description:</h4>
                <p>{selectedEvent.description}</p>
              </div>

              {selectedEvent.additionalData && (
                <div className="additional-data-section">
                  <h4>Additional Data:</h4>
                  <pre className="additional-data-json">
                    {JSON.stringify(selectedEvent.additionalData, null, 2)}
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

export default SecurityEvents;