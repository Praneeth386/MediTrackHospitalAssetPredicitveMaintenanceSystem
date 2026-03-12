import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import BiomedicalTechnicianDashboard from './components/BiomedicalTechnicianDashboard/BiomedicalTechnicianDashboard';
import DepartmentHeadDashboard from './components/DepartmentHeadDashboard/DepartmentHeadDashboard';
import MaintenanceManagerDashboard from './components/MaintenanceManagerDashboard/MaintenanceManagerDashboard';
import Assets from './components/Assets/Assets';
import Maintenance from './components/Maintenance/Maintenance';
import Warnings from './components/Warnings/Warnings';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import NewJoin from './components/AdminDashboard/NewJoin';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(null);

    // Don't auto-authenticate - always show login page first
    // Users must explicitly log in

    const handleLogin = (adminData) => {
        setAdmin(adminData);
        setIsAuthenticated(true);
        localStorage.setItem('admin', JSON.stringify(adminData));
    };

    const handleLogout = () => {
        setAdmin(null);
        setIsAuthenticated(false);
        localStorage.removeItem('admin');
    };

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ?
                                <Navigate to="/dashboard" /> :
                                <Login onLogin={handleLogin} />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            isAuthenticated ?
                                <Dashboard admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            isAuthenticated ?
                                <AdminDashboard admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/assets"
                        element={
                            isAuthenticated ?
                                <Assets admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/maintenance"
                        element={
                            isAuthenticated ?
                                <Maintenance admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/warnings"
                        element={
                            isAuthenticated ?
                                <Warnings admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            isAuthenticated ?
                                <Reports admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            isAuthenticated ?
                                <Settings admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/biomedical-technician"
                        element={
                            isAuthenticated ?
                                <BiomedicalTechnicianDashboard admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/department-head"
                        element={
                            isAuthenticated ?
                                <DepartmentHeadDashboard admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/maintenance-manager"
                        element={
                            isAuthenticated ?
                                <MaintenanceManagerDashboard admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/new-join"
                        element={
                            isAuthenticated ?
                                <NewJoin admin={admin} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />

                    <Route path="/" element={<LandingPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
