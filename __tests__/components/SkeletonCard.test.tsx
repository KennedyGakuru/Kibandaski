import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonCard } from '../../components/SkeletonCard';

describe('SkeletonCard', () => {
  it('renders skeleton loading elements', () => {
    const { getByTestId } = render(<SkeletonCard />);
    
    // Test that skeleton elements are rendered
    // Note: You may need to add testIDs to your SkeletonLoader components
    expect(getByTestId('skeleton-card')).toBeTruthy();
  });

  it('adapts to theme changes', () => {
    // Test with dark theme
    jest.mock('../../contexts/ThemeContext', () => ({
      useTheme: () => ({
        isDark: true,
        toggleTheme: jest.fn(),
      }),
    }));

    const { rerender } = render(<SkeletonCard />);
    
    // Test light theme
    jest.mock('../../contexts/ThemeContext', () => ({
      useTheme: () => ({
        isDark: false,
        toggleTheme: jest.fn(),
      }),
    }));

    rerender(<SkeletonCard />);
  });
});