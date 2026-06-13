import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { activityService } from "../services/activityService";

// Fix za Leaflet ikone
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ tripId }) {
    const [activities, setActivities] = useState([]);
    const [coordinates, setCoordinates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAndGeocode();
    }, [tripId]);

    const fetchAndGeocode = async () => {
        setLoading(true);
        try {
            const data = await activityService.getActivitiesByTrip(tripId);
            const withLocation = data
                .filter(a => a.location && a.location.trim() !== "")
                .sort((a, b) => {
                    const dateA = new Date(`${a.date.split('T')[0]}T${a.time || '00:00'}`);
                    const dateB = new Date(`${b.date.split('T')[0]}T${b.time || '00:00'}`);
                    return dateA - dateB;
                });

            const coords = [];
            for (const activity of withLocation) {
                const coord = await geocodeLocation(activity.location);
                if (coord) {
                    coords.push({ activity, coord });
                }
            }

            setActivities(withLocation);
            setCoordinates(coords);
        } catch (err) {
            setError("Failed to load map data.");
        } finally {
            setLoading(false);
        }
    };

    const geocodeLocation = async (location) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(location)}&limit=1`
            );
            const data = await response.json();
            if (data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
            return null;
        } catch {
            return null;
        }
    };

    if (loading) return <p>Loading map...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (coordinates.length === 0) return <p>No locations to show on map. Add activities with locations!</p>;

    const center = coordinates[0].coord;
    const polylinePoints = coordinates.map(c => c.coord);

    const createNumberedIcon = (number) => L.divIcon({
        className: "numbered-marker",
        html: `<div style="
            background-color: #3498db;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${number}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });

    return (
        <div>
            <h3>Trip Route Map</h3>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
                Showing {coordinates.length} locations in order
            </p>
            <MapContainer
                center={center}
                zoom={10}
                style={{ height: "500px", width: "100%", borderRadius: "8px" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                   url={import.meta.env.VITE_TILE_URL}
                />

                <Polyline
                    positions={polylinePoints}
                    color="#3498db"
                    weight={3}
                    dashArray="10, 5"
                />

                {coordinates.map((item, index) => (
                    <Marker
                        key={index}
                        position={item.coord}
                        icon={createNumberedIcon(index + 1)}
                    >
                        <Popup>
                            <div>
                                <strong>{index + 1}. {item.activity.name}</strong>
                                <p>📍 {item.activity.location}</p>
                                <p>📅 {new Date(item.activity.date).toLocaleDateString()}</p>
                                <p>🕐 {item.activity.time}</p>
                                <p>💰 ${item.activity.estimatedCost}</p>
                                <p>Status: {item.activity.status}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div style={{ marginTop: "1rem" }}>
                <h4>Route Order:</h4>
                {coordinates.map((item, index) => (
                    <div key={index} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem",
                        borderBottom: "1px solid #eee"
                    }}>
                        <span style={{
                            background: "#3498db",
                            color: "white",
                            borderRadius: "50%",
                            width: "25px",
                            height: "25px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            fontWeight: "bold"
                        }}>{index + 1}</span>
                        <div>
                            <strong>{item.activity.name}</strong>
                            <span style={{ color: "#666", marginLeft: "0.5rem" }}>
                                📍 {item.activity.location}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}