import axios from 'axios';
import { Activity } from '../models/Activity';

const BASE_URL = import.meta.env.VITE_ACTIVITY_SERVICE_URL;

export const activityService = {
    async getActivitiesByTrip(tripId) {
        const response = await axios.get(`${BASE_URL}/api/activities/trip/${tripId}`);
        return response.data.map(a => new Activity(
            a.id, a.name, a.date, a.time,
            a.location, a.description, a.estimatedCost,
            a.status, a.tripId
        ));
    },

    async getActivity(id) {
        const response = await axios.get(`${BASE_URL}/api/activities/${id}`);
        const a = response.data;
        return new Activity(
            a.id, a.name, a.date, a.time,
            a.location, a.description, a.estimatedCost,
            a.status, a.tripId
        );
    },

    async createActivity(activityData) {
        const response = await axios.post(`${BASE_URL}/api/activities`, activityData);
        const a = response.data;
        return new Activity(
            a.id, a.name, a.date, a.time,
            a.location, a.description, a.estimatedCost,
            a.status, a.tripId
        );
    },

    async updateActivity(id, activityData) {
        const response = await axios.put(`${BASE_URL}/api/activities/${id}`, activityData);
        const a = response.data;
        return new Activity(
            a.id, a.name, a.date, a.time,
            a.location, a.description, a.estimatedCost,
            a.status, a.tripId
        );
    },

    async deleteActivity(id) {
        const response = await axios.delete(`${BASE_URL}/api/activities/${id}`);
        return response.data;
    },

    async updateActivityWithToken(id, activityData, shareToken) {
        const response = await axios.put(
            `${BASE_URL}/api/activities/${id}`,
            activityData,
            {
                headers: { 'X-Share-Token': shareToken }
            }
        );
        const a = response.data;
        return new Activity(
            a.id, a.name, a.date, a.time,
            a.location, a.description, a.estimatedCost,
            a.status, a.tripId
        );
    }
};

