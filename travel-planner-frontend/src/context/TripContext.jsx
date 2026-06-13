import { createContext, useContext, useState } from "react";
import { tripService } from "../services/tripService";

const TripContext = createContext();

export function TripProvider({ children }) {
    const [trips, setTrips] = useState([]);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTrips = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tripService.getAllTrips(userId);
            setTrips(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch trips.");
            setTrips([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrip = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tripService.getTrip(id);
            setCurrentTrip(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch trip.");
        } finally {
            setLoading(false);
        }
    };

    const createTrip = async (tripData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tripService.createTrip(tripData);
            setTrips(prev => [...prev, data]);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create trip.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateTrip = async (id, tripData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tripService.updateTrip(id, tripData);
            setTrips(prev => prev.map(t => t.id === id ? data : t));
            setCurrentTrip(data);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update trip.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteTrip = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await tripService.deleteTrip(id);
            setTrips(prev => prev.filter(t => t.id !== id));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete trip.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <TripContext.Provider value={{
            trips, currentTrip, loading, error,
            fetchTrips, fetchTrip, createTrip, updateTrip, deleteTrip
        }}>
            {children}
        </TripContext.Provider>
    );
}

export function useTrips() {
    return useContext(TripContext);
}