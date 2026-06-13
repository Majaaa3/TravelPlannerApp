import { useEffect, useState } from "react";
import { checklistService } from "../services/checklistService";

export default function ChecklistComponent({ tripId }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [newItem, setNewItem] = useState("");

    useEffect(() => {
        fetchItems();
    }, [tripId]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await checklistService.getChecklistByTrip(tripId);
            setItems(data);
        } catch (err) {
            setError("Failed to fetch checklist.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        try {
            await checklistService.createChecklistItem({
                name: newItem,
                tripId: parseInt(tripId)
            });
            setNewItem("");
            setMessage("Item added.");
            fetchItems();
        } catch (err) {
            setError("Failed to add item.");
        }
    };

    const handleToggle = async (id) => {
        try {
            await checklistService.toggleChecklistItem(id);
            fetchItems();
        } catch (err) {
            setError("Failed to toggle item.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await checklistService.deleteChecklistItem(id);
            setMessage("Item deleted.");
            fetchItems();
        } catch (err) {
            setError("Failed to delete item.");
        }
    };

    const completed = items.filter(i => i.isCompleted).length;

    return (
        <div>
            <div className="section-header">
                <h3>Packing Checklist</h3>
                <span>{completed}/{items.length} completed</span>
            </div>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <form onSubmit={handleAdd} className="checklist-form">
                <input
                    type="text"
                    placeholder="Add new item..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                />
                <button type="submit">Add</button>
            </form>
            {loading ? <p>Loading...</p> : items.length === 0 ? (
                <p>No items yet.</p>
            ) : (
                items.map(item => (
                    <div key={item.id} className="checklist-item">
                        <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => handleToggle(item.id)}
                        />
                        <span style={{ textDecoration: item.isCompleted ? "line-through" : "none" }}>
                            {item.name}
                        </span>
                        <button onClick={() => handleDelete(item.id)} className="delete-btn">×</button>
                    </div>
                ))
            )}
        </div>
    );
}