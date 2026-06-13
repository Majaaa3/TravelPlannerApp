import { useState, useEffect } from "react";
import { activityService } from "../services/activityService";

export default function CalendarView({ tripId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedActivity, setSelectedActivity] = useState(null);

    const statusColors = {
        Planned: "#3498db",
        Reserved: "#f39c12",
        Completed: "#27ae60",
        Cancelled: "#e74c3c",
    };

    useEffect(() => {
        fetchActivities();
    }, [tripId]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await activityService.getActivitiesByTrip(tripId);
            setActivities(data);
        } catch (err) {
            setError("Failed to load activities.");
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const getActivitiesForDay = (day) => {
        return activities.filter(a => {
            const actDate = new Date(a.date);
            return actDate.getFullYear() === year &&
                actDate.getMonth() === month &&
                actDate.getDate() === day;
        });
    };

    if (loading) return <p>Loading calendar...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div>
            <h3>Activities Calendar</h3>

            {/* Legenda */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                {Object.entries(statusColors).map(([status, color]) => (
                    <span key={status} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span style={{
                            width: "12px", height: "12px",
                            borderRadius: "50%", background: color,
                            display: "inline-block"
                        }}></span>
                        {status}
                    </span>
                ))}
            </div>

            {/* Navigacija */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "1rem"
            }}>
                <button onClick={prevMonth} style={{ padding: "0.5rem 1rem" }}>← Back</button>
                <h4>{monthNames[month]} {year}</h4>
                <button onClick={nextMonth} style={{ padding: "0.5rem 1rem" }}>Next →</button>
            </div>

            {/* Kalendar grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "2px",
                background: "#ddd",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden"
            }}>
                {/* Dani u sedmici */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} style={{
                        background: "#2c3e50", color: "white",
                        padding: "0.5rem", textAlign: "center",
                        fontWeight: "bold", fontSize: "0.85rem"
                    }}>{day}</div>
                ))}

                {/* Prazni dani na početku */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ background: "#f8f9fa", minHeight: "80px" }} />
                ))}

                {/* Dani u mjesecu */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayActivities = getActivitiesForDay(day);
                    const isToday = new Date().getFullYear() === year &&
                        new Date().getMonth() === month &&
                        new Date().getDate() === day;

                    return (
                        <div key={day} style={{
                            background: isToday ? "#ebf5fb" : "white",
                            minHeight: "80px",
                            padding: "0.3rem",
                            border: isToday ? "2px solid #3498db" : "none"
                        }}>
                            <div style={{
                                fontWeight: "bold",
                                fontSize: "0.85rem",
                                color: isToday ? "#3498db" : "#333",
                                marginBottom: "0.2rem"
                            }}>{day}</div>
                            {dayActivities.map(activity => (
                                <div
                                    key={activity.id}
                                    onClick={() => setSelectedActivity(activity)}
                                    style={{
                                        background: statusColors[activity.status] || "#3498db",
                                        color: "white",
                                        borderRadius: "3px",
                                        padding: "1px 4px",
                                        fontSize: "0.75rem",
                                        marginBottom: "2px",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {activity.name}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Detalji aktivnosti */}
            {selectedActivity && (
                <div style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${statusColors[selectedActivity.status]}`
                }}>
                    <h4>{selectedActivity.name}</h4>
                    <p>📅 {new Date(selectedActivity.date).toLocaleDateString()}</p>
                    <p>🕐 {selectedActivity.time}</p>
                    <p>📍 {selectedActivity.location}</p>
                    <p>💰 ${selectedActivity.estimatedCost}</p>
                    <p>Status: {selectedActivity.status}</p>
                    <p>{selectedActivity.description}</p>
                    <button onClick={() => setSelectedActivity(null)}>Close</button>
                </div>
            )}
        </div>
    );
}