import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { BarcodeData, ScanResult } from '../../types/receiving';

interface ProductScannerProps {
  onScanResult?: (result: ScanResult) => void;
  onBarcodeValidated?: (data: BarcodeData) => void;
  autoValidate?: boolean;
}

const ProductScannerComponent: React.FC<ProductScannerProps> = ({
  onScanResult,
  onBarcodeValidated,
  autoValidate = true
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<BarcodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivId = 'barcode-scanner';

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
      return true;
    } catch (err) {
      setCameraPermission(false);
      setError('Camera permission denied or camera not available');
      return false;
    }
  };

  const startScanner = async () => {
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);
    setValidationResult(null);

    // Clear any existing scanner
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    const scanner = new Html5QrcodeScanner(
      scannerDivId,
      {
        fps: 10,
        qrbox: { width: 300, height: 200 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    setScanResult(decodedText);
    stopScanner();

    const result: ScanResult = {
      success: true,
      data: {
        code: decodedText,
        format: decodedResult.result?.format || 'UNKNOWN'
      }
    };

    onScanResult?.(result);

    if (autoValidate) {
      await validateBarcode(decodedText, decodedResult.result?.format);
    }
  };

  const onScanFailure = (error: string) => {
    // Don't log every scan failure as it's normal during scanning
    if (!error.includes('NotFoundException')) {
      console.error('Scan failed:', error);
    }
  };

  const validateBarcode = async (code: string, format?: string) => {
    try {
      setError(null);
      
      const response = await axios.post('/api/receiving/barcode/validate', {
        code,
        format: format || 'UNKNOWN'
      });

      if (response.data.valid) {
        setValidationResult(response.data.data);
        onBarcodeValidated?.(response.data.data);
      } else {
        setError('Barcode not found in system');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Validation failed');
    }
  };

  const handleManualEntry = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    setScanResult(manualCode);
    
    const result: ScanResult = {
      success: true,
      data: {
        code: manualCode,
        format: 'MANUAL'
      }
    };

    onScanResult?.(result);

    if (autoValidate) {
      await validateBarcode(manualCode);
    }
  };

  const clearResults = () => {
    setScanResult(null);
    setValidationResult(null);
    setError(null);
    setManualCode('');
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h3>Product Scanner</h3>
      
      {/* Scanner Controls */}
      <div style={{ marginBottom: '16px' }}>
        {!isScanning ? (
          <button
            onClick={startScanner}
            style={{
              padding: '12px 24px',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '10px'
            }}
          >
            Start Camera Scanner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '10px'
            }}
          >
            Stop Scanner
          </button>
        )}

        <button
          onClick={clearResults}
          style={{
            padding: '12px 24px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      {/* Camera Permission Status */}
      {cameraPermission === false && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebe6', 
          border: '1px solid #ffb3b3',
          borderRadius: '4px',
          color: '#d32f2f',
          marginBottom: '16px'
        }}>
          Camera access is required for barcode scanning. Please enable camera permissions and try again.
        </div>
      )}

      {/* Scanner Container */}
      <div 
        id={scannerDivId} 
        style={{ 
          marginBottom: '16px',
          display: isScanning ? 'block' : 'none'
        }}
      />

      {/* Manual Entry */}
      <div style={{ marginBottom: '16px' }}>
        <h4>Manual Entry</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter barcode manually"
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              flex: 1
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualEntry();
              }
            }}
          />
          <button
            onClick={handleManualEntry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Validate
          </button>
        </div>
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

      {/* Scan Result */}
      {scanResult && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#e6f7ff', 
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <h4>Scanned Code:</h4>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '16px',
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            {scanResult}
          </div>
        </div>
      )}

      {/* Validation Result */}
      {validationResult && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '4px'
        }}>
          <h4>Product Information:</h4>
          <div style={{ marginBottom: '8px' }}>
            <strong>Code:</strong> {validationResult.code}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Format:</strong> {validationResult.format}
          </div>
          {validationResult.itemId && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Item ID:</strong> {validationResult.itemId}
            </div>
          )}
          {validationResult.batchNumber && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Batch Number:</strong> {validationResult.batchNumber}
            </div>
          )}
          {validationResult.expirationDate && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Expiration Date:</strong> {validationResult.expirationDate}
            </div>
          )}
          {validationResult.lotNumber && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Lot Number:</strong> {validationResult.lotNumber}
            </div>
          )}
          {validationResult.additionalData && Object.keys(validationResult.additionalData).length > 0 && (
            <div>
              <strong>Additional Data:</strong>
              <pre style={{ 
                marginTop: '8px',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '12px'
              }}>
                {JSON.stringify(validationResult.additionalData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px',
        padding: '12px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>Instructions:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Click "Start Camera Scanner" to begin scanning</li>
          <li>Point your camera at a barcode or QR code</li>
          <li>Alternatively, enter the code manually in the text field</li>
          <li>The system will automatically validate the code if auto-validate is enabled</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductScannerComponent;