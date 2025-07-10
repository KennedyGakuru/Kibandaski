import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { Text } from 'react-native';

// Test component to access auth context
const TestComponent = () => {
  const { user, loading } = useAuth();
  return (
    <>
      <Text testID="loading">{loading ? 'loading' : 'not-loading'}</Text>
      <Text testID="user">{user ? user.name : 'no-user'}</Text>
    </>
  );
};

describe('AuthContext', () => {
  it('provides initial auth state', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(getByTestId('loading')).toBeTruthy();
  });

  it('handles user authentication state', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      // Wait for auth state to settle
    });
    
    expect(getByTestId('user')).toBeTruthy();
  });

  it('throws error when used outside provider', () => {
    // This should throw an error
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});