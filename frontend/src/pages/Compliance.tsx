import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'sox' | 'hipaa' | 'pci_dss' | 'custom';
  title: string;
  description: string;
  generatedBy: string;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  status: 'generating' | 'completed' | 'failed';
  findings: ComplianceFinding[];
  riskScore: number;
  recommendations: string[];
  certificationStatus?: 'compliant' | 'non_compliant' | 'partially_compliant';
}

interface ComplianceFinding {
  id: string;
  type: 'violation' | 'warning' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResources: string[];
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

const Compliance: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    type: 'gdpr',
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.audit.getComplianceReports();
      setReports(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load compliance reports');
      console.error('Compliance reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const reportData = {
        ...generateForm,
        period: {
          startDate: generateForm.startDate,
          endDate: generateForm.endDate
        }
      };

      await apiService.audit.generateComplianceReport(reportData);
      setShowGenerateForm(false);
      setGenerateForm({
        type: 'gdpr',
        title: '',
        description: '',
        startDate: '',
        endDate: ''
      });
      fetchReports();
    } catch (err) {
      console.error('Generate report error:', err);
      setError('Failed to generate compliance report');
    }
  };

  const getComplianceColor = (status?: string) => {
    switch (status) {
      case 'compliant': return '#28a745';
      case 'partially_compliant': return '#ffc107';
      case 'non_compliant': return '#dc3545';
      default: return '#6c757d';
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
      case 'generating': return '#007bff';
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getFindingStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#dc3545';
      case 'in_progress': return '#ffc107';
      case 'resolved': return '#28a745';
      case 'accepted_risk': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getComplianceTypeIcon = (type: string) => {
    switch (type) {
      case 'gdpr': return '🇪🇺';
      case 'sox': return '📊';
      case 'hipaa': return '🏥';
      case 'pci_dss': return '💳';
      case 'custom': return '⚙️';
      default: return '📋';
    }
  };

  const getComplianceTypeTitle = (type: string) => {
    switch (type) {
      case 'gdpr': return 'GDPR (General Data Protection Regulation)';
      case 'sox': return 'SOX (Sarbanes-Oxley Act)';
      case 'hipaa': return 'HIPAA (Health Insurance Portability and Accountability Act)';
      case 'pci_dss': return 'PCI DSS (Payment Card Industry Data Security Standard)';
      case 'custom': return 'Custom Compliance Framework';
      default: return 'Compliance Report';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading compliance reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">📋 Compliance & Governance</h2>
        <p className="page-subtitle">Automated compliance reporting and regulatory requirement tracking</p>
        <button 
          className="create-button"
          onClick={() => setShowGenerateForm(true)}
        >
          ➕ Generate New Report
        </button>
      </div>

      {/* Compliance Overview */}
      <div className="compliance-overview">
        <h3>Compliance Dashboard</h3>
        <div className="compliance-cards">
          <div className="compliance-card gdpr">
            <div className="compliance-header">
              <span className="compliance-icon">🇪🇺</span>
              <h4>GDPR Compliance</h4>
            </div>
            <div className="compliance-score">87%</div>
            <div className="compliance-status partially-compliant">Partially Compliant</div>
            <div className="compliance-details">
              <div>Last Assessment: {formatDate(new Date().toISOString())}</div>
              <div>3 Open Findings</div>
            </div>
          </div>

          <div className="compliance-card sox">
            <div className="compliance-header">
              <span className="compliance-icon">📊</span>
              <h4>SOX Compliance</h4>
            </div>
            <div className="compliance-score">92%</div>
            <div className="compliance-status compliant">Compliant</div>
            <div className="compliance-details">
              <div>Last Assessment: {formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())}</div>
              <div>1 Open Finding</div>
            </div>
          </div>

          <div className="compliance-card hipaa">
            <div className="compliance-header">
              <span className="compliance-icon">🏥</span>
              <h4>HIPAA Compliance</h4>
            </div>
            <div className="compliance-score">78%</div>
            <div className="compliance-status non-compliant">Non-Compliant</div>
            <div className="compliance-details">
              <div>Last Assessment: {formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())}</div>
              <div>7 Open Findings</div>
            </div>
          </div>

          <div className="compliance-card pci">
            <div className="compliance-header">
              <span className="compliance-icon">💳</span>
              <h4>PCI DSS</h4>
            </div>
            <div className="compliance-score">95%</div>
            <div className="compliance-status compliant">Compliant</div>
            <div className="compliance-details">
              <div>Last Assessment: {formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())}</div>
              <div>0 Open Findings</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Compliance Reports */}
      <div className="reports-section">
        <h3>Recent Compliance Reports</h3>
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-title">
                  <span className="report-icon">{getComplianceTypeIcon(report.type)}</span>
                  <div>
                    <h4>{report.title}</h4>
                    <p className="report-type">{getComplianceTypeTitle(report.type)}</p>
                  </div>
                </div>
                <div className="report-meta">
                  <span 
                    className="report-status" 
                    style={{ backgroundColor: getStatusColor(report.status) }}
                  >
                    {report.status}
                  </span>
                  {report.certificationStatus && (
                    <span 
                      className="certification-status" 
                      style={{ backgroundColor: getComplianceColor(report.certificationStatus) }}
                    >
                      {report.certificationStatus.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="report-content">
                <div className="report-description">
                  {report.description}
                </div>
                
                <div className="report-details">
                  <div className="report-detail">
                    <strong>Period:</strong> {formatDate(report.period.startDate)} - {formatDate(report.period.endDate)}
                  </div>
                  <div className="report-detail">
                    <strong>Generated:</strong> {formatDate(report.generatedAt)} by {report.generatedBy}
                  </div>
                  <div className="report-detail">
                    <strong>Risk Score:</strong> 
                    <span className={`risk-score ${report.riskScore > 70 ? 'high' : report.riskScore > 40 ? 'medium' : 'low'}`}>
                      {report.riskScore}/100
                    </span>
                  </div>
                  <div className="report-detail">
                    <strong>Findings:</strong> {report.findings.length} total 
                    ({report.findings.filter(f => f.type === 'violation').length} violations, 
                     {report.findings.filter(f => f.type === 'warning').length} warnings)
                  </div>
                </div>

                {report.recommendations.length > 0 && (
                  <div className="report-recommendations">
                    <strong>Key Recommendations:</strong>
                    <ul>
                      {report.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                      {report.recommendations.length > 3 && (
                        <li>...and {report.recommendations.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="report-actions">
                <button
                  className="action-button view"
                  onClick={() => setSelectedReport(report)}
                >
                  View Details
                </button>
                <button className="action-button export">
                  📄 Export Report
                </button>
                {report.status === 'completed' && (
                  <button className="action-button certify">
                    ✅ Request Certification
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {reports.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Compliance Reports</h3>
            <p>No compliance reports have been generated yet.</p>
            <button 
              className="create-button"
              onClick={() => setShowGenerateForm(true)}
            >
              Generate Your First Report
            </button>
          </div>
        )}
      </div>

      {/* Quick Compliance Actions */}
      <div className="quick-actions-section">
        <h3>⚡ Quick Compliance Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card">
            <div className="quick-action-icon">🔍</div>
            <div className="quick-action-title">Run GDPR Scan</div>
            <div className="quick-action-description">
              Perform immediate GDPR compliance check
            </div>
          </button>

          <button className="quick-action-card">
            <div className="quick-action-icon">📊</div>
            <div className="quick-action-title">SOX Controls Test</div>
            <div className="quick-action-description">
              Test internal financial controls
            </div>
          </button>

          <button className="quick-action-card">
            <div className="quick-action-icon">🛡️</div>
            <div className="quick-action-title">Security Assessment</div>
            <div className="quick-action-description">
              Comprehensive security posture review
            </div>
          </button>

          <button className="quick-action-card">
            <div className="quick-action-icon">📋</div>
            <div className="quick-action-title">Policy Review</div>
            <div className="quick-action-description">
              Review and update compliance policies
            </div>
          </button>

          <button className="quick-action-card">
            <div className="quick-action-icon">📈</div>
            <div className="quick-action-title">Compliance Metrics</div>
            <div className="quick-action-description">
              View detailed compliance analytics
            </div>
          </button>

          <button className="quick-action-card">
            <div className="quick-action-icon">⚙️</div>
            <div className="quick-action-title">Automated Remediation</div>
            <div className="quick-action-description">
              Configure automatic compliance fixes
            </div>
          </button>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateForm && (
        <div className="modal-overlay" onClick={() => setShowGenerateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate Compliance Report</h3>
              <button className="modal-close" onClick={() => setShowGenerateForm(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Compliance Framework</label>
                  <select
                    value={generateForm.type}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="gdpr">GDPR</option>
                    <option value="sox">SOX</option>
                    <option value="hipaa">HIPAA</option>
                    <option value="pci_dss">PCI DSS</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Report Title</label>
                  <input
                    type="text"
                    value={generateForm.title}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Q4 2024 GDPR Compliance Assessment"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={generateForm.description}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the scope and purpose of this compliance report..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={generateForm.startDate}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={generateForm.endDate}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowGenerateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="submit-button"
                  onClick={generateReport}
                  disabled={!generateForm.title.trim() || !generateForm.startDate || !generateForm.endDate}
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedReport.title}</h3>
              <button className="modal-close" onClick={() => setSelectedReport(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="report-details-grid">
                <div className="report-summary">
                  <h4>Report Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <label>Framework:</label>
                      <span>
                        {getComplianceTypeIcon(selectedReport.type)} {getComplianceTypeTitle(selectedReport.type)}
                      </span>
                    </div>
                    <div className="summary-item">
                      <label>Period:</label>
                      <span>{formatDate(selectedReport.period.startDate)} - {formatDate(selectedReport.period.endDate)}</span>
                    </div>
                    <div className="summary-item">
                      <label>Generated By:</label>
                      <span>{selectedReport.generatedBy}</span>
                    </div>
                    <div className="summary-item">
                      <label>Risk Score:</label>
                      <span className={`risk-score ${selectedReport.riskScore > 70 ? 'high' : selectedReport.riskScore > 40 ? 'medium' : 'low'}`}>
                        {selectedReport.riskScore}/100
                      </span>
                    </div>
                    <div className="summary-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(selectedReport.status) }}
                      >
                        {selectedReport.status}
                      </span>
                    </div>
                    {selectedReport.certificationStatus && (
                      <div className="summary-item">
                        <label>Certification:</label>
                        <span 
                          className="certification-badge" 
                          style={{ backgroundColor: getComplianceColor(selectedReport.certificationStatus) }}
                        >
                          {selectedReport.certificationStatus.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="findings-section">
                  <h4>Compliance Findings ({selectedReport.findings.length})</h4>
                  <div className="findings-list">
                    {selectedReport.findings.map((finding) => (
                      <div key={finding.id} className="finding-item">
                        <div className="finding-header">
                          <span 
                            className="finding-type" 
                            style={{ backgroundColor: getSeverityColor(finding.severity) }}
                          >
                            {finding.type}
                          </span>
                          <span 
                            className="finding-severity" 
                            style={{ backgroundColor: getSeverityColor(finding.severity) }}
                          >
                            {finding.severity}
                          </span>
                          <span 
                            className="finding-status" 
                            style={{ backgroundColor: getFindingStatusColor(finding.status) }}
                          >
                            {finding.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="finding-description">{finding.description}</div>
                        <div className="finding-details">
                          <div><strong>Affected Resources:</strong> {finding.affectedResources.join(', ')}</div>
                          <div><strong>Remediation:</strong> {finding.remediation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recommendations-section">
                  <h4>Recommendations</h4>
                  <ul className="recommendations-list">
                    {selectedReport.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compliance;