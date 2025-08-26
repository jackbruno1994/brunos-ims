import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ProductScannerComponent from '../components/receiving/ProductScannerComponent';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Mock html5-qrcode
vi.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    clear: vi.fn()
  }))
}));

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    })
  }
});

describe('ProductScannerComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the scanner component', () => {
    render(<ProductScannerComponent />);
    
    expect(screen.getByText('Product Scanner')).toBeInTheDocument();
    expect(screen.getByText('Start Camera Scanner')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter barcode manually')).toBeInTheDocument();
  });

  it('allows manual barcode entry', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        valid: true,
        data: {
          code: 'TEST123',
          format: 'MANUAL',
          itemId: 'ITM001'
        }
      }
    });

    render(<ProductScannerComponent />);
    
    const input = screen.getByPlaceholderText('Enter barcode manually');
    const validateButton = screen.getByText('Validate');
    
    fireEvent.change(input, { target: { value: 'TEST123' } });
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/receiving/barcode/validate', {
        code: 'TEST123',
        format: 'UNKNOWN'
      });
    });
  });

  it('shows validation results', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        valid: true,
        data: {
          code: 'TEST123',
          format: 'CODE128',
          itemId: 'ITM001',
          batchNumber: 'BATCH001'
        }
      }
    });

    render(<ProductScannerComponent />);
    
    const input = screen.getByPlaceholderText('Enter barcode manually');
    const validateButton = screen.getByText('Validate');
    
    fireEvent.change(input, { target: { value: 'TEST123' } });
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Product Information:')).toBeInTheDocument();
      expect(screen.getByText('TEST123')).toBeInTheDocument();
      expect(screen.getByText('CODE128')).toBeInTheDocument();
      expect(screen.getByText('ITM001')).toBeInTheDocument();
      expect(screen.getByText('BATCH001')).toBeInTheDocument();
    });
  });

  it('handles validation errors', async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        data: {
          message: 'Barcode not found'
        }
      }
    });

    render(<ProductScannerComponent />);
    
    const input = screen.getByPlaceholderText('Enter barcode manually');
    const validateButton = screen.getByText('Validate');
    
    fireEvent.change(input, { target: { value: 'INVALID123' } });
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Barcode not found')).toBeInTheDocument();
    });
  });

  it('clears results when clear button is clicked', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        valid: true,
        data: {
          code: 'TEST123',
          format: 'CODE128'
        }
      }
    });

    render(<ProductScannerComponent />);
    
    // Enter and validate a barcode
    const input = screen.getByPlaceholderText('Enter barcode manually');
    const validateButton = screen.getByText('Validate');
    
    fireEvent.change(input, { target: { value: 'TEST123' } });
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Product Information:')).toBeInTheDocument();
    });
    
    // Clear results
    const clearButton = screen.getByText('Clear Results');
    fireEvent.click(clearButton);
    
    expect(screen.queryByText('Product Information:')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('shows error for empty barcode', async () => {
    render(<ProductScannerComponent />);
    
    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a barcode')).toBeInTheDocument();
    });
  });
});