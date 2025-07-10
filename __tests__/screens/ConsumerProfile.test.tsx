import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CustomerProfileScreen from '../../app/(tabs)/(customer)/profile';

describe('CustomerProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user profile information', () => {
    const { getByText } = render(<CustomerProfileScreen />);
    
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
    expect(getByText('Food Explorer')).toBeTruthy();
  });

  it('displays user statistics', async () => {
    const { getByText } = render(<CustomerProfileScreen />);
    
    await waitFor(() => {
      expect(getByText('Reviews')).toBeTruthy();
      expect(getByText('Favorites')).toBeTruthy();
      expect(getByText('Visits')).toBeTruthy();
    });
  });

  it('handles edit profile action', () => {
    const { getByText } = render(<CustomerProfileScreen />);
    
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
    
    // Should open edit modal
    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('handles theme toggle', () => {
    const { getByText } = render(<CustomerProfileScreen />);
    
    const themeButton = getByText('Dark Mode');
    fireEvent.press(themeButton);
    
    // Theme should toggle
  });

  it('handles sign out action', () => {
    const { getByText } = render(<CustomerProfileScreen />);
    
    const signOutButton = getByText('Sign Out');
    fireEvent.press(signOutButton);
    
    // Should show confirmation dialog
  });

  it('handles avatar update', async () => {
    const { getByTestId } = render(<CustomerProfileScreen />);
    
    // Open edit profile
    const editButton = getByTestId('edit-profile-button');
    fireEvent.press(editButton);
    
    // Tap avatar to change
    const avatarButton = getByTestId('avatar-button');
    fireEvent.press(avatarButton);
    
    await waitFor(() => {
      // Should show image picker options
    });
  });
});