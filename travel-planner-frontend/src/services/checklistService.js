import axios from 'axios';
import { ChecklistItem } from '../models/ChecklistItem';

const BASE_URL = import.meta.env.VITE_ACTIVITY_SERVICE_URL;

export const checklistService = {
    async getChecklistByTrip(tripId) {
        const response = await axios.get(`${BASE_URL}/api/checklist/trip/${tripId}`);
        return response.data.map(c => new ChecklistItem(
            c.id, c.name, c.isCompleted, c.tripId
        ));
    },

    async createChecklistItem(itemData) {
        const response = await axios.post(`${BASE_URL}/api/checklist`, itemData);
        const c = response.data;
        return new ChecklistItem(c.id, c.name, c.isCompleted, c.tripId);
    },

    async toggleChecklistItem(id) {
        const response = await axios.put(`${BASE_URL}/api/checklist/${id}/toggle`);
        const c = response.data;
        return new ChecklistItem(c.id, c.name, c.isCompleted, c.tripId);
    },

    async deleteChecklistItem(id) {
        const response = await axios.delete(`${BASE_URL}/api/checklist/${id}`);
        return response.data;
    }
};