import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { tripService } from "../services/tripService";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [allTrips, setAllTrips] = useState([]);
    const [activeTab, setActiveTab] = useState("users");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchAllTrips();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await authService.getAllUsers(token);
            setUsers(data);
        } catch (err) {
            setError("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTrips = async () => {
        try {
            const data = await tripService.getAllTripsAdmin(token);
            setAllTrips(data);
        } catch (err) {
            setError("Failed to fetch trips.");
        }
    };

    const handleRoleChange = async (id, role) => {
        try {
            await authService.updateUserRole(id, role);
            setMessage("Role updated successfully.");
            fetchUsers();
        } catch (err) {
            setError("Failed to update role.");
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await authService.deleteUser(id, token);
                setMessage("User deleted successfully.");
                fetchUsers();
                fetchAllTrips();
            } catch (err) {
                setError("Failed to delete user.");
            }
        }
    };

    const handleDeleteTrip = async (id) => {
        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                await tripService.deleteTrip(id);
                setMessage("Trip deleted successfully.");
                fetchAllTrips();
            } catch (err) {
                setError("Failed to delete trip.");
            }
        }
    };

    return (
        <div>
            <Navbar />
            <div className="page-container">
                <h1>Admin Panel</h1>
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                {/* Tabovi */}
                <div className="tabs">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={activeTab === "users" ? "active" : ""}>
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab("trips")}
                        className={activeTab === "trips" ? "active" : ""}>
                        All Trips
                    </button>
                </div>

                {/* Users tab */}
                {activeTab === "users" && (
                    loading ? <p>Loading...</p> : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.role}</td>
                                        <td>
                                            <button onClick={() => handleRoleChange(u.id, u.role === "Admin" ? "User" : "Admin")}>
                                                {u.role === "Admin" ? "Make User" : "Make Admin"}
                                            </button>
                                            <button onClick={() => handleDeleteUser(u.id)} className="delete-btn">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

                {/* Trips tab */}
                {activeTab === "trips" && (
                    <div>
                        {allTrips.length === 0 ? <p>No trips found.</p> : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Trip Name</th>
                                        <th>User ID</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Budget</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTrips.map(trip => (
                                        <tr key={trip.id}>
                                            <td>{trip.name}</td>
                                            <td>{trip.userId}</td>
                                            <td>{new Date(trip.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(trip.endDate).toLocaleDateString()}</td>
                                            <td>${trip.budget}</td>
                                            <td>
                                                <button onClick={() => navigate(`/trips/${trip.id}`)}>
                                                    View
                                                </button>
                                                <button onClick={() => handleDeleteTrip(trip.id)} className="delete-btn">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}