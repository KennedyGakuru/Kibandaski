import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import { Text, TouchableOpacity } from 'react-native';

// Test component to access theme context
const TestComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <>
      <Text testID="theme">{isDark ? 'dark' : 'light'}</Text>
      <TouchableOpacity testID="toggle" onPress={toggleTheme}>
        <Text>Toggle</Text>
      </TouchableOpacity>
    </>
  );
};

describe('ThemeContext', () => {
  it('provides initial theme state', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(getByTestId('theme')).toBeTruthy();
  });

  it('handles theme toggle', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = getByTestId('toggle');
    const themeText = getByTestId('theme');
    
    const initialTheme = themeText.props.children;
    fireEvent.press(toggleButton);
    
    // Theme should have changed
    expect(themeText.props.children).not.toBe(initialTheme);
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
});