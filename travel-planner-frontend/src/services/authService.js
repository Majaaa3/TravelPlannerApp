import axios from 'axios';
import { User } from '../models/User';

const BASE_URL = import.meta.env.VITE_USER_SERVICE_URL;

export const authService = {
    async register(name, email, password) {
        const response = await axios.post(`${BASE_URL}/api/users/register`, {
            name, email, password
        });
        return response.data;
    },

    async login(email, password) {
        const response = await axios.post(`${BASE_URL}/api/users/login`, {
            email, password
        });
        return response.data;
    },

    async getUser(id) {
        const response = await axios.get(`${BASE_URL}/api/users/${id}`);
        const u = response.data;
        return new User(u.id, u.name, u.email, u.role, u.createdAt);
    },

    async getAllUsers(token) {
        const response = await axios.get(`${BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.map(u => new User(
            u.id, u.name, u.email, u.role, u.createdAt
        ));
    },

    async updateUserRole(id, role) {
        const response = await axios.put(`${BASE_URL}/api/users/${id}/role`, role, {
            headers: { 'Content-Type': 'application/json' }
        });
        const u = response.data;
        return new User(u.id, u.name, u.email, u.role, u.createdAt);
    },

    async deleteUser(id, token) {
        const response = await axios.delete(`${BASE_URL}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};