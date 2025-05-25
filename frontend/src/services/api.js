//import axios from 'axios';
//import { api } from '../services/api'

//export const api = axios.create({
  //baseURL: import.meta.env.VITE_API_URL,
//});

// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g., http://localhost:5000/api
});

// Add JWT token to headers if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export { api };

