import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTrips } from "../context/TripContext";

export default function CreateTripForm({ onSuccess }) {
    const { user } = useAuth();
    const { createTrip, loading } = useTrips();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        budget: "",
        notes: ""
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.startDate || !formData.endDate || !formData.budget) {
            setError("Please fill in all required fields.");
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setError("End date cannot be before start date.");
            return;
        }

        if (formData.budget < 0) {
            setError("Budget cannot be negative.");
            return;
        }

        const success = await createTrip({
            ...formData,
            budget: parseFloat(formData.budget),
            userId: parseInt(user.id)
        });

        if (success) onSuccess();
    };

    return (
        <div className="form-container">
            <h3>Create New Trip</h3>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Trip Name *" value={formData.name} onChange={handleChange} />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                <input type="number" name="budget" placeholder="Budget *" value={formData.budget} onChange={handleChange} min="0" />
                <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />
                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Trip"}
                </button>
            </form>
        </div>
    );
}