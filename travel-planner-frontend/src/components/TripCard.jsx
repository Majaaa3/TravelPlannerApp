export default function TripCard({ trip, onClick }) {
    return (
        <div className="trip-card" onClick={onClick}>
            <div className="trip-card-header">
                <h3>✈️ {trip.name}</h3>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                    📅 {new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()}
                </p>
            </div>
            <div className="trip-card-body">
                <p>{trip.description}</p>
                <p>💰 Budget: ${trip.budget}</p>
            </div>
            <div className="trip-card-footer">
                <span style={{ color: "#0a7075", fontWeight: "600", fontSize: "0.85rem" }}>
                    📍 {trip.destinations?.length || 0} destinations
                </span>
                <span style={{ color: "#f97316", fontWeight: "600", fontSize: "0.85rem" }}>
                    View →
                </span>
            </div>
        </div>
    );
}