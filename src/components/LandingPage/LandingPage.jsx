import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="landing-header">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h1 className="project-name">
                            <span className="hospital-emoji">🏥</span>
                            MediTrack
                        </h1>
                    </Link>
                    <p className="project-tagline">
                        Hospital Asset & Equipment Maintenance Tracking System
                    </p>
                    <p className="project-description">
                        Streamline your medical equipment maintenance with our comprehensive tracking solution.
                        Monitor assets, manage work orders, and ensure optimal equipment performance.
                    </p>
                </div>

                <button className="get-started-btn" onClick={handleGetStarted}>
                    Get Started
                    <span className="arrow">→</span>
                </button>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Real-time Tracking</h3>
                        <p>Monitor equipment status and maintenance schedules in real-time</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔧</div>
                        <h3>Work Order Management</h3>
                        <p>Efficiently assign and track maintenance tasks</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📈</div>
                        <h3>Analytics & Reports</h3>
                        <p>Gain insights with comprehensive analytics and reporting</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
