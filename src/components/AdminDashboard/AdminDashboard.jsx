import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './AdminDashboard.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function AdminDashboard({ admin, onLogout }) {
    const [stats, setStats] = useState({
        totalAssets: 0,
        requiresMaintenance: 0,
        underMaintenance: 0,
        totalWarnings: 0
    });
    const [allAssets, setAllAssets] = useState([]);
    const [allMaintenance, setAllMaintenance] = useState([]);
    const [allWarnings, setAllWarnings] = useState([]);
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [warningsData, setWarningsData] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState({});
    const [maintenanceChartRealData, setMaintenanceChartRealData] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [assetsRes, maintenanceRes, warningsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/assets'),
                axios.get('http://localhost:5000/api/maintenance'),
                axios.get('http://localhost:5000/api/warnings')
            ]);

            const assets = assetsRes.data;
            const maintenance = maintenanceRes.data;
            const warnings = warningsRes.data;

            // Store all data
            setAllAssets(assets);
            setAllMaintenance(maintenance);
            setAllWarnings(warnings);

            // Calculate stats
            setStats({
                totalAssets: assets.length,
                requiresMaintenance: maintenance.filter(m => m.status === 'Pending').length,
                underMaintenance: maintenance.filter(m => m.status === 'In Progress').length,
                totalWarnings: warnings.length
            });

            // Recent maintenance (last 5)
            setMaintenanceData(maintenance.slice(0, 5));

            // Recent warnings (last 5)
            setWarningsData(warnings.slice(0, 5));

            // Category breakdown
            const breakdown = assets.reduce((acc, asset) => {
                acc[asset.category] = (acc[asset.category] || 0) + 1;
                return acc;
            }, {});
            setCategoryBreakdown(breakdown);

            // Process maintenance data for chart (last 6 months)
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentDate = new Date();
            const last6Months = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                last6Months.push({
                    month: monthNames[date.getMonth()],
                    year: date.getFullYear(),
                    monthIndex: date.getMonth(),
                    pending: 0,
                    inProgress: 0,
                    completed: 0
                });
            }

            // Count maintenance records by month and status
            maintenance.forEach(record => {
                const recordDate = new Date(record.scheduled_date || record.created_at);
                const monthData = last6Months.find(m =>
                    m.monthIndex === recordDate.getMonth() &&
                    m.year === recordDate.getFullYear()
                );

                if (monthData) {
                    if (record.status === 'Pending') monthData.pending++;
                    else if (record.status === 'In Progress') monthData.inProgress++;
                    else if (record.status === 'Completed') monthData.completed++;
                }
            });

            setMaintenanceChartRealData({
                labels: last6Months.map(m => m.month),
                pending: last6Months.map(m => m.pending),
                inProgress: last6Months.map(m => m.inProgress),
                completed: last6Months.map(m => m.completed)
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter data based on selected category
    useEffect(() => {
        if (selectedCategory === 'All') {
            setMaintenanceData(allMaintenance.slice(0, 5));
            setWarningsData(allWarnings.slice(0, 5));
        } else {
            // Filter maintenance by category
            const filteredMaintenance = allMaintenance.filter(m => {
                const asset = allAssets.find(a => a.id === m.asset_id);
                return asset && asset.category === selectedCategory;
            });
            setMaintenanceData(filteredMaintenance.slice(0, 5));

            // Filter warnings by category
            const filteredWarnings = allWarnings.filter(w => {
                const asset = allAssets.find(a => a.id === w.asset_id);
                return asset && asset.category === selectedCategory;
            });
            setWarningsData(filteredWarnings.slice(0, 5));
        }
    }, [selectedCategory, allAssets, allMaintenance, allWarnings]);

    // Maintenance Overview Chart Data - Using Real Database Data
    const maintenanceChartData = maintenanceChartRealData ? {
        labels: maintenanceChartRealData.labels,
        datasets: [
            {
                label: 'Pending',
                data: maintenanceChartRealData.pending,
                backgroundColor: '#F59E0B',
            },
            {
                label: 'In Progress',
                data: maintenanceChartRealData.inProgress,
                backgroundColor: '#3B82F6',
            },
            {
                label: 'Completed',
                data: maintenanceChartRealData.completed,
                backgroundColor: '#10B981',
            }
        ]
    } : {
        labels: [],
        datasets: []
    };

    const maintenanceChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#F1F5F9'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    // Asset Category Breakdown Pie Chart
    const categoryChartData = {
        labels: Object.keys(categoryBreakdown),
        datasets: [
            {
                data: Object.values(categoryBreakdown),
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6',
                    '#EC4899',
                    '#14B8A6'
                ],
                borderWidth: 0,
            }
        ]
    };

    const categoryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                        size: 11
                    }
                }
            },
            title: {
                display: false,
            },
        }
    };



    return (
        <>
            <Sidebar admin={admin} />

            {/* Main Content */}
            <main className="admin-main with-sidebar">
                {/* Top Bar */}
                <div className="admin-topbar">
                    <div className="topbar-left">
                        <button className="menu-toggle">☰</button>
                        <h1 className="page-title">Dashboard</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-user">
                            <img src="https://ui-avatars.com/api/?name=Peter+Nilliams&background=3B82F6&color=fff" alt="User" className="topbar-avatar" />
                            <span className="topbar-username">Praneeth</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="stat-card-icon blue">📊</div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Total Assets</div>
                            <div className="stat-card-value">{stats.totalAssets}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-card-icon orange">⚠️</div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Requires Maintenance</div>
                            <div className="stat-card-value">{stats.requiresMaintenance}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-card-icon purple">🔧</div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Under Maintenance</div>
                            <div className="stat-card-value">{stats.underMaintenance}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-card-icon cyan">🔔</div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Total Warnings</div>
                            <div className="stat-card-value">{stats.totalWarnings}</div>
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="category-tabs">
                    <button
                        className={`category-tab ${selectedCategory === 'All' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('All')}
                    >
                        🏥 All
                    </button>
                    <button
                        className={`category-tab ${selectedCategory === 'Imaging' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Imaging')}
                    >
                        📷 Imaging
                    </button>
                    <button
                        className={`category-tab ${selectedCategory === 'Life Support' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Life Support')}
                    >
                        💓 Life Support
                    </button>
                    <button
                        className={`category-tab ${selectedCategory === 'Monitoring' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Monitoring')}
                    >
                        📊 Monitoring
                    </button>
                    <button
                        className={`category-tab ${selectedCategory === 'Pumps' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Pumps')}
                    >
                        💉 Pumps
                    </button>
                    <button
                        className={`category-tab ${selectedCategory === 'Surgical' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Surgical')}
                    >
                        🔬 Surgical
                    </button>
                    <button
                        className={`category-tab ${selectedCategory === 'Lab Equipment' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Lab Equipment')}
                    >
                        🧪 Lab Equipment
                    </button>
                </div>

                {/* Charts Section */}
                <div className="charts-grid">
                    {/* Maintenance Overview Chart */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3 className="chart-title">Maintenance Overview</h3>
                        </div>
                        <div className="chart-container">
                            {!loading && <Bar data={maintenanceChartData} options={maintenanceChartOptions} />}
                        </div>
                    </div>

                    {/* Asset Category Breakdown */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3 className="chart-title">Asset Category Breakdown</h3>
                        </div>
                        <div className="chart-container pie-chart">
                            {!loading && Object.keys(categoryBreakdown).length > 0 && (
                                <Pie data={categoryChartData} options={categoryChartOptions} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Tables Section */}
                <div className="tables-grid">
                    {/* Recent Maintenance Requests */}
                    <div className="table-card">
                        <div className="table-header">
                            <h3 className="table-title">Recent Maintenance Requests</h3>
                            <Link to="/maintenance" className="view-all-link">View All →</Link>
                        </div>
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Asset ID</th>
                                        <th>Asset Name</th>
                                        <th>Category</th>
                                        <th>Technician</th>
                                        <th>Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {maintenanceData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                                No maintenance requests found{selectedCategory !== 'All' ? ` for ${selectedCategory}` : ''}
                                            </td>
                                        </tr>
                                    ) : (
                                        maintenanceData.map((item) => {
                                            const asset = allAssets.find(a => a.id === item.asset_id);
                                            return (
                                                <tr key={item.id}>
                                                    <td>MR-ID-{String(item.asset_id).padStart(3, '0')}</td>
                                                    <td>{item.asset_name}</td>
                                                    <td>{asset ? asset.category : 'N/A'}</td>
                                                    <td>{item.technician || 'Unassigned'}</td>
                                                    <td>
                                                        <span className={`priority-badge ${item.status === 'Pending' ? 'high' : 'medium'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Warnings */}
                    <div className="table-card">
                        <div className="table-header">
                            <h3 className="table-title">Recent Warnings</h3>
                            <Link to="/warnings" className="view-all-link">View All →</Link>
                        </div>
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Asset ID</th>
                                        <th>Asset Name</th>
                                        <th>Category</th>
                                        <th>Warning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warningsData.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                                No warnings found{selectedCategory !== 'All' ? ` for ${selectedCategory}` : ''}
                                            </td>
                                        </tr>
                                    ) : (
                                        warningsData.map((warning) => {
                                            const asset = allAssets.find(a => a.id === warning.asset_id);
                                            return (
                                                <tr key={warning.id}>
                                                    <td>MR-ID-{String(warning.asset_id).padStart(3, '0')}</td>
                                                    <td>{warning.asset_name}</td>
                                                    <td>{asset ? asset.category : 'N/A'}</td>
                                                    <td>
                                                        <span className={`warning-badge ${warning.severity.toLowerCase()}`}>
                                                            {warning.severity}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default AdminDashboard;
