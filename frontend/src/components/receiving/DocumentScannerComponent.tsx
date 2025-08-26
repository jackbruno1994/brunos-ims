import React, { useState, useRef } from 'react';
import axios from 'axios';
import { ScannedDocument, OCRData } from '../../types/receiving';

interface DocumentScannerProps {
  purchaseOrderId?: string;
  onDocumentUploaded?: (document: ScannedDocument) => void;
  onOCRComplete?: (ocrData: OCRData) => void;
}

const DocumentScannerComponent: React.FC<DocumentScannerProps> = ({
  purchaseOrderId,
  onDocumentUploaded,
  onOCRComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'delivery_note' | 'invoice' | 'packing_slip'>('delivery_note');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<ScannedDocument | null>(null);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `document-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
            
            // Stop camera stream
            const stream = video.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            video.srcObject = null;
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) {
      setError('Please select a file or capture a photo');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', documentType);
      if (purchaseOrderId) {
        formData.append('purchaseOrderId', purchaseOrderId);
      }

      const response = await axios.post('/api/receiving/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const document = response.data.document;
      setUploadedDocument(document);
      onDocumentUploaded?.(document);

      // Start polling for OCR results
      pollForOCRResults(document.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const pollForOCRResults = async (documentId: string) => {
    setProcessing(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/receiving/documents/${documentId}/ocr`);
        
        if (response.data.isProcessed !== false) {
          clearInterval(pollInterval);
          setProcessing(false);
          setOcrData(response.data.ocrData);
          onOCRComplete?.(response.data.ocrData);
        }
      } catch (err) {
        console.error('Error polling OCR results:', err);
        clearInterval(pollInterval);
        setProcessing(false);
      }
    }, 2000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setProcessing(false);
    }, 120000);
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setUploadedDocument(null);
    setOcrData(null);
    setError(null);
    setUploading(false);
    setProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h3>Document Scanner</h3>
      
      {/* Document Type Selection */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Document Type:
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as any)}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            width: '200px'
          }}
        >
          <option value="delivery_note">Delivery Note</option>
          <option value="invoice">Invoice</option>
          <option value="packing_slip">Packing Slip</option>
        </select>
      </div>

      {/* File Upload or Camera */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Select File
          </button>
          <button
            onClick={handleCameraCapture}
            style={{
              padding: '10px 16px',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Use Camera
          </button>
        </div>

        {/* Camera Video */}
        <div style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              display: videoRef.current?.srcObject ? 'block' : 'none'
            }}
          />
          {videoRef.current?.srcObject && (
            <button
              onClick={capturePhoto}
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '10px 20px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Capture Photo
            </button>
          )}
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {selectedFile && (
          <div style={{ marginTop: '10px', color: '#666' }}>
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={uploadDocument}
          disabled={!selectedFile || uploading}
          style={{
            padding: '12px 24px',
            backgroundColor: uploading ? '#ccc' : '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload & Process'}
        </button>
        
        {uploadedDocument && (
          <button
            onClick={resetScanner}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            Scan Another
          </button>
        )}
      </div>

      {/* Error Display */}
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

      {/* Processing Status */}
      {processing && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e6f7ff', 
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          color: '#1890ff',
          marginBottom: '16px'
        }}>
          Processing document with OCR... This may take a moment.
        </div>
      )}

      {/* Upload Success */}
      {uploadedDocument && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          color: '#52c41a',
          marginBottom: '16px'
        }}>
          Document uploaded successfully: {uploadedDocument.fileName}
        </div>
      )}

      {/* OCR Results */}
      {ocrData && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f9f9f9', 
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <h4>Extracted Information:</h4>
          <div style={{ marginBottom: '8px' }}>
            <strong>Document Number:</strong> {ocrData.documentNumber || 'Not found'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Supplier:</strong> {ocrData.supplierName || 'Not found'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Date:</strong> {ocrData.date || 'Not found'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Total Amount:</strong> {ocrData.totalAmount ? `$${ocrData.totalAmount.toFixed(2)}` : 'Not found'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Confidence:</strong> {ocrData.confidence ? `${(ocrData.confidence * 100).toFixed(1)}%` : 'N/A'}
          </div>
          
          {ocrData.items && ocrData.items.length > 0 && (
            <div>
              <strong>Items Found:</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                {ocrData.items.map((item, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    {item.description} 
                    {item.quantity && ` (Qty: ${item.quantity})`}
                    {item.unitPrice && ` - $${item.unitPrice.toFixed(2)}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentScannerComponent;