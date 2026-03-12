import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Warnings({ admin, onLogout }) {
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchWarnings();
    }, []);

    const fetchWarnings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/warnings');
            setWarnings(response.data);
        } catch (error) {
            console.error('Error fetching warnings:', error);
            setMessage({ type: 'error', text: 'Failed to fetch warnings' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateWarnings = async () => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/api/warnings/generate');
            setMessage({ type: 'success', text: response.data.message });
            fetchWarnings();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to generate warnings' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this warning?')) {
            try {
                await axios.delete(`http://localhost:5000/api/warnings/${id}`);
                setMessage({ type: 'success', text: 'Warning deleted successfully!' });
                fetchWarnings();
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to delete warning' });
            }
        }
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            'Critical': 'badge-danger',
            'High': 'badge-warning',
            'Medium': 'badge-info',
            'Low': 'badge-secondary'
        };
        return badges[severity] || 'badge-secondary';
    };

    const getSeverityIcon = (severity) => {
        const icons = {
            'Critical': '🚨',
            'High': '⚠️',
            'Medium': 'ℹ️',
            'Low': '📝'
        };
        return icons[severity] || '📝';
    };

    return (
        <div className="page-wrapper">
            <div className="header">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1>🏥 Medi Care Hospital - Warnings Portal</h1>
                </Link>
                <div className="header-right">
                    <div className="user-info">
                        <span>👤 {admin?.username}</span>
                    </div>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </div>

            <nav className="nav-menu">
                <Link to="/dashboard" className="nav-btn">Dashboard</Link>
                <Link to="/assets" className="nav-btn">Assets</Link>
                <Link to="/maintenance" className="nav-btn">Maintenance</Link>
                <Link to="/warnings" className="nav-btn active">Warnings</Link>
                <Link to="/reports" className="nav-btn">Reports</Link>
                <Link to="/settings" className="nav-btn">Settings</Link>
            </nav>

            <div className="container">
                <div className="content-wrapper">
                    <div className="card-header">
                        <h2 className="card-title">System Warnings & Alerts</h2>
                        <button onClick={handleGenerateWarnings} className="btn btn-primary">
                            🔄 Generate Warnings
                        </button>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Severity</th>
                                        <th>Asset Name</th>
                                        <th>Warning Message</th>
                                        <th>Created Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warnings.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                                No warnings found. Click "Generate Warnings" to check for issues.
                                            </td>
                                        </tr>
                                    ) : (
                                        warnings.map(warning => (
                                            <tr key={warning.id}>
                                                <td>
                                                    <span className={`badge ${getSeverityBadge(warning.severity)}`}>
                                                        {getSeverityIcon(warning.severity)} {warning.severity}
                                                    </span>
                                                </td>
                                                <td><strong>{warning.asset_name}</strong></td>
                                                <td>{warning.warning_message}</td>
                                                <td>{new Date(warning.created_date).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDelete(warning.id)}
                                                        className="btn btn-danger"
                                                        style={{ padding: '6px 12px' }}
                                                    >
                                                        Dismiss
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Warnings;
