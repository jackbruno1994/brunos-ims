// Example data models/interfaces for Bruno's IMS

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  restaurantId: string;
  availability: boolean;
  allergens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Audit System Models
export interface AuditLog {
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
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
}

export interface SecurityEvent {
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
  timestamp: Date;
  resolvedAt?: Date;
  additionalData?: Record<string, any>;
}

export interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'sox' | 'hipaa' | 'pci_dss' | 'custom';
  title: string;
  description: string;
  generatedBy: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  status: 'generating' | 'completed' | 'failed';
  findings: ComplianceFinding[];
  riskScore: number;
  recommendations: string[];
  certificationStatus?: 'compliant' | 'non_compliant' | 'partially_compliant';
}

export interface ComplianceFinding {
  id: string;
  type: 'violation' | 'warning' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResources: string[];
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

export interface Analytics {
  id: string;
  type: 'anomaly_detection' | 'predictive' | 'pattern_recognition' | 'performance';
  title: string;
  description: string;
  generatedAt: Date;
  data: Record<string, any>;
  insights: string[];
  alerts: AnalyticsAlert[];
  confidence: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface AnalyticsAlert {
  id: string;
  type: 'anomaly' | 'threshold' | 'prediction' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  metadata?: Record<string, any>;
}

export interface Investigation {
  id: string;
  title: string;
  description: string;
  type: 'security_incident' | 'compliance_violation' | 'anomaly_investigation' | 'routine_audit';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'closed' | 'escalated';
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  findings: string[];
  evidence: InvestigationEvidence[];
  comments: InvestigationComment[];
  relatedEvents: string[];
  tags: string[];
}

export interface InvestigationEvidence {
  id: string;
  type: 'log' | 'screenshot' | 'document' | 'data_export';
  name: string;
  description: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileUrl?: string;
  hash?: string;
  metadata?: Record<string, any>;
}

export interface InvestigationComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  type: 'comment' | 'status_change' | 'assignment' | 'evidence_added';
}

export interface AuditPolicy {
  id: string;
  name: string;
  description: string;
  type: 'data_retention' | 'access_control' | 'encryption' | 'monitoring' | 'compliance';
  rules: PolicyRule[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastEvaluated?: Date;
  violationCount: number;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  parameters?: Record<string, any>;
}

export interface IntegrationConfig {
  id: string;
  type: 'siem' | 'identity_provider' | 'security_connector' | 'api_monitoring';
  name: string;
  description: string;
  endpoint: string;
  credentials: Record<string, any>;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: 'success' | 'failed' | 'in_progress' | 'never';
  configuredBy: string;
  createdAt: Date;
  updatedAt: Date;
}