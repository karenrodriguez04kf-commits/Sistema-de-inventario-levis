import axios from 'axios';

// 1. Centralizamos la URL del servidor
export const BASE_URL = 'http://localhost:3002'; 

const api = axios.create({
    // 2. Usamos la constante para la base de la API
    baseURL: `${BASE_URL}/api` 
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;