import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ admin, onLogout }) {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/assets', label: 'Assets', icon: '📦' },
        { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
        { path: '/warnings', label: 'Warnings', icon: '⚠️' },
        { path: '/reports', label: 'Reports', icon: '📊' },
        { path: '/settings', label: 'Settings', icon: '⚙️' }
    ];

    // Add role-specific dashboard link
    const getRoleDashboardLink = () => {
        if (!admin?.role) return null;

        const roleLinks = {
            'Admin': { path: '/admin', label: 'Admin Dashboard', icon: '👑' },
            'Biomedical Technician': { path: '/biomedical-technician', label: 'Tech Dashboard', icon: '🔬' },
            'Department Head': { path: '/department-head', label: 'Dept Dashboard', icon: '👔' },
            'Maintenance Manager': { path: '/maintenance-manager', label: 'Manager Dashboard', icon: '🛠️' }
        };

        return roleLinks[admin.role];
    };

    const roleDashboard = getRoleDashboardLink();

    // New Join link for Admin
    const isUserAdmin = admin?.role === 'Admin';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Link to="/" className="sidebar-logo">
                    <span className="sidebar-logo-icon">+</span>
                    <span className="sidebar-logo-text">MediCare</span>
                </Link>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Link>
                ))}

                {roleDashboard && (
                    <>
                        <div className="sidebar-divider"></div>
                        <Link
                            to={roleDashboard.path}
                            className={`sidebar-nav-item ${location.pathname === roleDashboard.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{roleDashboard.icon}</span>
                            <span className="nav-label">{roleDashboard.label}</span>
                        </Link>
                        {isUserAdmin && (
                            <Link
                                to="/new-join"
                                className={`sidebar-nav-item ${location.pathname === '/new-join' ? 'active' : ''}`}
                            >
                                <span className="nav-icon">👤</span>
                                <span className="nav-label">New Join</span>
                            </Link>
                        )}
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="user-avatar">{admin?.username?.charAt(0).toUpperCase()}</div>
                    <div className="user-details">
                        <div className="user-name">{admin?.username}</div>
                        <div className="user-role">{admin?.role}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
