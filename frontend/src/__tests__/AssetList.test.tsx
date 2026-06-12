import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import AssetList from '../components/AssetList';
import * as api from '../api';
import { AssetListResponse } from '../types';

jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

const MOCK_RESPONSE: AssetListResponse = {
  data: [
    {
      id: 'abc-1',
      name: 'Pipe P-0001',
      type: 'pipe',
      status: 'ok',
      lat: 40.74,
      lng: -73.98,
      installed_at: '2024-01-01',
      last_inspected_at: '2025-01-01',
      notes: '',
    },
    {
      id: 'abc-2',
      name: 'Sensor S-0001',
      type: 'sensor',
      status: 'critical',
      lat: 40.75,
      lng: -73.97,
      installed_at: '2023-06-15',
      last_inspected_at: null,
      notes: 'Needs replacement',
    },
  ],
  total: 2,
  page: 1,
  limit: 50,
};

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('AssetList', () => {
  it('renders asset rows after loading', async () => {
    mockedApi.listAssets.mockResolvedValue(MOCK_RESPONSE);

    renderWithQuery(
      <AssetList filters={{}} onFiltersChange={jest.fn()} onSelect={jest.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Pipe P-0001')).toBeInTheDocument();
      expect(screen.getByText('Sensor S-0001')).toBeInTheDocument();
    });
  });

  it('shows total asset count', async () => {
    mockedApi.listAssets.mockResolvedValue(MOCK_RESPONSE);

    renderWithQuery(
      <AssetList filters={{}} onFiltersChange={jest.fn()} onSelect={jest.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText(/2 assets/)).toBeInTheDocument();
    });
  });

  it('calls onSelect when a row is clicked', async () => {
    mockedApi.listAssets.mockResolvedValue(MOCK_RESPONSE);
    const onSelect = jest.fn();

    renderWithQuery(
      <AssetList filters={{}} onFiltersChange={jest.fn()} onSelect={onSelect} />,
    );

    await waitFor(() => screen.getByText('Pipe P-0001'));
    await userEvent.click(screen.getByText('Pipe P-0001'));

    expect(onSelect).toHaveBeenCalledWith(MOCK_RESPONSE.data[0]);
  });

  it('shows loading state initially', () => {
    mockedApi.listAssets.mockReturnValue(new Promise(() => {}));

    renderWithQuery(
      <AssetList filters={{}} onFiltersChange={jest.fn()} onSelect={jest.fn()} />,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    mockedApi.listAssets.mockRejectedValue(new Error('Network error'));

    renderWithQuery(
      <AssetList filters={{}} onFiltersChange={jest.fn()} onSelect={jest.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
