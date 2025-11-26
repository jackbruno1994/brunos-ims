import React, { useState } from 'react';
import DocumentScannerComponent from '../components/receiving/DocumentScannerComponent';
import ProductScannerComponent from '../components/receiving/ProductScannerComponent';
import DiscrepancyResolutionModal from '../components/receiving/DiscrepancyResolutionModal';
import BatchTrackingView from '../components/receiving/BatchTrackingView';
import { ScannedDocument, OCRData, BarcodeData, ScanResult, ReceivingDiscrepancy, ProductBatch } from '../types/receiving';

const ReceivingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'products' | 'batches' | 'discrepancies'>('scanner');
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<string>('');
  const [lastScannedDocument, setLastScannedDocument] = useState<ScannedDocument | null>(null);
  const [lastOCRData, setLastOCRData] = useState<OCRData | null>(null);
  const [lastBarcodeData, setLastBarcodeData] = useState<BarcodeData | null>(null);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<ReceivingDiscrepancy | null>(null);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);

  const handleDocumentUploaded = (document: ScannedDocument) => {
    setLastScannedDocument(document);
    console.log('Document uploaded:', document);
  };

  const handleOCRComplete = (ocrData: OCRData) => {
    setLastOCRData(ocrData);
    console.log('OCR completed:', ocrData);
  };

  const handleScanResult = (result: ScanResult) => {
    if (result.success && result.data) {
      console.log('Barcode scanned:', result.data);
    }
  };

  const handleBarcodeValidated = (data: BarcodeData) => {
    setLastBarcodeData(data);
    console.log('Barcode validated:', data);
  };

  const handleBatchSelect = (batch: ProductBatch) => {
    console.log('Batch selected:', batch);
  };

  const tabs = [
    { key: 'scanner', label: 'Document Scanner', icon: '📄' },
    { key: 'products', label: 'Product Scanner', icon: '📱' },
    { key: 'batches', label: 'Batch Tracking', icon: '📦' },
    { key: 'discrepancies', label: 'Discrepancies', icon: '⚠️' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#333', marginBottom: '8px' }}>
          Purchase Order Receiving
        </h1>
        <p style={{ margin: 0, color: '#666' }}>
          Scan documents, validate products, and track inventory batches
        </p>
      </div>

      {/* Purchase Order Selection */}
      <div style={{ 
        marginBottom: '30px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          Purchase Order ID (Optional):
        </label>
        <input
          type="text"
          value={selectedPurchaseOrderId}
          onChange={(e) => setSelectedPurchaseOrderId(e.target.value)}
          placeholder="Enter PO number to associate scanned documents"
          style={{
            width: '300px',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        {selectedPurchaseOrderId && (
          <div style={{ marginTop: '8px', color: '#52c41a', fontSize: '14px' }}>
            ✓ Documents will be associated with PO: {selectedPurchaseOrderId}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        borderBottom: '2px solid #f0f0f0',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '12px 20px',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#1890ff' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#666',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                marginRight: '4px',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'scanner' && (
          <div>
            <DocumentScannerComponent
              purchaseOrderId={selectedPurchaseOrderId || undefined}
              onDocumentUploaded={handleDocumentUploaded}
              onOCRComplete={handleOCRComplete}
            />
            
            {/* Recent Scan Results */}
            {(lastScannedDocument || lastOCRData) && (
              <div style={{ 
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #91d5ff'
              }}>
                <h3 style={{ marginTop: 0, color: '#1890ff' }}>Recent Scan Results</h3>
                {lastScannedDocument && (
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Last Document:</strong> {lastScannedDocument.fileName}
                    <br />
                    <small>Type: {lastScannedDocument.documentType} | 
                    Uploaded: {new Date(lastScannedDocument.uploadedAt).toLocaleString()}</small>
                  </div>
                )}
                {lastOCRData && (
                  <div>
                    <strong>Extracted Data:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                      {lastOCRData.documentNumber && <li>Document #: {lastOCRData.documentNumber}</li>}
                      {lastOCRData.supplierName && <li>Supplier: {lastOCRData.supplierName}</li>}
                      {lastOCRData.totalAmount && <li>Total: ${lastOCRData.totalAmount.toFixed(2)}</li>}
                      {lastOCRData.items && <li>Items found: {lastOCRData.items.length}</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <ProductScannerComponent
              onScanResult={handleScanResult}
              onBarcodeValidated={handleBarcodeValidated}
              autoValidate={true}
            />
            
            {/* Recent Barcode Results */}
            {lastBarcodeData && (
              <div style={{ 
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f6ffed',
                borderRadius: '8px',
                border: '1px solid #b7eb8f'
              }}>
                <h3 style={{ marginTop: 0, color: '#52c41a' }}>Recent Barcode Scan</h3>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Code:</strong> {lastBarcodeData.code}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Format:</strong> {lastBarcodeData.format}
                </div>
                {lastBarcodeData.itemId && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Item ID:</strong> {lastBarcodeData.itemId}
                  </div>
                )}
                {lastBarcodeData.batchNumber && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Batch:</strong> {lastBarcodeData.batchNumber}
                  </div>
                )}
                {lastBarcodeData.expirationDate && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Expires:</strong> {lastBarcodeData.expirationDate}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'batches' && (
          <BatchTrackingView
            onBatchSelect={handleBatchSelect}
          />
        )}

        {activeTab === 'discrepancies' && (
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3>Discrepancy Management</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              This section would show a list of receiving discrepancies and allow resolution.
            </p>
            <button
              onClick={() => {
                // Demo discrepancy
                setSelectedDiscrepancy({
                  id: 'demo-1',
                  purchaseOrderId: selectedPurchaseOrderId || 'PO-2024-001',
                  itemId: 'ITM-001',
                  discrepancyType: 'quantity',
                  expectedValue: '100 units',
                  actualValue: '95 units',
                  description: 'Received 5 units less than expected in delivery',
                  status: 'open',
                  reportedBy: 'demo-user',
                  reportedAt: new Date(),
                });
                setIsDiscrepancyModalOpen(true);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#fa8c16',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              View Sample Discrepancy
            </button>
          </div>
        )}
      </div>

      {/* Discrepancy Resolution Modal */}
      <DiscrepancyResolutionModal
        discrepancy={selectedDiscrepancy}
        isOpen={isDiscrepancyModalOpen}
        onClose={() => {
          setIsDiscrepancyModalOpen(false);
          setSelectedDiscrepancy(null);
        }}
        onResolved={(resolvedDiscrepancy) => {
          console.log('Discrepancy resolved:', resolvedDiscrepancy);
          setSelectedDiscrepancy(null);
        }}
      />

      {/* Quick Actions */}
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('scanner')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📄 Scan Document
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📱 Scan Product
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#722ed1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📦 View Batches
          </button>
          <button
            onClick={() => setActiveTab('discrepancies')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fa8c16',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ⚠️ Discrepancies
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceivingPage;