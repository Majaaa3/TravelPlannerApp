import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrips } from "../context/TripContext";
import Navbar from "../components/Navbar";
import DestinationList from "../components/DestinationList";
import ActivityList from "../components/ActivityList";
import ExpenseList from "../components/ExpenseList";
import ChecklistComponent from "../components/ChecklistComponent";
import ShareTrip from "../components/ShareTrip";
import MapView from "../components/MapView";
import CalendarView from "../components/CalendarView";

export default function TripDetailsPage() {
    const { id } = useParams();
    const { currentTrip, fetchTrip, deleteTrip, updateTrip, loading, error } = useTrips();
    const [activeTab, setActiveTab] = useState("destinations");
    const [showEditTrip, setShowEditTrip] = useState(false);
    const [editData, setEditData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrip(id);
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this trip?")) {
            const success = await deleteTrip(id);
            if (success) navigate("/");
        }
    };

    const handleEditOpen = () => {
        setEditData({
            name: currentTrip.name,
            description: currentTrip.description,
            startDate: currentTrip.startDate?.split('T')[0],
            endDate: currentTrip.endDate?.split('T')[0],
            budget: currentTrip.budget,
            notes: currentTrip.notes
        });
        setShowEditTrip(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (new Date(editData.endDate) < new Date(editData.startDate)) {
            alert("End date cannot be before start date.");
            return;
        }
        const success = await updateTrip(id, {
            ...editData,
            budget: parseFloat(editData.budget),
            userId: currentTrip.userId
        });
        if (success) setShowEditTrip(false);
    };

    if (loading) return <p>Loading...</p>;
    if (!currentTrip) return <p>Trip not found.</p>;

    return (
        <div>
            <Navbar />
            <div className="page-container">
                {error && <p className="error-message">{error}</p>}
                <div className="trip-header">
                    <h1>{currentTrip.name}</h1>
                    <p>{currentTrip.description}</p>
                    <p>📅 {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}</p>
                    <p>💰 Budget: ${currentTrip.budget}</p>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                        <button onClick={handleEditOpen} className="edit-btn">Edit Trip</button>
                        <button onClick={handleDelete} className="delete-btn">Delete Trip</button>
                    </div>
                </div>

                {showEditTrip && (
                    <div className="form-container" style={{ marginBottom: "1rem" }}>
                        <h3>Edit Trip</h3>
                        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Trip Name" />
                            <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Description" />
                            <input type="date" value={editData.startDate} onChange={e => setEditData({...editData, startDate: e.target.value})} />
                            <input type="date" value={editData.endDate} onChange={e => setEditData({...editData, endDate: e.target.value})} />
                            <input type="number" value={editData.budget} onChange={e => setEditData({...editData, budget: e.target.value})} placeholder="Budget" min="0" />
                            <textarea value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} placeholder="Notes" />
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={() => setShowEditTrip(false)} className="delete-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="tabs">
                    <button onClick={() => setActiveTab("destinations")} className={activeTab === "destinations" ? "active" : ""}>Destinations</button>
                    <button onClick={() => setActiveTab("activities")} className={activeTab === "activities" ? "active" : ""}>Activities</button>
                    <button onClick={() => setActiveTab("expenses")} className={activeTab === "expenses" ? "active" : ""}>Expenses</button>
                    <button onClick={() => setActiveTab("checklist")} className={activeTab === "checklist" ? "active" : ""}>Checklist</button>
                    <button onClick={() => setActiveTab("share")} className={activeTab === "share" ? "active" : ""}>Share</button>
                    <button onClick={() => setActiveTab("map")} className={activeTab === "map" ? "active" : ""}>Map</button>
                    <button onClick={() => setActiveTab("calendar")} className={activeTab === "calendar" ? "active" : ""}>Calendar</button>
                </div>
                <div className="tab-content">
                    {activeTab === "destinations" && <DestinationList tripId={id} />}
                    {activeTab === "activities" && <ActivityList tripId={id} />}
                    {activeTab === "expenses" && <ExpenseList tripId={currentTrip} />}
                    {activeTab === "checklist" && <ChecklistComponent tripId={id} />}
                    {activeTab === "share" && <ShareTrip tripId={id} />}
                    {activeTab === "map" && <MapView tripId={id} />}
                    {activeTab === "calendar" && <CalendarView tripId={id} />}
                </div>
            </div>
        </div>
    );
}