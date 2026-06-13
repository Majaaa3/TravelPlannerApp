import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">✈️ TravelPlanner</Link>
            <div className="navbar-links">
                {user?.role === "Admin" && (
                    <Link to="/admin">Admin Panel</Link>
                )}
                <span>{user?.email}</span>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
}