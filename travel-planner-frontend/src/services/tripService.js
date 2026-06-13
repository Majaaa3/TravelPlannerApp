import axios from 'axios';
import { Trip } from '../models/Trip';

const BASE_URL = import.meta.env.VITE_TRIP_SERVICE_URL;

export const tripService = {
    async getAllTrips(userId) {
        const response = await axios.get(`${BASE_URL}/api/trips/user/${userId}`);
        return response.data.map(t => new Trip(
            t.id, t.name, t.description,
            t.startDate, t.endDate, t.budget,
            t.notes, t.userId, t.createdAt,
            t.destinations
        ));
    },

    async getTrip(id) {
        const response = await axios.get(`${BASE_URL}/api/trips/${id}`);
        const t = response.data;
        return new Trip(
            t.id, t.name, t.description,
            t.startDate, t.endDate, t.budget,
            t.notes, t.userId, t.createdAt,
            t.destinations
        );
    },

    async createTrip(tripData) {
        const response = await axios.post(`${BASE_URL}/api/trips`, tripData);
        const t = response.data;
        return new Trip(
            t.id, t.name, t.description,
            t.startDate, t.endDate, t.budget,
            t.notes, t.userId, t.createdAt,
            t.destinations
        );
    },

    async updateTrip(id, tripData) {
        const response = await axios.put(`${BASE_URL}/api/trips/${id}`, tripData);
        const t = response.data;
        return new Trip(
            t.id, t.name, t.description,
            t.startDate, t.endDate, t.budget,
            t.notes, t.userId, t.createdAt,
            t.destinations
        );
    },

    async deleteTrip(id) {
        const response = await axios.delete(`${BASE_URL}/api/trips/${id}`);
        return response.data;
    },

    async getAllTripsAdmin(token) {
        const response = await axios.get(`${BASE_URL}/api/trips/admin/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.map(t => new Trip(
            t.id, t.name, t.description,
            t.startDate, t.endDate, t.budget,
            t.notes, t.userId, t.createdAt,
            t.destinations
        ));
    }
};