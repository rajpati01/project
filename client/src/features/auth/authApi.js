import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Login API call
export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  return response.data;
};

// Signup API call
export const signup = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
  return response.data;
};