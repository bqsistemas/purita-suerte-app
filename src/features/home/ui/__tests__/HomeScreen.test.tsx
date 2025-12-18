import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { useAuthStore } from '~/features/auth';

jest.mock('~/features/auth', () => ({
  useAuthStore: jest.fn(),
}));

describe('HomeScreen', () => {
  const mockSignOut = jest.fn();
  const mockUser = {
    id: 'user-001',
    displayName: 'Test User',
    email: 'test@example.com',
    tenantId: 'tenant-001',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
      setSignedOut: mockSignOut,
    });
  });

  it('renders welcome message "Hola mundo"', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Hola mundo')).toBeDefined();
  });

  it('displays user display name', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Welcome, Test User!')).toBeDefined();
  });

  it('displays user email', () => {
    render(<HomeScreen />);
    expect(screen.getByText('test@example.com')).toBeDefined();
  });

  it('displays user tenant ID', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Tenant: tenant-001')).toBeDefined();
  });

  it('renders sign out button', () => {
    render(<HomeScreen />);
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeDefined();
  });

  it('calls setSignedOut when sign out button is pressed', async () => {
    render(<HomeScreen />);
    const signOutButton = screen.getByRole('button', { name: /sign out/i });

    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('has accessible labels for all interactive elements', () => {
    render(<HomeScreen />);
    const signOutButton = screen.getByLabelText('Sign out button');
    expect(signOutButton).toBeDefined();
  });

  it('renders all user info in a card layout', () => {
    render(<HomeScreen />);

    // Check that all elements are rendered
    expect(screen.getByText('Hola mundo')).toBeDefined();
    expect(screen.getByText('Welcome, Test User!')).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText('Tenant: tenant-001')).toBeDefined();
  });

  it('handles missing user gracefully', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      setSignedOut: mockSignOut,
    });

    render(<HomeScreen />);

    // Should still show welcome message
    expect(screen.getByText('Hola mundo')).toBeDefined();
    // Should still show sign out button
    expect(screen.getByRole('button', { name: /sign out/i })).toBeDefined();
  });
});
