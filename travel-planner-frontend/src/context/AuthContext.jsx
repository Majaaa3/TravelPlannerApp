import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
                id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
                role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
            });
        }
    }, [token]);

    const register = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await authService.register(name, email, password);
            localStorage.setItem("token", data.token);
            setToken(data.token);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await authService.login(email, password);
            localStorage.setItem("token", data.token);
            setToken(data.token);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}