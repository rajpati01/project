/**
 * @fileoverview
 * Configures and exports the Redux store for the application, integrating Redux Toolkit, Redux Persist, and RTK Query.
 * 
 * - Sets up root reducer with authentication and API slices.
 * - Persists only the authentication state using redux-persist.
 * - Integrates RTK Query for data fetching and caching.
 * - Configures middleware to handle serializable checks and RTK Query middleware.
 * - Enables Redux DevTools in non-production environments.
 * - Exports the configured store and persistor for use in the application.
 */
// Temporary debug version of store.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers
import authReducer from '../features/auth/authslice';
import { baseApi } from '../services/baseApi';

// Debug transform to see what's being saved/loaded
const debugTransform = {
  in: (inboundState, key) => {
    console.log('SAVING to persist:', key, inboundState);
    return inboundState;
  },
  out: (outboundState, key) => {
    console.log('LOADING from persist:', key, outboundState);
    // Force reset loading states when loading from storage
    if (key === 'auth') {
      const cleanState = {
        ...outboundState,
        isLoading: false,
        error: null
      };
      console.log('CLEANED auth state:', cleanState);
      return cleanState;
    }
    return outboundState;
  }
};

// Auth persist configuration
const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['isLoading', 'error'],
  transforms: [debugTransform]
};

// Root reducer
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  [baseApi.reducerPath]: baseApi.reducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    .concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export default store;