import { useEffect, useState } from "react";
import { sharingService } from "../services/sharingService";

export default function ShareTrip({ tripId }) {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [accessType, setAccessType] = useState("VIEW");
    const [expiresInDays, setExpiresInDays] = useState(7);

    useEffect(() => {
        fetchTokens();
    }, [tripId]);

    const fetchTokens = async () => {
        setLoading(true);
        try {
            const data = await sharingService.getTokensByTrip(tripId);
            setTokens(data);
        } catch (err) {
            setError("Failed to fetch share tokens.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await sharingService.createShareToken(
                parseInt(tripId), accessType, expiresInDays
            );
            setMessage("Share token created successfully.");
            fetchTokens();
        } catch (err) {
            setError("Failed to create share token.");
        }
    };

    const handleRevoke = async (token) => {
        try {
            await sharingService.revokeToken(token);
            setMessage("Token revoked.");
            fetchTokens();
        } catch (err) {
            setError("Failed to revoke token.");
        }
    };

    return (
        <div>
            <h3>Share Trip</h3>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <form onSubmit={handleCreate} className="form-container">
                <select value={accessType} onChange={(e) => setAccessType(e.target.value)}>
                    <option value="VIEW">View Only</option>
                    <option value="EDIT">Can Edit</option>
                </select>
                <input
                    type="number"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                    min="1"
                    max="30"
                    placeholder="Expires in days"
                />
                <button type="submit">Generate Share Link</button>
            </form>
            {loading ? <p>Loading...</p> : tokens.length === 0 ? (
                <p>No share links yet.</p>
            ) : (
                tokens.map(t => (
                    <div key={t.id} className="list-item">
                        <p>🔑 Access: {t.accessType}</p>
                        <p>⏰ Expires: {new Date(t.expiresAt).toLocaleDateString()}</p>
                        <p>Status: {t.isActive ? "✅ Active" : "❌ Revoked"}</p>
                        {t.qrCodeBase64 && (
                            <img
                                src={`data:image/png;base64,${t.qrCodeBase64}`}
                                alt="QR Code"
                                style={{ width: "150px", height: "150px" }}
                            />
                        )}
                        <p>🔗 {window.location.origin}/shared/{t.token}</p>
                        {t.isActive && (
                            <button onClick={() => handleRevoke(t.token)} className="delete-btn">
                                Revoke
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}