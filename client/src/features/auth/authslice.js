/**
 * @file authSlice.js
 * @description Redux slice for authentication state management using Redux Toolkit.
 * Handles user authentication, registration, login, logout, profile updates, email verification,
 * and token refresh. Syncs authentication state with localStorage for persistence.
 *
 * Exports:
 * - Redux slice reducer for authentication.
 * - Action creators: logout, clearError, setLoading, updateUser, setEmailVerified.
 * - Selectors: selectCurrentUser, selectCurrentToken, selectIsAuthenticated, selectAuthLoading, selectAuthError, selectIsEmailVerified.
 *
 * State Shape:
 * {
 *   user: {Object|null},              // Authenticated user object or null
 *   token: {string|null},             // JWT token or null
 *   isAuthenticated: {boolean},       // Whether user is authenticated
 *   isLoading: {boolean},             // Loading state for async actions
 *   error: {string|null},             // Error message if any
 *   isEmailVerified: {boolean},       // Whether user's email is verified
 * }
 *
 * Side Effects:
 * - Reads from and writes to localStorage for 'token' and 'user' keys.
 * - Handles corrupted localStorage data gracefully.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 * - ./authApi (RTK Query API slice)
 */


import { createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isEmailVerified: false,
};

// Helper function to get initial auth state from localStorage
const getInitialAuthState = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const parsedUser = JSON.parse(user);
      return {
        ...initialState,
        token,
        user: parsedUser,
        isAuthenticated: true,
        isEmailVerified: parsedUser.isEmailVerified || false,
      };
    }
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  return initialState;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    // Manual logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isEmailVerified = false;
      state.error = null;
      state.isLoading = false;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    // Clear error action
    clearError: (state) => {
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Update user data
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // Set email verification status
    setEmailVerified: (state, action) => {
      state.isEmailVerified = action.payload;
      if (state.user) {
        state.user.isEmailVerified = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    // Register cases
    builder
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload.user?.isEmailVerified || false;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
        state.isAuthenticated = false;
      });

    // Login cases
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload.user?.isEmailVerified || false;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
        state.isAuthenticated = false;
      });

    // Logout cases
    builder
      .addMatcher(authApi.endpoints.logout.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.isLoading = false;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.logout.matchRejected, (state) => {
        // Even if logout fails on server, clear local state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.isLoading = false;
      });

    // Get profile cases
    builder
      .addMatcher(authApi.endpoints.getProfile.matchFulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload.user };
        state.isEmailVerified = action.payload.user?.isEmailVerified || false;
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addMatcher(authApi.endpoints.getProfile.matchRejected, (state, action) => {
        // If profile fetch fails due to invalid token, logout
        if (action.payload?.status === 401) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isEmailVerified = false;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      });

    // Update profile cases
    builder
      .addMatcher(authApi.endpoints.updateProfile.matchFulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload.user };
        localStorage.setItem('user', JSON.stringify(state.user));
      });

    // Verify email cases
    builder
      .addMatcher(authApi.endpoints.verifyEmail.matchFulfilled, (state, action) => {
        state.isEmailVerified = true;
        if (state.user) {
          state.user.isEmailVerified = true;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      });

    // Change password cases
    builder
      .addMatcher(authApi.endpoints.changePassword.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.changePassword.matchFulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.changePassword.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Password change failed';
      });

    // Refresh token cases
    builder
      .addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (state, action) => {
        state.token = action.payload.token;
      });
  },
});

export const { 
  logout, 
  clearError, 
  setLoading, 
  updateUser, 
  setEmailVerified 
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsEmailVerified = (state) => state.auth.isEmailVerified;