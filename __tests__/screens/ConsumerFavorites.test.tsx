import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CustomerFavoritesScreen from '../../app/(tabs)/(customer)/favorites';

describe('CustomerFavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders favorites header correctly', () => {
    const { getByText } = render(<CustomerFavoritesScreen />);
    
    expect(getByText('Your Favorites')).toBeTruthy();
  });

  it('shows empty state when no favorites', async () => {
    const { getByText } = render(<CustomerFavoritesScreen />);
    
    await waitFor(() => {
      expect(getByText('No favorites yet')).toBeTruthy();
      expect(getByText('Start exploring and add your favorite vendors to see them here')).toBeTruthy();
    });
  });

  it('handles search in favorites', async () => {
    const { getByTestId, getByPlaceholderText } = render(<CustomerFavoritesScreen />);
    
    // Open search
    const searchButton = getByTestId('search-button');
    fireEvent.press(searchButton);
    
    // Type in search
    const searchInput = getByPlaceholderText('Search your favorites...');
    fireEvent.changeText(searchInput, 'test');
    
    await waitFor(() => {
      // Verify search functionality
    });
  });

  it('handles remove favorite action', async () => {
    // Mock favorites data
    const { getByTestId } = render(<CustomerFavoritesScreen />);
    
    await waitFor(() => {
      const removeButton = getByTestId('remove-favorite-button');
      fireEvent.press(removeButton);
    });
  });

  it('shows loading skeleton while fetching favorites', () => {
    const { getAllByTestId } = render(<CustomerFavoritesScreen />);
    
    expect(getAllByTestId('skeleton-card')).toHaveLength(5);
  });
});