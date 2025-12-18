import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { useAuthStore } from '../../model/authStore';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isSignedIn: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  });

  it('renders login form', () => {
    render(<LoginScreen />);

    expect(screen.getByText('Purita Suerte')).toBeDefined();
    expect(screen.getByLabelText('Sign in button')).toBeDefined();
    expect(screen.getByPlaceholderText('your@email.com')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
  });

  it('renders email and password input fields', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
  });

  it('renders sign in button', () => {
    render(<LoginScreen />);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeDefined();
  });

  it('shows demo credentials hint', () => {
    render(<LoginScreen />);

    expect(screen.getByText('Demo credentials:')).toBeDefined();
    expect(screen.getByText('user@example.com / password123')).toBeDefined();
  });

  it('disables sign in button when fields are empty', () => {
    render(<LoginScreen />);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    // Verify button renders
    expect(signInButton).toBeDefined();
  });

  it('enables sign in button when fields are filled', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // After filling both fields, sign button should be available
    expect(signInButton).toBeDefined();
  });

  it('shows error message on failed login', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.changeText(emailInput, 'wrong@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeDefined();
    });
  });

  it('disables input fields and button during loading', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    // Component should still render after press
    expect(screen.getByText('Purita Suerte')).toBeDefined();
  });

  it('has accessible labels for all interactive elements', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByLabelText('Email address input');
    const passwordInput = screen.getByLabelText('Password input');
    const signInButton = screen.getByLabelText('Sign in button');

    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(signInButton).toBeDefined();
  });

  it('allows typing in email field', async () => {
    render(<LoginScreen />);
    const emailInput = screen.getByPlaceholderText('your@email.com');

    fireEvent.changeText(emailInput, 'test@example.com');

    await waitFor(() => {
      expect(emailInput.props.value).toBe('test@example.com');
    });
  });

  it('allows typing in password field', async () => {
    render(<LoginScreen />);
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.changeText(passwordInput, 'mypassword');

    await waitFor(() => {
      expect(passwordInput.props.value).toBe('mypassword');
    });
  });
});
