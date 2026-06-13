import { useEffect, useState } from "react";
import { activityService } from "../services/activityService";

export default function ActivityList({ tripId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "", date: "", time: "", location: "",
        description: "", estimatedCost: "", status: "Planned"
    });
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        fetchActivities();
    }, [tripId]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await activityService.getActivitiesByTrip(tripId);
            setActivities(data);
        } catch (err) {
            setError("Failed to fetch activities.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.date) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.estimatedCost < 0) {
            setError("Estimated cost cannot be negative.");
            return;
        }

        try {
            await activityService.createActivity({
                ...formData,
                estimatedCost: parseFloat(formData.estimatedCost) || 0,
                tripId: parseInt(tripId)
            });
            setMessage("Activity added successfully.");
            setShowForm(false);
            setFormData({ name: "", date: "", time: "", location: "", description: "", estimatedCost: "", status: "Planned" });
            fetchActivities();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add activity.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this activity?")) {
            try {
                await activityService.deleteActivity(id);
                setMessage("Activity deleted.");
                fetchActivities();
            } catch (err) {
                setError("Failed to delete activity.");
            }
        }
    };

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
        try {
            await activityService.updateActivity(editId, {
                ...editData,
                estimatedCost: parseFloat(editData.estimatedCost) || 0,
                tripId: parseInt(tripId)
            });
            setMessage("Activity updated.");
            setEditId(null);
            fetchActivities();
        } catch (err) {
            setError("Failed to update activity.");
        }
    };

    const groupByDate = (activities) => {
        return activities.reduce((groups, activity) => {
            const date = new Date(activity.date).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(activity);
            return groups;
        }, {});
    };

    const grouped = groupByDate(activities);

    return (
        <div>
            <div className="section-header">
                <h3>Activities</h3>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Activity"}
                </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            {showForm && (
                <form onSubmit={handleSubmit} className="form-container">
                    <input type="text" name="name" placeholder="Activity Name *" value={formData.name} onChange={handleChange} />
                    <input type="date" name="date" value={formData.date} onChange={handleChange} />
                    <input type="time" name="time" value={formData.time} onChange={handleChange} />
                    <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                    <input type="number" name="estimatedCost" placeholder="Estimated Cost" value={formData.estimatedCost} onChange={handleChange} min="0" />
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="Planned">Planned</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <button type="submit">Add Activity</button>
                </form>
            )}
            {loading ? <p>Loading...</p> : activities.length === 0 ? (
                <p>No activities yet.</p>
            ) : (
                Object.entries(grouped).map(([date, acts]) => (
                    <div key={date} className="activity-group">
                        <h4>📅 {date}</h4>
                        {acts.map(a => (
                            <div key={a.id} className="list-item">
                                {editId === a.id ? (
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
                                        <h5>{a.name}</h5>
                                        <p>🕐 {a.time} | 📍 {a.location}</p>
                                        <p>{a.description}</p>
                                        <p>💰 ${a.estimatedCost} | Status: {a.status}</p>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button onClick={() => handleEditOpen(a)} className="edit-btn">Edit</button>
                                            <button onClick={() => handleDelete(a.id)} className="delete-btn">Delete</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}