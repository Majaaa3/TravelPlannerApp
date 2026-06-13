import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTrips } from "../context/TripContext";
import TripCard from "../components/TripCard";
import CreateTripForm from "../components/CreateTripForm";
import Navbar from "../components/Navbar";

export default function HomePage() {
    const { user } = useAuth();
    const { trips, fetchTrips, loading, error } = useTrips();
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) fetchTrips(user.id);
    }, [user]);

    return (
        <div>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <h1>My Trips</h1>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "+ New Trip"}
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {showForm && (
                    <CreateTripForm onSuccess={() => setShowForm(false)} />
                )}
                {loading ? (
                    <p>Loading...</p>
                ) : trips.length === 0 ? (
                    <p>No trips yet. Create your first trip!</p>
                ) : (
                    <div className="trips-grid">
                        {trips.map(trip => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                onClick={() => navigate(`/trips/${trip.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}