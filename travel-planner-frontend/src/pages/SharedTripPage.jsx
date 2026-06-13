import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sharingService } from "../services/sharingService";
import { tripService } from "../services/tripService";
import { activityService } from "../services/activityService";
import { destinationService } from "../services/destinationService";
import { useAuth } from "../context/AuthContext";

export default function SharedTripPage() {
    const { token } = useParams();
    const [trip, setTrip] = useState(null);
    const [accessType, setAccessType] = useState(null);
    const [activities, setActivities] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const { token: authToken } = useAuth();

    useEffect(() => {
        const validateAndFetch = async () => {
            try {
                const tokenData = await sharingService.validateToken(token);
                setAccessType(tokenData.accessType);
                const tripData = await tripService.getTrip(tokenData.tripId);
                setTrip(tripData);
                const activitiesData = await activityService.getActivitiesByTrip(tokenData.tripId);
                setActivities(activitiesData);
                const destinationsData = await destinationService.getDestinationsByTrip(tokenData.tripId);
                setDestinations(destinationsData);
            } catch (err) {
                setError("Invalid or expired link.");
            } finally {
                setLoading(false);
            }
        };
        validateAndFetch();
    }, [token]);

    const handleEditOpen = (a) => {
        setEditId(a.id);
        setEditData({
            name: a.name,
            date: a.date?.split('T')[0],
            time: a.time,
            location: a.location,
            description: a.description,
            estimatedCost: a.estimatedCost,
            status: a.status
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!authToken) {
            setError("You must be logged in to edit activities.");
            return;
        }

        try {
            await activityService.updateActivityWithToken(editId, {
                ...editData,
                estimatedCost: parseFloat(editData.estimatedCost) || 0,
                tripId: trip.id
            }, token);
            setMessage("Activity updated successfully.");
            setEditId(null);
            const activitiesData = await activityService.getActivitiesByTrip(trip.id);
            setActivities(activitiesData);
        } catch (err) {
            setError("Failed to update activity. Access denied.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    const canEdit = accessType === "EDIT";

    return (
        <div className="page-container">
            <div className="trip-header">
                <h1>{trip.name}</h1>
                <p>{trip.description}</p>
                <p>📅 {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                <p>💰 Budget: ${trip.budget}</p>
                <p>🔑 Access: <strong>{canEdit ? "✏️ Can Edit" : "👁️ View Only"}</strong></p>
            </div>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {/* Destinations */}
            <div className="tab-content" style={{ marginBottom: "1rem" }}>
                <h3>Destinations</h3>
                {destinations.length === 0 ? <p>No destinations.</p> : (
                    destinations.map(d => (
                        <div key={d.id} className="list-item">
                            <h4>{d.name}</h4>
                            <p>📍 {d.location}</p>
                            <p>📅 {new Date(d.arrivalDate).toLocaleDateString()} - {new Date(d.departureDate).toLocaleDateString()}</p>
                            <p>{d.description}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Activities */}
            <div className="tab-content" style={{ marginBottom: "1rem" }}>
                <h3>Activities</h3>
                {activities.length === 0 ? <p>No activities.</p> : (
                    activities.map(a => (
                        <div key={a.id} className="list-item">
                            {canEdit && editId === a.id ? (
                                <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                    <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Name" />
                                    <input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} />
                                    <input type="time" value={editData.time} onChange={e => setEditData({...editData, time: e.target.value})} />
                                    <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} placeholder="Location" />
                                    <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Description" />
                                    <input type="number" value={editData.estimatedCost} onChange={e => setEditData({...editData, estimatedCost: e.target.value})} min="0" />
                                    <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
                                        <option value="Planned">Planned</option>
                                        <option value="Reserved">Reserved</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button type="submit">Save</button>
                                        <button type="button" onClick={() => setEditId(null)} className="delete-btn">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h4>{a.name}</h4>
                                    <p>📅 {new Date(a.date).toLocaleDateString()} | 🕐 {a.time}</p>
                                    <p>📍 {a.location}</p>
                                    <p>{a.description}</p>
                                    <p>💰 ${a.estimatedCost} | Status: {a.status}</p>
                                    {canEdit && authToken && (
                                        <button onClick={() => handleEditOpen(a)} className="edit-btn">Edit</button>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {!canEdit && (
                <p style={{ color: "#666", textAlign: "center", marginTop: "1rem" }}>
                    👁️ You have view-only access to this trip.
                </p>
            )}
        </div>
    );
}