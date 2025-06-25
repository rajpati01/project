// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3001/api';

// Login API call
// export const login = async (credentials) => {
//   const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
//   return response.data;
// };

// Signup API call
// export const signup = async (userData) => {
//   const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
//   return response.data;
// };

/**
 * RTK Query API slice for authentication-related endpoints.
 *
 * Provides endpoints for user registration, login, logout, profile management,
 * password operations, email verification, and token refresh.
 *
 * Endpoints:
 * - register: Register a new user. Stores token and user data in localStorage on success.
 * - login: Authenticate user credentials. Stores token and user data in localStorage on success.
 * - logout: Logs out the current user, clears localStorage and Redux state.
 * - getProfile: Fetches the current user's profile. Clears localStorage if unauthorized.
 * - updateProfile: Updates the user's profile and updates localStorage.
 * - changePassword: Changes the user's password.
 * - forgotPassword: Initiates password reset via email.
 * - resetPassword: Resets the user's password using a token.
 * - verifyEmail: Verifies the user's email and updates localStorage.
 * - resendVerificationEmail: Resends the email verification link.
 * - refreshToken: Refreshes the authentication token and updates localStorage.
 *
 * Each endpoint handles API responses and errors, updating localStorage and Redux state as needed.
 *
 * @constant
 * @type {import('@reduxjs/toolkit/query').Api}
 */

import { baseApi } from '../../services/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register endpoint
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
      transformResponse: (response) => {
        // Store token and user data in localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Registration failed',
          errors: response.data?.errors || []
        };
      },
    }),

    // Login endpoint
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
      transformResponse: (response) => {
        // Store token and user data in localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Login failed',
          errors: response.data?.errors || []
        };
      },
    }),

    // Logout endpoint
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          // Clear local storage regardless of API response
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Dispatch logout action to clear Redux state
          dispatch({ type: 'auth/logout' });
        }
      },
    }),

    // Get current user profile
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['Auth', 'User'],
      transformErrorResponse: (response) => {
        // If unauthorized, clear stored data
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        return response;
      },
    }),

    // Update user profile
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
      transformResponse: (response) => {
        // Update user data in localStorage
        if (response.user) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = { ...currentUser, ...response.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response;
      },
    }),

    // Change password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: passwordData,
      }),
      invalidatesTags: ['Auth'],
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Password change failed',
          errors: response.data?.errors || []
        };
      },
    }),

    // Forgot password
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Password reset request failed',
        };
      },
    }),

    // Reset password
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { password },
      }),
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Password reset failed',
          errors: response.data?.errors || []
        };
      },
    }),

    // Verify email
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `/auth/verify-email/${token}`,
        method: 'GET',
      }),
      invalidatesTags: ['Auth'],
      transformResponse: (response) => {
        // Update user verification status in localStorage
        if (response.user) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = { ...currentUser, isEmailVerified: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response;
      },
    }),

    // Resend verification email
    resendVerificationEmail: builder.mutation({
      query: () => ({
        url: '/auth/resend-verification',
        method: 'POST',
      }),
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Failed to resend verification email',
        };
      },
    }),

    // Refresh token
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
      transformResponse: (response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return response;
      },
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in functional components
export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useRefreshTokenMutation,
} = authApi;