# Purchase Order Receiving Process Documentation

## Overview

The Purchase Order receiving process has been enhanced with comprehensive document scanning, OCR (Optical Character Recognition), and product label scanning capabilities. This functionality streamlines the receiving workflow and improves accuracy in inventory management.

## Key Features

### 1. Document Scanning and Processing

**DocumentScannerComponent** provides:
- Mobile phone camera integration for capturing delivery notes and invoices
- File upload support for images and PDFs
- OCR processing using Tesseract.js to extract structured data
- Automated comparison between PO, delivery note, and invoice
- Real-time processing status updates

**Supported Document Types:**
- Delivery Notes
- Invoices
- Packing Slips

**Extracted Data:**
- Document numbers
- Supplier information
- Dates
- Line items with quantities and prices
- Total amounts

### 2. Product Label Scanning

**ProductScannerComponent** offers:
- Barcode/QR code scanning using device camera
- Support for multiple barcode formats (CODE128, EAN13, UPC, QR, DataMatrix)
- Manual barcode entry as fallback
- Real-time validation against inventory database
- Batch and expiration date tracking

### 3. Batch Tracking

**BatchTrackingView** enables:
- Product expiration date monitoring
- Batch/lot number tracking
- FIFO (First-In-First-Out) inventory management
- Visual indicators for expiring/expired products
- Automatic inventory level updates

### 4. Discrepancy Management

**DiscrepancyResolutionModal** handles:
- Quantity mismatches
- Price discrepancies
- Quality issues
- Missing or extra items
- Resolution tracking and audit trail

## Database Models

### ScannedDocument
```typescript
{
  id: string;
  purchaseOrderId?: string;
  documentType: 'delivery_note' | 'invoice' | 'packing_slip';
  fileName: string;
  filePath: string;
  ocrData?: string; // JSON containing extracted data
  isProcessed: boolean;
  uploadedBy: string;
  uploadedAt: Date;
}
```

### ProductBatch
```typescript
{
  id: string;
  itemId: string;
  batchNumber: string;
  lotNumber?: string;
  expirationDate?: Date;
  manufactureDate?: Date;
  receivedQuantity: number;
  currentQuantity: number;
  supplierBatchId?: string;
  notes?: string;
}
```

### ReceivingDiscrepancy
```typescript
{
  id: string;
  purchaseOrderId: string;
  itemId: string;
  discrepancyType: 'quantity' | 'price' | 'quality' | 'missing_item' | 'extra_item';
  expectedValue: string;
  actualValue: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'cancelled';
  resolution?: string;
  reportedBy: string;
  reportedAt: Date;
}
```

## API Endpoints

### Document Processing
- `POST /api/receiving/documents/upload` - Upload and process documents
- `GET /api/receiving/documents/:id/ocr` - Get OCR processing results

### Barcode Validation
- `POST /api/receiving/barcode/validate` - Validate scanned barcodes

### Batch Management
- `POST /api/receiving/batches` - Create new product batch
- `GET /api/receiving/batches` - Get product batches (with filtering)
- `PATCH /api/receiving/batches/:id/quantity` - Update batch quantities

### Discrepancy Management
- `POST /api/receiving/discrepancies` - Report new discrepancy
- `GET /api/receiving/discrepancies` - Get discrepancies (with filtering)
- `PATCH /api/receiving/discrepancies/:id/resolve` - Resolve discrepancy

### Comparison
- `POST /api/receiving/compare` - Compare PO with scanned documents

## Usage Workflow

### Typical Receiving Process

1. **Start Receiving Session**
   - Navigate to the Receiving Page
   - Optionally enter Purchase Order ID for automatic association

2. **Document Scanning**
   - Use DocumentScannerComponent to capture delivery note
   - OCR automatically extracts item details, quantities, and pricing
   - Review extracted data for accuracy

3. **Product Verification**
   - Scan individual product barcodes using ProductScannerComponent
   - Verify quantities match delivery note
   - Record batch numbers and expiration dates

4. **Discrepancy Handling**
   - If discrepancies are found, report them using the system
   - Add detailed descriptions and expected vs. actual values
   - Assign for investigation and resolution

5. **Batch Tracking**
   - View all batches for expiration monitoring
   - Update quantities as products are used
   - Get alerts for expiring products

## Technical Implementation

### Backend Dependencies
- `multer` - File upload handling
- `tesseract.js` - OCR processing
- `sharp` - Image preprocessing for better OCR results
- `jimp` - Additional image processing

### Frontend Dependencies
- `html5-qrcode` - Barcode scanning
- `@zxing/library` - Enhanced barcode support
- `@zxing/browser` - Browser-specific barcode functions
- `react-camera-pro` - Camera integration

### Security Considerations
- File upload validation (type, size limits)
- Input sanitization for OCR data
- User authentication for all operations
- Audit trail for all changes

## Configuration

### File Upload Limits
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, PDF
- Storage location: `uploads/documents/`

### OCR Settings
- Language: English (configurable)
- Confidence threshold: 80%
- Image preprocessing: Grayscale, normalization

### Barcode Support
- Formats: CODE128, EAN13, UPC, QR, DataMatrix
- Camera permissions required for scanning
- Manual entry fallback available

## Testing

The implementation includes comprehensive tests for:
- Backend API endpoints
- OCR data extraction
- Barcode validation
- Component functionality
- Error handling

Run tests with:
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

## Future Enhancements

Potential improvements include:
- Machine learning for better OCR accuracy
- Integration with supplier APIs for automatic validation
- Mobile app for field operations
- Advanced analytics and reporting
- Multi-language OCR support
- Voice-to-text for notes and descriptions