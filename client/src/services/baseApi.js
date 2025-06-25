/**
 * @fileoverview
 * This file defines the base API configuration for the Redux Toolkit Query (RTK Query) in a React application.
 * It sets up a base query with authentication token handling, automatic re-authentication on 401 errors,
 * and provides a baseApi slice for defining endpoints throughout the app.
 *
 * Features:
 * - Uses `fetchBaseQuery` with a configurable base URL and credentials included for cookie-based authentication.
 * - Automatically attaches a Bearer token from Redux state to the Authorization header if available.
 * - Sets the Content-Type header to 'application/json' for all requests.
 * - Handles 401 Unauthorized errors by dispatching a logout action, clearing persisted authentication data,
 *   and redirecting the user to the login page.
 * - Exports a `baseApi` instance with common tag types for use in endpoint definitions.
 *
 * Environment Variables:
 * - `REACT_APP_API_URL`: Optional. The base URL for API requests. Defaults to 'http://localhost:3001/api' if not set.
 *
 * Tag Types:
 * - User, Auth, Blog, Campaign, WasteClassification, EcoPoints, Notification
 *
 * @module services/baseApi
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  credentials: 'include', // Include cookies for authentication
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = getState().auth?.token;
    
    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Set content type for requests
    headers.set('Content-Type', 'application/json');
    
    return headers;
  },
});

// Base query with re-authentication
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, logout the user and redirect
  if (result?.error && result.error.status === 401) {
    // Dispatch logout action
    api.dispatch({ type: 'auth/logout' });
    
    // Clear any persisted auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Optionally redirect to login page
    window.location.href = '/login';
  }

  return result;
};

// Create the base API slice
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User', 
    'Auth', 
    'Blog', 
    'Campaign', 
    'WasteClassification', 
    'EcoPoints', 
    'Notification'
  ],
  endpoints: () => ({}),
});

export default baseApi;