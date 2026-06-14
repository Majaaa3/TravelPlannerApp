import { useEffect, useState } from "react";
import { destinationService } from "../services/destinationService";

export default function DestinationList({ tripId, tripStartDate, tripEndDate }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "", location: "", arrivalDate: "", departureDate: "", description: ""
    });
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        fetchDestinations();
    }, [tripId]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const fetchDestinations = async () => {
        setLoading(true);
        try {
            const data = await destinationService.getDestinationsByTrip(tripId);
            setDestinations(data);
        } catch (err) {
            setError("Failed to fetch destinations.");
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

        if (!formData.name || !formData.location || !formData.arrivalDate || !formData.departureDate) {
            setError("Please fill in all required fields.");
            return;
        }

        if (new Date(formData.departureDate) < new Date(formData.arrivalDate)) {
            setError("Departure date cannot be before arrival date.");
            return;
        }

        if (tripStartDate && tripEndDate) {
            const tripStart = new Date(tripStartDate);
            const tripEnd = new Date(tripEndDate);
            if (new Date(formData.arrivalDate) < tripStart || 
                new Date(formData.departureDate) > tripEnd) {
                setError(`Dates must be within trip period: ${new Date(tripStartDate).toLocaleDateString()} - ${new Date(tripEndDate).toLocaleDateString()}.`);
                return;
            }
        }

        try {
            await destinationService.createDestination({ ...formData, tripId: parseInt(tripId) });
            setMessage("Destination added successfully.");
            setShowForm(false);
            setFormData({ name: "", location: "", arrivalDate: "", departureDate: "", description: "" });
            fetchDestinations();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add destination.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this destination?")) {
            try {
                await destinationService.deleteDestination(id);
                setMessage("Destination deleted.");
                fetchDestinations();
            } catch (err) {
                setError("Failed to delete destination.");
            }
        }
    };

    const handleEditOpen = (d) => {
        setEditId(d.id);
        setEditData({
            name: d.name,
            location: d.location,
            arrivalDate: d.arrivalDate?.split('T')[0],
            departureDate: d.departureDate?.split('T')[0],
            description: d.description
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (new Date(editData.departureDate) < new Date(editData.arrivalDate)) {
            setError("Departure date cannot be before arrival date.");
            return;
        }
        try {
            await destinationService.updateDestination(editId, { ...editData, tripId: parseInt(tripId) });
            setMessage("Destination updated.");
            setEditId(null);
            fetchDestinations();
        } catch (err) {
            setError("Failed to update destination.");
        }
    };

    return (
        <div>
            <div className="section-header">
                <h3>Destinations</h3>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Destination"}
                </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            {showForm && (
                <form onSubmit={handleSubmit} className="form-container">
                    <input type="text" name="name" placeholder="Destination Name *" value={formData.name} onChange={handleChange} />
                    <input type="text" name="location" placeholder="Location *" value={formData.location} onChange={handleChange} />
                    <input type="date" name="arrivalDate" value={formData.arrivalDate} onChange={handleChange}
                        min={tripStartDate?.split('T')[0]}
                        max={tripEndDate?.split('T')[0]}
                    />
                    <input type="date" name="departureDate" value={formData.departureDate} onChange={handleChange}
                        min={tripStartDate?.split('T')[0]}
                        max={tripEndDate?.split('T')[0]}
                    />
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                    <button type="submit">Add Destination</button>
                </form>
            )}
            {loading ? <p>Loading...</p> : destinations.length === 0 ? (
                <p>No destinations yet.</p>
            ) : (
                destinations.map(d => (
                    <div key={d.id} className="list-item">
                        {editId === d.id ? (
                            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Name" />
                                <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} placeholder="Location" />
                                <input type="date" value={editData.arrivalDate} 
                                    onChange={e => setEditData({...editData, arrivalDate: e.target.value})}
                                    min={tripStartDate?.split('T')[0]}
                                    max={tripEndDate?.split('T')[0]}
                                />
                                <input type="date" value={editData.departureDate} 
                                    onChange={e => setEditData({...editData, departureDate: e.target.value})}
                                    min={tripStartDate?.split('T')[0]}
                                    max={tripEndDate?.split('T')[0]}
                                />
                                <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Description" />
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditId(null)} className="delete-btn">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h4>{d.name}</h4>
                                <p>📍 {d.location}</p>
                                <p>📅 {new Date(d.arrivalDate).toLocaleDateString()} - {new Date(d.departureDate).toLocaleDateString()}</p>
                                <p>{d.description}</p>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button onClick={() => handleEditOpen(d)} className="edit-btn">Edit</button>
                                    <button onClick={() => handleDelete(d.id)} className="delete-btn">Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}