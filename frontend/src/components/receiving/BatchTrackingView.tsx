import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProductBatch } from '../../types/receiving';

interface BatchTrackingViewProps {
  itemId?: string;
  onBatchSelect?: (batch: ProductBatch) => void;
}

const BatchTrackingView: React.FC<BatchTrackingViewProps> = ({
  itemId,
  onBatchSelect
}) => {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, [itemId]);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {};
      if (itemId) {
        params.itemId = itemId;
      }

      const response = await axios.get('/api/receiving/batches', { params });
      setBatches(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = (expirationDate: Date | string, daysThreshold: number = 30) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold && diffDays >= 0;
  };

  const isExpired = (expirationDate: Date | string) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const now = new Date();
    return expDate.getTime() < now.getTime();
  };

  const getBatchStatus = (batch: ProductBatch) => {
    if (batch.currentQuantity <= 0) return 'depleted';
    if (batch.expirationDate) {
      if (isExpired(batch.expirationDate)) return 'expired';
      if (isExpiringSoon(batch.expirationDate)) return 'expiring-soon';
    }
    return 'active';
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return '#ff4d4f';
      case 'expiring-soon': return '#fa8c16';
      case 'depleted': return '#666';
      case 'active': return '#52c41a';
      default: return '#666';
    }
  };

  const getBatchStatusLabel = (status: string) => {
    switch (status) {
      case 'expired': return 'Expired';
      case 'expiring-soon': return 'Expiring Soon';
      case 'depleted': return 'Depleted';
      case 'active': return 'Active';
      default: return 'Unknown';
    }
  };

  const handleBatchClick = (batch: ProductBatch) => {
    setSelectedBatch(batch);
    onBatchSelect?.(batch);
  };

  const filteredBatches = showExpiringSoon 
    ? batches.filter(batch => 
        batch.expirationDate && 
        (isExpiringSoon(batch.expirationDate) || isExpired(batch.expirationDate))
      )
    : batches;

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        Loading batches...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0 }}>Batch Tracking</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={showExpiringSoon}
              onChange={(e) => setShowExpiringSoon(e.target.checked)}
            />
            Show only expiring/expired
          </label>
          <button
            onClick={fetchBatches}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
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

      {filteredBatches.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#666',
          padding: '40px 20px'
        }}>
          {showExpiringSoon 
            ? 'No expiring or expired batches found'
            : 'No batches found'
          }
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {filteredBatches.map((batch) => {
            const status = getBatchStatus(batch);
            const statusColor = getBatchStatusColor(status);
            const isSelected = selectedBatch?.id === batch.id;

            return (
              <div
                key={batch.id}
                onClick={() => handleBatchClick(batch)}
                style={{
                  border: `2px solid ${isSelected ? '#1890ff' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: isSelected ? '#f0f9ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <h4 style={{ 
                    margin: 0, 
                    fontFamily: 'monospace',
                    color: '#333'
                  }}>
                    {batch.batchNumber}
                  </h4>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: statusColor,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getBatchStatusLabel(status)}
                  </span>
                </div>

                {/* Details Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <div>
                    <strong>Item ID:</strong>
                    <div style={{ color: '#666' }}>{batch.itemId}</div>
                  </div>
                  <div>
                    <strong>Current Qty:</strong>
                    <div style={{ 
                      color: batch.currentQuantity <= 0 ? '#ff4d4f' : '#333',
                      fontWeight: 'bold'
                    }}>
                      {batch.currentQuantity}
                    </div>
                  </div>
                  <div>
                    <strong>Received Qty:</strong>
                    <div style={{ color: '#666' }}>{batch.receivedQuantity}</div>
                  </div>
                  {batch.lotNumber && (
                    <div>
                      <strong>Lot Number:</strong>
                      <div style={{ color: '#666' }}>{batch.lotNumber}</div>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div style={{ marginTop: '12px' }}>
                  {batch.expirationDate && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Expires:</strong>
                      <span style={{ 
                        marginLeft: '8px',
                        color: isExpired(batch.expirationDate) 
                          ? '#ff4d4f' 
                          : isExpiringSoon(batch.expirationDate) 
                            ? '#fa8c16' 
                            : '#666'
                      }}>
                        {new Date(batch.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {batch.manufactureDate && (
                    <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                      <strong>Manufactured:</strong>
                      <span style={{ marginLeft: '8px' }}>
                        {new Date(batch.manufactureDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <strong>Received:</strong>
                    <span style={{ marginLeft: '8px' }}>
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Supplier Info */}
                {batch.supplierBatchId && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '8px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <strong>Supplier Batch ID:</strong> {batch.supplierBatchId}
                  </div>
                )}

                {/* Notes */}
                {batch.notes && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '8px',
                    backgroundColor: '#f0f9f0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    border: '1px solid #d9f7be'
                  }}>
                    <strong>Notes:</strong>
                    <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                      {batch.notes}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {batches.length > 0 && (
        <div style={{ 
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '16px',
          fontSize: '14px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>
              {batches.length}
            </div>
            <div style={{ color: '#666' }}>Total Batches</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
              {batches.filter(b => getBatchStatus(b) === 'active').length}
            </div>
            <div style={{ color: '#666' }}>Active</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#fa8c16' }}>
              {batches.filter(b => getBatchStatus(b) === 'expiring-soon').length}
            </div>
            <div style={{ color: '#666' }}>Expiring Soon</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
              {batches.filter(b => getBatchStatus(b) === 'expired').length}
            </div>
            <div style={{ color: '#666' }}>Expired</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>
              {batches.filter(b => getBatchStatus(b) === 'depleted').length}
            </div>
            <div style={{ color: '#666' }}>Depleted</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTrackingView;