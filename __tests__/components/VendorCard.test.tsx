import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VendorCard } from '../../components/VendorCard';

const mockVendor = {
  id: 'vendor-1',
  user_id: 'user-1',
  name: 'Test Vendor',
  description: 'A great test vendor',
  latitude: -1.2921,
  longitude: 36.8219,
  address: '123 Test Street',
  phone: '+254700123456',
  is_open: true,
  rating: 4.5,
  total_reviews: 10,
  image_url: 'https://example.com/image.jpg',
  created_at: '2023-01-01T00:00:00Z',
};

const mockOnClose = jest.fn();

describe('VendorCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders vendor information correctly', () => {
    const { getByText } = render(
      <VendorCard vendor={mockVendor} onClose={mockOnClose} />
    );

    expect(getByText('Test Vendor')).toBeTruthy();
    expect(getByText('A great test vendor')).toBeTruthy();
    expect(getByText('123 Test Street')).toBeTruthy();
    expect(getByText('4.5')).toBeTruthy();
    expect(getByText('(10 reviews)')).toBeTruthy();
    expect(getByText('Open')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByTestId } = render(
      <VendorCard vendor={mockVendor} onClose={mockOnClose} />
    );

    // Assuming the close button has a testID
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows closed status for closed vendors', () => {
    const closedVendor = { ...mockVendor, is_open: false };
    const { getByText } = render(
      <VendorCard vendor={closedVendor} onClose={mockOnClose} />
    );

    expect(getByText('Closed')).toBeTruthy();
  });

  it('handles favorite toggle', async () => {
    const { getByTestId } = render(
      <VendorCard vendor={mockVendor} onClose={mockOnClose} />
    );

    const favoriteButton = getByTestId('favorite-button');
    fireEvent.press(favoriteButton);

    // Test that the favorite action is triggered
    await waitFor(() => {
      // Add assertions based on your implementation
    });
  });
});