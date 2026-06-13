import axios from 'axios';
import { ShareToken } from '../models/ShareToken';

const BASE_URL = import.meta.env.VITE_SHARING_SERVICE_URL;

export const sharingService = {
    async createShareToken(tripId, accessType, expiresInDays = 7) {
        const response = await axios.post(`${BASE_URL}/api/sharing`, {
            tripId, accessType, expiresInDays
        });
        const t = response.data;
        return new ShareToken(
            t.id, t.token, t.tripId, t.accessType,
            t.createdAt, t.expiresAt, t.isActive, t.qrCodeBase64
        );
    },

    async validateToken(token) {
        const response = await axios.get(`${BASE_URL}/api/sharing/validate/${token}`);
        const t = response.data;
        return new ShareToken(
            t.id, t.token, t.tripId, t.accessType,
            t.createdAt, t.expiresAt, t.isActive, t.qrCodeBase64
        );
    },

    async revokeToken(token) {
        const response = await axios.put(`${BASE_URL}/api/sharing/revoke/${token}`);
        return response.data;
    },

    async getTokensByTrip(tripId) {
        const response = await axios.get(`${BASE_URL}/api/sharing/trip/${tripId}`);
        return response.data.map(t => new ShareToken(
            t.id, t.token, t.tripId, t.accessType,
            t.createdAt, t.expiresAt, t.isActive, t.qrCodeBase64
        ));
    }
};