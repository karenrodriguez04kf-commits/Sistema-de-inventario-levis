import axios from 'axios';

// 1. Si estamos en producción (Vercel) usa la URL de Railway, si no, usa localhost para desarrollo
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; 

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