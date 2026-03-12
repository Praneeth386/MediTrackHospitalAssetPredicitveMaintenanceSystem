import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar/Sidebar';
import './Dashboard.css';

function Dashboard({ admin, onLogout }) {
    const [stats, setStats] = useState({
        totalAssets: 0,
        assetsRequiringMaintenance: 0,
        assetsUnderMaintenance: 0,
        totalWarnings: 0
    });

    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const categories = [
        { name: 'All', icon: '🏥', color: '#3B82F6' },
        { name: 'Imaging', icon: '📷', color: '#06B6D4' },
        { name: 'Life Support', icon: '💓', color: '#10B981' },
        { name: 'Monitoring', icon: '📊', color: '#F59E0B' },
        { name: 'Pumps', icon: '💉', color: '#8B5CF6' },
        { name: 'Surgical', icon: '🔬', color: '#EC4899' },
        { name: 'Lab Equipment', icon: '🧪', color: '#14B8A6' }
    ];

    /* -------------------- Fetch Data -------------------- */
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assetsRes, maintenanceRes, warningsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/assets'),
                axios.get('http://localhost:5000/api/maintenance'),
                axios.get('http://localhost:5000/api/warnings')
            ]);

            const assetsData = assetsRes.data;
            const maintenanceData = maintenanceRes.data;
            const warningsData = warningsRes.data;

            setAssets(assetsData);
            setFilteredAssets(assetsData);

            setStats({
                totalAssets: assetsData.length,
                assetsRequiringMaintenance: maintenanceData.filter(
                    m => m.status === 'Pending'
                ).length,
                assetsUnderMaintenance: maintenanceData.filter(
                    m => m.status === 'In Progress'
                ).length,
                totalWarnings: warningsData.length
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    /* -------------------- Filter Assets -------------------- */
    const filterAssets = useCallback(() => {
        let filtered = assets;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(
                asset => asset.category === selectedCategory
            );
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(asset =>
                asset.asset_name.toLowerCase().includes(term) ||
                asset.category.toLowerCase().includes(term)
            );
        }

        setFilteredAssets(filtered);
    }, [assets, selectedCategory, searchTerm]);

    useEffect(() => {
        filterAssets();
    }, [filterAssets]);

    /* -------------------- Status Badge -------------------- */
    const getStatusBadge = (status) => {
        const statusMap = {
            'In Use': {
                label: 'In Use',
                class: 'status-in-use',
                icon: '✓'
            },
            'Needs Maintenance': {
                label: 'Needs Maintenance',
                class: 'status-needs-maintenance',
                icon: '⚠'
            },
            'Functional': {
                label: 'Functional',
                class: 'status-functional',
                icon: '✓'
            },
            'Under Maintenance': {
                label: 'Under Maintenance',
                class: 'status-under-maintenance',
                icon: '🔧'
            }
        };

        const statusInfo = statusMap[status] || {
            label: status,
            class: 'status-default',
            icon: '•'
        };

        return (
            <span className={`status-badge ${statusInfo.class}`}>
                <span className="status-icon">{statusInfo.icon}</span>
                {statusInfo.label}
            </span>
        );
    };

    /* -------------------- UI -------------------- */
    return (
        <>
            <Sidebar admin={admin} />
            <div className="dashboard-wrapper with-sidebar">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <Link to="/" className="logo">
                            <span className="logo-icon">+</span>
                            <span className="logo-text">MediCare</span>
                        </Link>
                    </div>
                    <div className="header-right">
                        <button className="logout-btn" onClick={onLogout}>
                            Logout <span className="arrow">→</span>
                        </button>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Hospital Asset & Equipment<br />
                            Maintenance Tracking System
                        </h1>
                        <p className="hero-subtitle">
                            Track, manage, and maintain your hospital assets<br />
                            and equipment efficiently.
                        </p>

                        {/* Search */}
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search assets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Stats */}
                        <div className="stats-row">
                            <div className="stat-card-mini">
                                <div className="stat-icon-box">📊</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Assets</div>
                                    <div className="stat-value">{stats.totalAssets}</div>
                                </div>
                            </div>

                            <div className="stat-card-mini warning">
                                <div className="stat-icon-box">⚠️</div>
                                <div className="stat-info">
                                    <div className="stat-label">
                                        Assets Requiring<br />Maintenance
                                    </div>
                                    <div className="stat-value">
                                        {stats.assetsRequiringMaintenance}
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card-mini maintenance">
                                <div className="stat-icon-box">🔧</div>
                                <div className="stat-info">
                                    <div className="stat-label">
                                        Assets Under<br />Maintenance
                                    </div>
                                    <div className="stat-value">
                                        {stats.assetsUnderMaintenance}
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card-mini alerts">
                                <div className="stat-icon-box">🔔</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Warnings</div>
                                    <div className="stat-value">
                                        {stats.totalWarnings}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Inventory */}
                <section className="inventory-section">
                    <div className="section-header">
                        <h2 className="section-title">Asset Inventory</h2>
                    </div>

                    {/* Category Filters */}
                    <div className="category-filters">
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                className={`category-btn ${selectedCategory === category.name ? 'active' : ''
                                    }`}
                                onClick={() => setSelectedCategory(category.name)}
                                style={{
                                    borderColor:
                                        selectedCategory === category.name
                                            ? category.color
                                            : '#E5E7EB',
                                    backgroundColor:
                                        selectedCategory === category.name
                                            ? `${category.color}15`
                                            : 'white'
                                }}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-name">{category.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading assets...</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="assets-table">
                                <thead>
                                    <tr>
                                        <th>Asset ID</th>
                                        <th>Asset Name</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="no-data">
                                                No assets found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAssets.slice(0, 10).map(asset => (
                                            <tr key={asset.id}>
                                                <td className="asset-id">
                                                    MR-ID-{String(asset.id).padStart(3, '0')}
                                                </td>
                                                <td className="asset-name">
                                                    {asset.asset_name}
                                                </td>
                                                <td className="asset-category">
                                                    {asset.category}
                                                </td>
                                                <td className="asset-status">
                                                    {getStatusBadge(asset.status)}
                                                </td>
                                                <td className="asset-actions">
                                                    <Link to="/assets" className="view-details-btn">
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Role-Based Navigation */}
                <div className="admin-link-section">
                    {admin?.role === 'Admin' && (
                        <Link to="/admin" className="admin-link-btn">
                            Go to Admin Dashboard →
                        </Link>
                    )}
                    {admin?.role === 'Biomedical Technician' && (
                        <Link to="/biomedical-technician" className="admin-link-btn">
                            Go to Biomedical Technician Dashboard →
                        </Link>
                    )}
                    {admin?.role === 'Department Head' && (
                        <Link to="/department-head" className="admin-link-btn">
                            Go to Department Head Dashboard →
                        </Link>
                    )}
                    {admin?.role === 'Maintenance Manager' && (
                        <Link to="/maintenance-manager" className="admin-link-btn">
                            Go to Maintenance Manager Dashboard →
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}

export default Dashboard;
