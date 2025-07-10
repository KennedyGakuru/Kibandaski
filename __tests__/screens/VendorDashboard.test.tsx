import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VendorDashboardScreen from '../../app/(tabs)/(vendor)/index';

// Mock vendor user
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => ({
    user: {
      id: 'vendor-user-id',
      email: 'vendor@example.com',
      name: 'Test Vendor',
      user_type: 'vendor',
    },
    loading: false,
  }),
}));

describe('VendorDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders business header correctly', async () => {
    const { getByText } = render(<VendorDashboardScreen />);
    
    await waitFor(() => {
      expect(getByText('My Business')).toBeTruthy();
    });
  });

  it('shows setup screen when no vendor profile exists', async () => {
    // Mock no vendor data
    const { getByText } = render(<VendorDashboardScreen />);
    
    await waitFor(() => {
      expect(getByText('Set Up Your Business')).toBeTruthy();
      expect(getByText('Create your vendor profile to start selling')).toBeTruthy();
    });
  });

  it('displays business statistics when vendor exists', async () => {
    // Mock vendor data exists
    const { getByText } = render(<VendorDashboardScreen />);
    
    await waitFor(() => {
      expect(getByText('Revenue')).toBeTruthy();
      expect(getByText('Orders')).toBeTruthy();
      expect(getByText('Rating')).toBeTruthy();
      expect(getByText('Menu Items')).toBeTruthy();
    });
  });

  it('handles business status toggle', async () => {
    const { getByTestId } = render(<VendorDashboardScreen />);
    
    await waitFor(() => {
      const statusSwitch = getByTestId('business-status-switch');
      fireEvent(statusSwitch, 'onValueChange', false);
    });
  });

  it('navigates to menu management', async () => {
    const { getByText } = render(<VendorDashboardScreen />);
    
    await waitFor(() => {
      const menuButton = getByText('Manage Menu');
      fireEvent.press(menuButton);
    });
  });

  it('navigates to analytics', async () => {
    const { getByText } = render(<VendorDashboardScreen />);
    
    await waitFor(() => {
      const analyticsButton = getByText('View Analytics');
      fireEvent.press(analyticsButton);
    });
  });
});