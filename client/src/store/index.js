import {configureStore} from '@reduxjs/toolkit'
import authSlice from '../features/auth/authslice'

// We'll import slices here as we create them
// import authSlice from './slices/authSlice';


const store = configureStore({
    reducer: {
        auth: authSlice,
  },
  devTools: process.env.NODE_ENV !== 'production',
})

export default store;