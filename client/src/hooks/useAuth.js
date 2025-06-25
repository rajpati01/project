
/**
 * Custom React hook for authentication and user profile management.
 * 
 * This hook provides state and actions for authentication flows, including login, registration,
 * logout, profile updates, password management, and email verification. It integrates with Redux
 * and RTK Query for state management and API interactions.
 * 
 * @module useAuth
 * 
 * @returns {Object} Auth hook API
 * @returns {Object} return.user - The current authenticated user object, or null if not authenticated.
 * @returns {string|null} return.token - The current authentication token, or null if not authenticated.
 * @returns {boolean} return.isAuthenticated - Whether the user is authenticated.
 * @returns {boolean} return.isLoading - Whether any authentication-related operation is loading.
 * @returns {string|null} return.error - The latest authentication error message, if any.
 * @returns {boolean} return.isEmailVerified - Whether the user's email is verified.
 * @returns {Function} return.login - Function to log in a user. Accepts credentials object.
 * @returns {Function} return.register - Function to register a new user. Accepts user data object.
 * @returns {Function} return.logout - Function to log out the current user.
 * @returns {Function} return.updateProfile - Function to update the user's profile. Accepts user data object.
 * @returns {Function} return.changePassword - Function to change the user's password. Accepts password data object.
 * @returns {Function} return.forgotPassword - Function to request a password reset. Accepts email.
 * @returns {Function} return.resetPassword - Function to reset the user's password. Accepts token and new password.
 * @returns {Function} return.verifyEmail - Function to verify the user's email. Accepts verification token.
 * @returns {Function} return.resendVerificationEmail - Function to resend the email verification link.
 * @returns {Function} return.clearAuthError - Function to clear authentication errors.
 * @returns {Function} return.refetchProfile - Function to manually refetch the user's profile.
 * @returns {boolean} return.isLoginLoading - Whether the login operation is loading.
 * @returns {boolean} return.isRegisterLoading - Whether the registration operation is loading.
 * @returns {boolean} return.isLogoutLoading - Whether the logout operation is loading.
 * @returns {boolean} return.isUpdateLoading - Whether the profile update operation is loading.
 * @returns {boolean} return.isChangePasswordLoading - Whether the password change operation is loading.
 * @returns {boolean} return.isForgotPasswordLoading - Whether the forgot password operation is loading.
 * @returns {boolean} return.isResetPasswordLoading - Whether the reset password operation is loading.
 * @returns {boolean} return.isVerifyEmailLoading - Whether the email verification operation is loading.
 * @returns {boolean} return.isResendLoading - Whether the resend verification email operation is loading.
 * @returns {boolean} return.isProfileLoading - Whether the profile query is loading.
 * 
 * @example
 * const {
 *   user, isAuthenticated, login, logout, register, updateProfile,
 *   changePassword, forgotPassword, resetPassword, verifyEmail,
 *   resendVerificationEmail, clearAuthError, refetchProfile, isLoading, error
 * } = useAuth();
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} from '../features/auth/authApi';
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsEmailVerified,
  logout as logoutAction,
  clearError,
} from '../features/auth/authslice';

export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isEmailVerified = useSelector(selectIsEmailVerified);

  // RTK Query mutations and queries
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [updateProfileMutation, { isLoading: isUpdateLoading }] = useUpdateProfileMutation();
  const [changePasswordMutation, { isLoading: isChangePasswordLoading }] = useChangePasswordMutation();
  const [forgotPasswordMutation, { isLoading: isForgotPasswordLoading }] = useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetPasswordLoading }] = useResetPasswordMutation();
  const [verifyEmailMutation, { isLoading: isVerifyEmailLoading }] = useVerifyEmailMutation();
  const [resendVerificationMutation, { isLoading: isResendLoading }] = useResendVerificationEmailMutation();

  // Get profile query (only if authenticated)
  const { 
    data: profileData, 
    isLoading: isProfileLoading,
    refetch: refetchProfile 
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !token,
  });

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const result = await loginMutation(credentials).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed',
        errors: error.errors || []
      };
    }
  }, [loginMutation]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const result = await registerMutation(userData).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed',
        errors: error.errors || []
      };
    }
  }, [registerMutation]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
      return { success: true };
    } catch (error) {
      // Even if server logout fails, clear local state
      dispatch(logoutAction());
      return { success: true };
    }
  }, [logoutMutation, dispatch]);

  // Update profile function
  const updateProfile = useCallback(async (userData) => {
    try {
      const result = await updateProfileMutation(userData).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Profile update failed' 
      };
    }
  }, [updateProfileMutation]);

  // Change password function
  const changePassword = useCallback(async (passwordData) => {
    try {
      const result = await changePasswordMutation(passwordData).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Password change failed',
        errors: error.errors || []
      };
    }
  }, [changePasswordMutation]);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      const result = await forgotPasswordMutation(email).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Password reset request failed' 
      };
    }
  }, [forgotPasswordMutation]);

  // Reset password function
  const resetPassword = useCallback(async (token, password) => {
    try {
      const result = await resetPasswordMutation({ token, password }).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Password reset failed',
        errors: error.errors || []
      };
    }
  }, [resetPasswordMutation]);

  // Verify email function
  const verifyEmail = useCallback(async (token) => {
    try {
      const result = await verifyEmailMutation(token).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Email verification failed' 
      };
    }
  }, [verifyEmailMutation]);

  // Resend verification email function
  const resendVerificationEmail = useCallback(async () => {
    try {
      const result = await resendVerificationMutation().unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to resend verification email' 
      };
    }
  }, [resendVerificationMutation]);

  // Clear error function
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if any auth operation is loading
  const isAnyLoading = isLoading || 
    isLoginLoading || 
    isRegisterLoading || 
    isLogoutLoading || 
    isUpdateLoading || 
    isChangePasswordLoading || 
    isForgotPasswordLoading || 
    isResetPasswordLoading || 
    isVerifyEmailLoading || 
    isResendLoading || 
    isProfileLoading;

  // Auto-refresh profile when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !profileData) {
      refetchProfile();
    }
  }, [isAuthenticated, token, profileData, refetchProfile]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading: isAnyLoading,
    error,
    isEmailVerified,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    clearAuthError,
    refetchProfile,
    
    // Loading states for specific operations
    isLoginLoading,
    isRegisterLoading,
    isLogoutLoading,
    isUpdateLoading,
    isChangePasswordLoading,
    isForgotPasswordLoading,
    isResetPasswordLoading,
    isVerifyEmailLoading,
    isResendLoading,
    isProfileLoading,
  };
};