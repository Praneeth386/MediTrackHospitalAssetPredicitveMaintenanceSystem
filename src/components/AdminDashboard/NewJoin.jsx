import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import './NewJoin.css';

function NewJoin({ admin, onLogout }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Biomedical Technician',
        fullName: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);

    const roles = [
        'Biomedical Technician',
        'Department Head',
        'Maintenance Manager'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setCreatedUser(null);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/add_user', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            setMessage({ type: 'success', text: 'New member added successfully!' });
            setCreatedUser({
                username: formData.username,
                password: formData.password,
                role: formData.role
            });
            // Clear form
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'Biomedical Technician',
                fullName: ''
            });
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to add new member.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-layout">
            <Sidebar admin={admin} onLogout={onLogout} />
            <main className="admin-main with-sidebar">
                <div className="admin-topbar">
                    <div className="topbar-left">
                        <h1 className="page-title">Add New Personnel</h1>
                    </div>
                </div>

                <div className="new-join-container">
                    <div className="new-join-card">
                        <div className="card-header">
                            <h2>New Join Details</h2>
                            <p>Fill in the details to create a new staff account and allocate credentials.</p>
                        </div>

                        <form className="new-join-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Enter full name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Allocate username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Set initial password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="role">Job Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="role-select"
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {message.text && (
                                <div className={`message-banner ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Processing...' : 'Submit & Create Account'}
                                </button>
                            </div>
                        </form>

                        {createdUser && (
                            <div className="credentials-box">
                                <h3>Account Created Successfully!</h3>
                                <p>Please share these credentials with the new join:</p>
                                <div className="credentials-details">
                                    <div className="credential-item">
                                        <span>Username:</span> <strong>{createdUser.username}</strong>
                                    </div>
                                    <div className="credential-item">
                                        <span>Password:</span> <strong>{createdUser.password}</strong>
                                    </div>
                                    <div className="credential-item">
                                        <span>Role:</span> <strong>{createdUser.role}</strong>
                                    </div>
                                </div>
                                <div className="access-info">
                                    <p>The user can now access the <strong>{createdUser.role} Dashboard</strong> using these credentials.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default NewJoin;
