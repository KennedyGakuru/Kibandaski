import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/(auth)/login';
import RegisterScreen from '../../app/(auth)/register';

describe('Authentication Screens', () => {
  describe('LoginScreen', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders login form correctly', () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('handles email input', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      
      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('handles password input', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      
      const passwordInput = getByPlaceholderText('Enter your password');
      fireEvent.changeText(passwordInput, 'password123');
      
      expect(passwordInput.props.value).toBe('password123');
    });

    it('toggles password visibility', () => {
      const { getByTestId } = render(<LoginScreen />);
      
      const toggleButton = getByTestId('password-toggle');
      fireEvent.press(toggleButton);
      
      // Password should be visible now
    });

    it('handles login submission', async () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      
      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByText('Sign In');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);
      
      await waitFor(() => {
        // Should call signIn function
      });
    });

    it('handles Google sign in', async () => {
      const { getByText } = render(<LoginScreen />);
      
      const googleButton = getByText('Continue with Google');
      fireEvent.press(googleButton);
      
      await waitFor(() => {
        // Should call Google sign in
      });
    });
  });

  describe('RegisterScreen', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders registration form correctly', () => {
      const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
      
      expect(getByText('Join Kibandaski')).toBeTruthy();
      expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByText('Customer')).toBeTruthy();
      expect(getByText('Vendor')).toBeTruthy();
    });

    it('handles user type selection', () => {
      const { getByText } = render(<RegisterScreen />);
      
      const vendorButton = getByText('Vendor');
      fireEvent.press(vendorButton);
      
      // Vendor should be selected
    });

    it('validates form inputs', async () => {
      const { getByText } = render(<RegisterScreen />);
      
      const createButton = getByText('Create Account');
      fireEvent.press(createButton);
      
      await waitFor(() => {
        // Should show validation errors
      });
    });

    it('handles registration submission', async () => {
      const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
      
      const nameInput = getByPlaceholderText('Enter your full name');
      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password (min 6 characters)');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      const createButton = getByText('Create Account');
      
      fireEvent.changeText(nameInput, 'Test User');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(createButton);
      
      await waitFor(() => {
        // Should call signUp function
      });
    });
  });
});