import axios from 'axios';
import { Destination } from '../models/Destination';

const BASE_URL = import.meta.env.VITE_TRIP_SERVICE_URL;

export const destinationService = {
    async getDestinationsByTrip(tripId) {
        const response = await axios.get(`${BASE_URL}/api/destinations/trip/${tripId}`);
        return response.data.map(d => new Destination(
            d.id, d.name, d.location,
            d.arrivalDate, d.departureDate,
            d.description, d.tripId
        ));
    },

    async getDestination(id) {
        const response = await axios.get(`${BASE_URL}/api/destinations/${id}`);
        const d = response.data;
        return new Destination(
            d.id, d.name, d.location,
            d.arrivalDate, d.departureDate,
            d.description, d.tripId
        );
    },

    async createDestination(destinationData) {
        const response = await axios.post(`${BASE_URL}/api/destinations`, destinationData);
        const d = response.data;
        return new Destination(
            d.id, d.name, d.location,
            d.arrivalDate, d.departureDate,
            d.description, d.tripId
        );
    },

    async updateDestination(id, destinationData) {
        const response = await axios.put(`${BASE_URL}/api/destinations/${id}`, destinationData);
        const d = response.data;
        return new Destination(
            d.id, d.name, d.location,
            d.arrivalDate, d.departureDate,
            d.description, d.tripId
        );
    },

    async deleteDestination(id) {
        const response = await axios.delete(`${BASE_URL}/api/destinations/${id}`);
        return response.data;
    }
};