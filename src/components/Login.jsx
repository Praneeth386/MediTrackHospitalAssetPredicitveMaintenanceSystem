import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const roles = [
        'Admin',
        'Biomedical Technician',
        'Department Head',
        'Maintenance Manager'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    // Validation Function
    const validateForm = () => {
        const { username, password, role } = formData;

        if (!username || username.trim() === '') {
            setError("Please enter your username or email.");
            return false;
        }

        if (!password || password.trim() === '') {
            setError("Please enter your password.");
            return false;
        }

        if (password.length < 5) {
            setError("Password must be at least 5 characters long.");
            return false;
        }

        if (!role) {
            setError("Please select your role.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Run validation before API call
        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username: formData.username,
                password: formData.password,
                role: formData.role
            });

            if (response.data.user) {
                onLogin(response.data.user);

                // Role-based redirect
                const role = response.data.user.role;
                if (role === 'Admin') {
                    navigate('/admin');
                } else if (role === 'Biomedical Technician') {
                    navigate('/biomedical-technician');
                } else if (role === 'Department Head') {
                    navigate('/department-head');
                } else if (role === 'Maintenance Manager') {
                    navigate('/maintenance-manager');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>🏥 MediCare Hospital</h1>
                        </Link>
                        <p>Connecting Care, One Asset at a Time</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <h2>Login</h2>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Username or Email</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="form-control"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username or email"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                className="form-control"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select your role</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
