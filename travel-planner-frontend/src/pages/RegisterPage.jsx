import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            alert("Please fill in all fields.");
            return;
        }
        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }
        const success = await register(formData.name, formData.email, formData.password);
        if (success) navigate("/");
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f97316 0%, #0d9da4 50%, #0a7075 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
        }}>
            <div style={{
                background: "white",
                borderRadius: "24px",
                padding: "3rem",
                width: "100%",
                maxWidth: "420px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
            }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🌍</div>
                    <h1 style={{ color: "#0a7075", fontWeight: "800", fontSize: "1.8rem" }}>
                        Join TravelPlanner
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.3rem" }}>
                        Start planning your adventures!
                    </p>
                </div>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#0a7075", marginBottom: "0.3rem", display: "block" }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#0a7075", marginBottom: "0.3rem", display: "block" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#0a7075", marginBottom: "0.3rem", display: "block" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{
                        marginTop: "0.5rem",
                        padding: "0.8rem",
                        fontSize: "1rem",
                        fontWeight: "700",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #0a7075, #0d9da4)"
                    }}>
                        {loading ? "Creating account..." : "Create Account →"}
                    </button>
                </form>
                <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.9rem" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#0a7075", fontWeight: "700", textDecoration: "none" }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}