import { useEffect, useState } from "react";
import { expenseService } from "../services/expenseService";

export default function ExpenseList({ tripId }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "", category: "Transport", amount: "", date: "", description: ""
    });

    useEffect(() => {
        fetchExpenses();
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

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await expenseService.getExpensesByTrip(tripId.id);
            setExpenses(data);
        } catch (err) {
            setError("Failed to fetch expenses.");
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

        if (!formData.name || !formData.amount || !formData.date) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.amount < 0) {
            setError("Amount cannot be negative.");
            return;
        }

        try {
            await expenseService.createExpense({
                ...formData,
                amount: parseFloat(formData.amount),
                tripId: tripId.id
            });
            setMessage("Expense added successfully.");
            setShowForm(false);
            setFormData({ name: "", category: "Transport", amount: "", date: "", description: "" });
            fetchExpenses();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add expense.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this expense?")) {
            try {
                await expenseService.deleteExpense(id);
                setMessage("Expense deleted.");
                fetchExpenses();
            } catch (err) {
                setError("Failed to delete expense.");
            }
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remainingBudget = tripId.budget - totalExpenses;

    return (
        <div>
            <div className="section-header">
                <h3>Expenses</h3>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Expense"}
                </button>
            </div>
            <div className="budget-summary">
                <p>💰 Total Budget: ${tripId.budget}</p>
                <p>💸 Total Expenses: ${totalExpenses.toFixed(2)}</p>
                <p style={{ color: remainingBudget < 0 ? "red" : "green" }}>
                    🏦 Remaining: ${remainingBudget.toFixed(2)}
                </p>
            </div>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            {showForm && (
                <form onSubmit={handleSubmit} className="form-container">
                    <input type="text" name="name" placeholder="Expense Name *" value={formData.name} onChange={handleChange} />
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="Transport">Transport</option>
                        <option value="Accommodation">Accommodation</option>
                        <option value="Food">Food</option>
                        <option value="Tickets">Tickets</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="number" name="amount" placeholder="Amount *" value={formData.amount} onChange={handleChange} min="0" />
                    <input type="date" name="date" value={formData.date} onChange={handleChange} />
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                    <button type="submit">Add Expense</button>
                </form>
            )}
            {loading ? <p>Loading...</p> : expenses.length === 0 ? (
                <p>No expenses yet.</p>
            ) : (
                expenses.map(e => (
                    <div key={e.id} className="list-item">
                        <h4>{e.name}</h4>
                        <p>🏷️ {e.category} | 💰 ${e.amount}</p>
                        <p>📅 {new Date(e.date).toLocaleDateString()}</p>
                        <p>{e.description}</p>
                        <button onClick={() => handleDelete(e.id)} className="delete-btn">Delete</button>
                    </div>
                ))
            )}
        </div>
    );
}