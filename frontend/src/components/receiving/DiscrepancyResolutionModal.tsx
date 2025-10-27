import React, { useState } from 'react';
import axios from 'axios';
import { ReceivingDiscrepancy } from '../../types/receiving';

interface DiscrepancyResolutionModalProps {
  discrepancy: ReceivingDiscrepancy | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved?: (discrepancy: ReceivingDiscrepancy) => void;
}

const DiscrepancyResolutionModal: React.FC<DiscrepancyResolutionModalProps> = ({
  discrepancy,
  isOpen,
  onClose,
  onResolved
}) => {
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    if (!discrepancy || !resolution.trim()) {
      setError('Please provide a resolution description');
      return;
    }

    setResolving(true);
    setError(null);

    try {
      const response = await axios.patch(
        `/api/receiving/discrepancies/${discrepancy.id}/resolve`,
        { resolution: resolution.trim() }
      );

      onResolved?.(response.data);
      onClose();
      setResolution('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve discrepancy');
    } finally {
      setResolving(false);
    }
  };

  const handleClose = () => {
    if (!resolving) {
      onClose();
      setResolution('');
      setError(null);
    }
  };

  const getDiscrepancyTypeLabel = (type: string) => {
    switch (type) {
      case 'quantity': return 'Quantity Mismatch';
      case 'price': return 'Price Discrepancy';
      case 'quality': return 'Quality Issue';
      case 'missing_item': return 'Missing Item';
      case 'extra_item': return 'Extra Item';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#ff4d4f';
      case 'investigating': return '#fa8c16';
      case 'resolved': return '#52c41a';
      case 'cancelled': return '#666';
      default: return '#666';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Resolve Discrepancy</h2>
          <button
            onClick={handleClose}
            disabled={resolving}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: resolving ? 'not-allowed' : 'pointer',
              color: '#999',
              padding: '0',
              width: '30px',
              height: '30px'
            }}
          >
            ×
          </button>
        </div>

        {discrepancy && (
          <>
            {/* Discrepancy Details */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>Discrepancy Details</h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <strong>Type:</strong>
                  <div style={{ 
                    color: getStatusColor(discrepancy.status),
                    fontWeight: 'bold'
                  }}>
                    {getDiscrepancyTypeLabel(discrepancy.discrepancyType)}
                  </div>
                </div>
                <div>
                  <strong>Status:</strong>
                  <div style={{ 
                    color: getStatusColor(discrepancy.status),
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {discrepancy.status}
                  </div>
                </div>
                <div>
                  <strong>Purchase Order:</strong>
                  <div>{discrepancy.purchaseOrderId}</div>
                </div>
                <div>
                  <strong>Item ID:</strong>
                  <div>{discrepancy.itemId}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong>Description:</strong>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  marginTop: '8px'
                }}>
                  {discrepancy.description}
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <strong>Expected Value:</strong>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#f0f9f0',
                    borderRadius: '4px',
                    marginTop: '4px',
                    border: '1px solid #d9f7be'
                  }}>
                    {discrepancy.expectedValue}
                  </div>
                </div>
                <div>
                  <strong>Actual Value:</strong>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#fff2f0',
                    borderRadius: '4px',
                    marginTop: '4px',
                    border: '1px solid #ffccc7'
                  }}>
                    {discrepancy.actualValue}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                fontSize: '14px',
                color: '#666'
              }}>
                <div>
                  <strong>Reported By:</strong> {discrepancy.reportedBy}
                </div>
                <div>
                  <strong>Reported At:</strong> {new Date(discrepancy.reportedAt).toLocaleString()}
                </div>
              </div>

              {discrepancy.resolution && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Previous Resolution:</strong>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f0f9f0',
                    borderRadius: '4px',
                    marginTop: '8px',
                    border: '1px solid #d9f7be'
                  }}>
                    {discrepancy.resolution}
                  </div>
                  {discrepancy.resolvedBy && discrepancy.resolvedAt && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                      Resolved by {discrepancy.resolvedBy} at {new Date(discrepancy.resolvedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resolution Form */}
            {discrepancy.status !== 'resolved' && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: '#333' }}>Resolution</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Resolution Description:
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe how this discrepancy was resolved..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical',
                      minHeight: '100px'
                    }}
                  />
                </div>

                {error && (
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#ffebe6', 
                    border: '1px solid #ffb3b3',
                    borderRadius: '4px',
                    color: '#d32f2f',
                    marginBottom: '16px'
                  }}>
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              borderTop: '1px solid #f0f0f0',
              paddingTop: '20px'
            }}>
              <button
                onClick={handleClose}
                disabled={resolving}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: resolving ? 'not-allowed' : 'pointer',
                  color: '#666'
                }}
              >
                Cancel
              </button>
              
              {discrepancy.status !== 'resolved' && (
                <button
                  onClick={handleResolve}
                  disabled={resolving || !resolution.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: resolving || !resolution.trim() ? '#ccc' : '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: resolving || !resolution.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resolving ? 'Resolving...' : 'Mark as Resolved'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiscrepancyResolutionModal;