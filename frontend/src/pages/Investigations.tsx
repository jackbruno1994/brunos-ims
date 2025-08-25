import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Investigation {
  id: string;
  title: string;
  description: string;
  type: 'security_incident' | 'compliance_violation' | 'anomaly_investigation' | 'routine_audit';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'closed' | 'escalated';
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  findings: string[];
  evidence: InvestigationEvidence[];
  comments: InvestigationComment[];
  relatedEvents: string[];
  tags: string[];
}

interface InvestigationEvidence {
  id: string;
  type: 'log' | 'screenshot' | 'document' | 'data_export';
  name: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl?: string;
  hash?: string;
  metadata?: Record<string, any>;
}

interface InvestigationComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  type: 'comment' | 'status_change' | 'assignment' | 'evidence_added';
}

const Investigations: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    type: '',
    search: ''
  });
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    type: 'security_incident',
    priority: 'medium',
    assignedTo: '',
    tags: ''
  });

  useEffect(() => {
    fetchInvestigations();
  }, [filters]);

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      const response = await apiService.audit.getInvestigations(filters);
      setInvestigations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load investigations');
      console.error('Investigations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInvestigation = async () => {
    try {
      const investigationData = {
        ...createForm,
        tags: createForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        relatedEvents: [] // Could be populated from a selection
      };

      await apiService.audit.createInvestigation(investigationData);
      setShowCreateForm(false);
      setCreateForm({
        title: '',
        description: '',
        type: 'security_incident',
        priority: 'medium',
        assignedTo: '',
        tags: ''
      });
      fetchInvestigations();
    } catch (err) {
      console.error('Create investigation error:', err);
      setError('Failed to create investigation');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
      case 'in_progress': return '#007bff';
      case 'closed': return '#28a745';
      case 'escalated': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security_incident': return '🛡️';
      case 'compliance_violation': return '📋';
      case 'anomaly_investigation': return '🔍';
      case 'routine_audit': return '📊';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m`;
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading investigations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">🔍 Investigations</h2>
        <p className="page-subtitle">Manage security incidents, compliance violations, and audit investigations</p>
        <button 
          className="create-button"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ New Investigation
        </button>
      </div>

      {/* Investigation Summary */}
      <div className="summary-section">
        <div className="summary-cards">
          <div className="summary-card open">
            <div className="summary-icon">🚨</div>
            <div className="summary-content">
              <div className="summary-value">
                {investigations.filter(inv => inv.status === 'open').length}
              </div>
              <div className="summary-label">Open</div>
            </div>
          </div>

          <div className="summary-card in-progress">
            <div className="summary-icon">⚡</div>
            <div className="summary-content">
              <div className="summary-value">
                {investigations.filter(inv => inv.status === 'in_progress').length}
              </div>
              <div className="summary-label">In Progress</div>
            </div>
          </div>

          <div className="summary-card critical">
            <div className="summary-icon">🔥</div>
            <div className="summary-content">
              <div className="summary-value">
                {investigations.filter(inv => inv.priority === 'critical').length}
              </div>
              <div className="summary-label">Critical Priority</div>
            </div>
          </div>

          <div className="summary-card closed">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-value">
                {investigations.filter(inv => inv.status === 'closed').length}
              </div>
              <div className="summary-label">Closed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search investigations..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="security_incident">Security Incident</option>
              <option value="compliance_violation">Compliance Violation</option>
              <option value="anomaly_investigation">Anomaly Investigation</option>
              <option value="routine_audit">Routine Audit</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            >
              <option value="">All Assignees</option>
              <option value="security_analyst_1">Security Analyst 1</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="audit_team">Audit Team</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Investigations List */}
      <div className="investigations-section">
        <h3>Investigations ({investigations.length} total)</h3>
        <div className="investigations-list">
          {investigations.map((investigation) => (
            <div key={investigation.id} className="investigation-card">
              <div className="investigation-header">
                <div className="investigation-title">
                  <span className="type-icon">{getTypeIcon(investigation.type)}</span>
                  <div>
                    <h4>{investigation.title}</h4>
                    <p className="investigation-id">ID: {investigation.id}</p>
                  </div>
                </div>
                <div className="investigation-meta">
                  <span 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(investigation.priority) }}
                  >
                    {investigation.priority}
                  </span>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(investigation.status) }}
                  >
                    {investigation.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="investigation-content">
                <div className="investigation-description">
                  {investigation.description}
                </div>

                <div className="investigation-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Type:</strong> {investigation.type.replace('_', ' ')}
                    </div>
                    <div className="detail-item">
                      <strong>Assigned to:</strong> {investigation.assignedTo}
                    </div>
                    <div className="detail-item">
                      <strong>Created:</strong> {formatTimestamp(investigation.createdAt)}
                    </div>
                    <div className="detail-item">
                      <strong>Duration:</strong> 
                      {formatDuration(investigation.createdAt, investigation.closedAt)}
                      {investigation.status !== 'closed' && ' (ongoing)'}
                    </div>
                    <div className="detail-item">
                      <strong>Findings:</strong> {investigation.findings.length}
                    </div>
                    <div className="detail-item">
                      <strong>Evidence:</strong> {investigation.evidence.length} items
                    </div>
                    <div className="detail-item">
                      <strong>Comments:</strong> {investigation.comments.length}
                    </div>
                    <div className="detail-item">
                      <strong>Related Events:</strong> {investigation.relatedEvents.length}
                    </div>
                  </div>
                </div>

                {investigation.tags.length > 0 && (
                  <div className="investigation-tags">
                    <strong>Tags:</strong>
                    {investigation.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                {investigation.findings.length > 0 && (
                  <div className="recent-findings">
                    <strong>Recent Findings:</strong>
                    <ul>
                      {investigation.findings.slice(-2).map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                      {investigation.findings.length > 2 && (
                        <li>...and {investigation.findings.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="investigation-actions">
                <button
                  className="action-button view"
                  onClick={() => setSelectedInvestigation(investigation)}
                >
                  View Details
                </button>
                {investigation.status === 'open' && (
                  <button className="action-button start">
                    Start Investigation
                  </button>
                )}
                {investigation.status === 'in_progress' && (
                  <button className="action-button close">
                    Close Investigation
                  </button>
                )}
                <button className="action-button evidence">
                  📎 Add Evidence
                </button>
                <button className="action-button comment">
                  💬 Add Comment
                </button>
              </div>
            </div>
          ))}
        </div>

        {investigations.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Investigations</h3>
            <p>No investigations found matching your criteria.</p>
            <button 
              className="create-button"
              onClick={() => setShowCreateForm(true)}
            >
              Start First Investigation
            </button>
          </div>
        )}
      </div>

      {/* Create Investigation Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Investigation</h3>
              <button className="modal-close" onClick={() => setShowCreateForm(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Investigation Title</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief title describing the investigation"
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="security_incident">Security Incident</option>
                    <option value="compliance_violation">Compliance Violation</option>
                    <option value="anomaly_investigation">Anomaly Investigation</option>
                    <option value="routine_audit">Routine Audit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned To</label>
                  <select
                    value={createForm.assignedTo}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  >
                    <option value="">Select Assignee</option>
                    <option value="security_analyst_1">Security Analyst 1</option>
                    <option value="compliance_officer">Compliance Officer</option>
                    <option value="audit_team">Audit Team</option>
                    <option value="security_team">Security Team</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of what needs to be investigated..."
                    rows={4}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={createForm.tags}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., authentication, breach, data-access"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="submit-button"
                  onClick={createInvestigation}
                  disabled={!createForm.title.trim() || !createForm.description.trim() || !createForm.assignedTo}
                >
                  Create Investigation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investigation Details Modal */}
      {selectedInvestigation && (
        <div className="modal-overlay" onClick={() => setSelectedInvestigation(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedInvestigation.title}</h3>
              <button className="modal-close" onClick={() => setSelectedInvestigation(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="investigation-details-grid">
                {/* Investigation Overview */}
                <div className="detail-section">
                  <h4>Investigation Overview</h4>
                  <div className="overview-grid">
                    <div className="overview-item">
                      <label>ID:</label>
                      <span>{selectedInvestigation.id}</span>
                    </div>
                    <div className="overview-item">
                      <label>Type:</label>
                      <span>
                        {getTypeIcon(selectedInvestigation.type)} {selectedInvestigation.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="overview-item">
                      <label>Priority:</label>
                      <span 
                        className="priority-badge" 
                        style={{ backgroundColor: getPriorityColor(selectedInvestigation.priority) }}
                      >
                        {selectedInvestigation.priority}
                      </span>
                    </div>
                    <div className="overview-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(selectedInvestigation.status) }}
                      >
                        {selectedInvestigation.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="overview-item">
                      <label>Assigned To:</label>
                      <span>{selectedInvestigation.assignedTo}</span>
                    </div>
                    <div className="overview-item">
                      <label>Created By:</label>
                      <span>{selectedInvestigation.createdBy}</span>
                    </div>
                    <div className="overview-item">
                      <label>Created:</label>
                      <span>{formatTimestamp(selectedInvestigation.createdAt)}</span>
                    </div>
                    <div className="overview-item">
                      <label>Last Updated:</label>
                      <span>{formatTimestamp(selectedInvestigation.updatedAt)}</span>
                    </div>
                    {selectedInvestigation.closedAt && (
                      <div className="overview-item">
                        <label>Closed:</label>
                        <span>{formatTimestamp(selectedInvestigation.closedAt)}</span>
                      </div>
                    )}
                    <div className="overview-item">
                      <label>Duration:</label>
                      <span>
                        {formatDuration(selectedInvestigation.createdAt, selectedInvestigation.closedAt)}
                        {selectedInvestigation.status !== 'closed' && ' (ongoing)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedInvestigation.description}</p>
                </div>

                {/* Findings */}
                <div className="detail-section">
                  <h4>Findings ({selectedInvestigation.findings.length})</h4>
                  {selectedInvestigation.findings.length > 0 ? (
                    <ul className="findings-list">
                      {selectedInvestigation.findings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-message">No findings recorded yet.</p>
                  )}
                </div>

                {/* Evidence */}
                <div className="detail-section">
                  <h4>Evidence ({selectedInvestigation.evidence.length} items)</h4>
                  {selectedInvestigation.evidence.length > 0 ? (
                    <div className="evidence-list">
                      {selectedInvestigation.evidence.map((evidence) => (
                        <div key={evidence.id} className="evidence-item">
                          <div className="evidence-header">
                            <span className="evidence-type">{evidence.type}</span>
                            <span className="evidence-name">{evidence.name}</span>
                          </div>
                          <div className="evidence-description">{evidence.description}</div>
                          <div className="evidence-meta">
                            <span>Uploaded by {evidence.uploadedBy}</span>
                            <span>on {formatTimestamp(evidence.uploadedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-message">No evidence uploaded yet.</p>
                  )}
                </div>

                {/* Comments */}
                <div className="detail-section">
                  <h4>Comments & Updates ({selectedInvestigation.comments.length})</h4>
                  {selectedInvestigation.comments.length > 0 ? (
                    <div className="comments-list">
                      {selectedInvestigation.comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                            <span className="comment-author">{comment.authorName}</span>
                            <span className="comment-type">{comment.type.replace('_', ' ')}</span>
                            <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
                          </div>
                          <div className="comment-content">{comment.content}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-message">No comments yet.</p>
                  )}
                </div>

                {/* Tags and Related Events */}
                <div className="detail-section">
                  <h4>Tags & Related Events</h4>
                  <div className="tags-events-grid">
                    <div>
                      <strong>Tags:</strong>
                      {selectedInvestigation.tags.length > 0 ? (
                        <div className="tags-container">
                          {selectedInvestigation.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      ) : (
                        <span> No tags</span>
                      )}
                    </div>
                    <div>
                      <strong>Related Events:</strong>
                      {selectedInvestigation.relatedEvents.length > 0 ? (
                        <div className="related-events">
                          {selectedInvestigation.relatedEvents.map((eventId, index) => (
                            <span key={index} className="related-event">{eventId}</span>
                          ))}
                        </div>
                      ) : (
                        <span> No related events</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investigations;