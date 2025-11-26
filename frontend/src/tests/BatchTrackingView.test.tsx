import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import BatchTrackingView from '../components/receiving/BatchTrackingView';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

const mockBatches = [
  {
    id: '1',
    itemId: 'ITM001',
    batchNumber: 'BATCH001',
    receivedQuantity: 100,
    currentQuantity: 80,
    expirationDate: '2024-12-31',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    itemId: 'ITM002',
    batchNumber: 'BATCH002',
    receivedQuantity: 50,
    currentQuantity: 0,
    expirationDate: '2024-06-30',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    itemId: 'ITM001',
    batchNumber: 'BATCH003',
    receivedQuantity: 75,
    currentQuantity: 75,
    expirationDate: '2023-12-31', // Expired
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z'
  }
];

describe('BatchTrackingView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current date to make expiration tests predictable
    vi.setSystemTime(new Date('2024-01-20T10:00:00Z'));
  });

  it('renders the batch tracking component', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockBatches });

    render(<BatchTrackingView />);
    
    expect(screen.getByText('Batch Tracking')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Show only expiring/expired')).toBeInTheDocument();
  });

  it('fetches and displays batches', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockBatches });

    render(<BatchTrackingView />);
    
    await waitFor(() => {
      expect(screen.getByText('BATCH001')).toBeInTheDocument();
      expect(screen.getByText('BATCH002')).toBeInTheDocument();
      expect(screen.getByText('BATCH003')).toBeInTheDocument();
    });

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/receiving/batches', { params: {} });
  });

  it('filters batches by itemId when provided', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockBatches.filter(b => b.itemId === 'ITM001') });

    render(<BatchTrackingView itemId="ITM001" />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/receiving/batches', {
        params: { itemId: 'ITM001' }
      });
    });
  });

  it('shows correct batch status colors and labels', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockBatches });

    render(<BatchTrackingView />);
    
    await waitFor(() => {
      // Active batch
      expect(screen.getByText('Active')).toBeInTheDocument();
      // Depleted batch (quantity = 0)
      expect(screen.getByText('Depleted')).toBeInTheDocument();
      // Expired batch
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });
  });

  it('displays summary statistics', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockBatches });

    render(<BatchTrackingView />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Batches')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Expired')).toBeInTheDocument();
      expect(screen.getByText('Depleted')).toBeInTheDocument();
    });
  });

  it('filters for expiring/expired batches when checkbox is checked', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockBatches });

    render(<BatchTrackingView />);
    
    await waitFor(() => {
      expect(screen.getByText('BATCH001')).toBeInTheDocument();
      expect(screen.getByText('BATCH002')).toBeInTheDocument();
      expect(screen.getByText('BATCH003')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Show only expiring/expired');
    fireEvent.click(checkbox);
    
    // Should only show expired batch (BATCH003)
    expect(screen.getByText('BATCH003')).toBeInTheDocument();
    expect(screen.queryByText('BATCH001')).not.toBeInTheDocument();
    expect(screen.queryByText('BATCH002')).not.toBeInTheDocument();
  });

  it('calls onBatchSelect when a batch is clicked', async () => {
    const mockOnBatchSelect = vi.fn();
    mockedAxios.get.mockResolvedValue({ data: mockBatches });

    render(<BatchTrackingView onBatchSelect={mockOnBatchSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('BATCH001')).toBeInTheDocument();
    });

    const batchCard = screen.getByText('BATCH001').closest('div');
    fireEvent.click(batchCard!);
    
    expect(mockOnBatchSelect).toHaveBeenCalledWith(mockBatches[0]);
  });

  it('refreshes data when refresh button is clicked', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockBatches });

    render(<BatchTrackingView />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  it('handles loading state', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<BatchTrackingView />);
    
    expect(screen.getByText('Loading batches...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { data: { message: 'Failed to fetch batches' } }
    });

    render(<BatchTrackingView />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch batches')).toBeInTheDocument();
    });
  });

  it('shows no batches message when list is empty', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<BatchTrackingView />);
    
    await waitFor(() => {
      expect(screen.getByText('No batches found')).toBeInTheDocument();
    });
  });

  it('shows no expiring batches message when filtered list is empty', async () => {
    // Mock only active batches (no expiring/expired)
    const activeBatches = [{
      id: '1',
      itemId: 'ITM001',
      batchNumber: 'BATCH001',
      receivedQuantity: 100,
      currentQuantity: 80,
      expirationDate: '2025-12-31', // Far future
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }];

    mockedAxios.get.mockResolvedValue({ data: activeBatches });

    render(<BatchTrackingView />);
    
    await waitFor(() => {
      expect(screen.getByText('BATCH001')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Show only expiring/expired');
    fireEvent.click(checkbox);
    
    expect(screen.getByText('No expiring or expired batches found')).toBeInTheDocument();
  });
});