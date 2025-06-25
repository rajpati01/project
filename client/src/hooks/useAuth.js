import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, signupUser, logout, clearError } from '../features/auth/authslice';

// Custom hook to manage authentication logic
export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Get auth state from Redux store
  const { user, token, isAuthenticated, isLoading, error  } = useSelector(state => state.auth);
  // Login function - dispatches loginUser action
  const login = useCallback(async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    return result; // Return result so component can handle success/failure
  }, [dispatch]);

  // Signup function - dispatches signupUser action
  const signup = useCallback(async (userData) => {
    const result = await dispatch(signupUser(userData));
    return result;
  }, [dispatch]);

  // const signup = (userData) => dispatch(signupUser(userData));

  // Logout function - dispatches logout action
  const handleLogout = useCallback(() => {
    dispatch(logout());
    // Clear token from localStorage for now (we'll improve this later)
    localStorage.removeItem('token');
  }, [dispatch]);

  // Clear error function - useful for dismissing error messages
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Return all auth-related state and functions
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout: handleLogout,
    clearAuthError
  };
};