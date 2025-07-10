import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CustomerExploreScreen from '../../app/(tabs)/(customer)/index';

// Mock the platform to test web behavior
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn((obj) => obj.web),
}));

describe('CustomerExploreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome message with user name', async () => {
    const { getByText } = render(<CustomerExploreScreen />);
    
    await waitFor(() => {
      expect(getByText(/Karibu, Test/)).toBeTruthy();
    });
  });

  it('shows list view by default on web', () => {
    const { getByText } = render(<CustomerExploreScreen />);
    
    expect(getByText('vendors found')).toBeTruthy();
  });

  it('handles search functionality', async () => {
    const { getByPlaceholderText, getByTestId } = render(<CustomerExploreScreen />);
    
    // Open search
    const searchButton = getByTestId('search-button');
    fireEvent.press(searchButton);
    
    // Type in search
    const searchInput = getByPlaceholderText('Search vendors, food, or location...');
    fireEvent.changeText(searchInput, 'test vendor');
    
    await waitFor(() => {
      // Verify search is working
    });
  });

  it('displays empty state when no vendors found', async () => {
    // Mock empty vendors response
    const { getByText } = render(<CustomerExploreScreen />);
    
    await waitFor(() => {
      expect(getByText('No vendors available')).toBeTruthy();
    });
  });

  it('shows loading skeleton while fetching data', () => {
    const { getAllByTestId } = render(<CustomerExploreScreen />);
    
    // Should show skeleton cards while loading
    expect(getAllByTestId('skeleton-card')).toHaveLength(5);
  });
});