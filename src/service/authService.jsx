// src/services/authService.js

import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Configure axios to use the token with every request
const setupAxiosInterceptors = (token) => {
    axios.interceptors.request.use(
        config => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );
    
    // Handle token expiration
    axios.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;
            
            // If the error is 401 and we haven't already tried to refresh
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                try {
                    // Try to refresh the token
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        const response = await axios.post(`${API_URL}/auth/refresh`, { 
                            refreshToken 
                        });
                        
                        const newToken = response.data.token;
                        localStorage.setItem('authToken', newToken);
                        
                        // Retry the original request with the new token
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    }
                } catch (refreshError) {
                    // If refresh fails, logout user
                    authService.logout();
                    return Promise.reject(refreshError);
                }
            }
            
            return Promise.reject(error);
        }
    );
};

const authService = {
    login: async (username, password) => {
        const response = await axios.post(`${API_URL}/auth/login`, {
            username,
            password
        });
        
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            
            // If the API returns a refresh token, store it too
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            setupAxiosInterceptors(response.data.token);
        }
        
        return response.data;
    },
    
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        // Optionally call a logout endpoint
        // window.location.href = '/';
    },
    
    getCurrentToken: () => {
        return localStorage.getItem('authToken');
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },
    
    // Initialize axios with existing token on app startup
    initializeAuth: () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setupAxiosInterceptors(token);
            return true;
        }
        return false;
    }
};

export default authService;