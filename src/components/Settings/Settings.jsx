import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Settings({ admin, onLogout }) {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        maintenance_warning_days: '30',
        maintenance_critical_days: '60',
        hospital_name: 'Medi Care Hospital',
        admin_email: 'praneeth123@gmail.com'
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/settings');
            setFormData({
                maintenance_warning_days: response.data.maintenance_warning_days || '30',
                maintenance_critical_days: response.data.maintenance_critical_days || '60',
                hospital_name: response.data.hospital_name || 'Medi Care Hospital',
                admin_email: response.data.admin_email || 'praneeth123@gmail.com'
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5000/api/settings', formData);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            fetchSettings();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        }
    };

    return (
        <div className="page-wrapper">
            <div className="header">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1>🏥 Medi Care Hospital - Settings Portal</h1>
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
                <Link to="/warnings" className="nav-btn">Warnings</Link>
                <Link to="/reports" className="nav-btn">Reports</Link>
                <Link to="/settings" className="nav-btn active">Settings</Link>
            </nav>

            <div className="container">
                <div className="content-wrapper">
                    <h2 className="card-title">System Settings</h2>

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
                        <div className="card">
                            <form onSubmit={handleSubmit}>
                                <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Hospital Information</h3>

                                <div className="form-group">
                                    <label htmlFor="hospital_name">Hospital Name</label>
                                    <input
                                        type="text"
                                        id="hospital_name"
                                        name="hospital_name"
                                        className="form-control"
                                        value={formData.hospital_name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="admin_email">Admin Email</label>
                                    <input
                                        type="email"
                                        id="admin_email"
                                        name="admin_email"
                                        className="form-control"
                                        value={formData.admin_email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #e5e7eb' }} />

                                <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Maintenance Thresholds</h3>

                                <div className="form-group">
                                    <label htmlFor="maintenance_warning_days">
                                        Warning Threshold (days)
                                        <small style={{ display: 'block', color: '#6b7280', marginTop: '5px' }}>
                                            Generate warnings when maintenance is overdue by this many days
                                        </small>
                                    </label>
                                    <input
                                        type="number"
                                        id="maintenance_warning_days"
                                        name="maintenance_warning_days"
                                        className="form-control"
                                        value={formData.maintenance_warning_days}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="maintenance_critical_days">
                                        Critical Threshold (days)
                                        <small style={{ display: 'block', color: '#6b7280', marginTop: '5px' }}>
                                            Generate critical warnings when maintenance is overdue by this many days
                                        </small>
                                    </label>
                                    <input
                                        type="number"
                                        id="maintenance_critical_days"
                                        name="maintenance_critical_days"
                                        className="form-control"
                                        value={formData.maintenance_critical_days}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </div>

                                <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #e5e7eb' }} />

                                <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Admin Profile</h3>

                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={admin?.username || ''}
                                        disabled
                                        style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                                    />
                                    <small style={{ display: 'block', color: '#6b7280', marginTop: '5px' }}>
                                        Username cannot be changed
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={admin?.email || ''}
                                        disabled
                                        style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                                    />
                                    <small style={{ display: 'block', color: '#6b7280', marginTop: '5px' }}>
                                        Email cannot be changed
                                    </small>
                                </div>

                                <div style={{ marginTop: '30px' }}>
                                    <button type="submit" className="btn btn-primary">
                                        Save Settings
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
