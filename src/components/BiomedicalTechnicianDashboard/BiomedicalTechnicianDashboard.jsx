import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../Sidebar/Sidebar';
import AssetDetailsModal from '../AssetDetailsModal/AssetDetailsModal';
import NotificationPopup from '../NotificationPopup/NotificationPopup';
import './BiomedicalTechnicianDashboard.css';

function BiomedicalTechnicianDashboard({ admin, onLogout }) {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        needsCalibration: 0,
        underMaintenance: 0,
        upcomingPM: 0
    });
    const [equipment, setEquipment] = useState([]);
    const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [assetMaintenanceHistory, setAssetMaintenanceHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchData();
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [assetsRes, maintenanceRes, overdueRes] = await Promise.all([
                axios.get('http://localhost:5000/api/assets'),
                axios.get('http://localhost:5000/api/maintenance'),
                axios.get('http://localhost:5000/api/maintenance/overdue')
            ]);

            const assetsData = assetsRes.data;
            const maintenanceData = maintenanceRes.data;
            const overdueData = overdueRes.data;

            setEquipment(assetsData);
            setMaintenanceSchedule(maintenanceData.filter(m => m.status === 'Pending' || m.status === 'In Progress'));
            setOverdueTasks(overdueData);

            setStats({
                totalEquipment: assetsData.length,
                needsCalibration: assetsData.filter(a => a.status === 'Needs Calibration').length,
                underMaintenance: maintenanceData.filter(m => m.status === 'In Progress').length,
                upcomingPM: maintenanceData.filter(m => m.status === 'Pending').length
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/maintenance/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleViewDetails = async (asset) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/maintenance/asset/${asset.id}`);
            setAssetMaintenanceHistory(response.data);
            setSelectedAsset(asset);
        } catch (error) {
            console.error('Error fetching asset details:', error);
            setAssetMaintenanceHistory([]);
            setSelectedAsset(asset);
        }
    };

    const handleRejectTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to reject this overdue task?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/maintenance/${taskId}`);
            alert('Task rejected and removed successfully');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error rejecting task:', error);
            alert('Failed to reject task');
        }
    };

    const handleCloseNotification = async (notificationId) => {
        try {
            await axios.put(`http://localhost:5000/api/maintenance/notifications/${notificationId}/read`);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error closing notification:', error);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus, assetId) => {
        try {
            // Update maintenance task status
            await axios.put(`http://localhost:5000/api/maintenance/${taskId}`, {
                status: newStatus
            });

            // If status is 'Needs Calibration', also update the asset status
            if (newStatus === 'Needs Calibration' && assetId) {
                await axios.put(`http://localhost:5000/api/assets/${assetId}`, {
                    status: 'Needs Calibration'
                });
            }

            alert(`✓ Status updated to "${newStatus}" successfully!`);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Functional': '#10B981',
            'In Use': '#3B82F6',
            'Needs Maintenance': '#F59E0B',
            'Under Maintenance': '#EF4444',
            'Needs Calibration': '#8B5CF6'
        };
        return colors[status] || '#6B7280';
    };

    // Prepare data for Equipment Status Chart - Filter out zero values for cleaner display
    const equipmentStatusData = [
        { name: 'Functional', value: equipment.filter(e => e.status === 'Functional').length, color: '#10B981' },
        { name: 'In Use', value: equipment.filter(e => e.status === 'In Use').length, color: '#3B82F6' },
        { name: 'Needs Maintenance', value: equipment.filter(e => e.status === 'Needs Maintenance').length, color: '#F59E0B' },
        { name: 'Under Maintenance', value: equipment.filter(e => e.status === 'Under Maintenance').length, color: '#EF4444' },
        { name: 'Needs Calibration', value: equipment.filter(e => e.status === 'Needs Calibration').length, color: '#8B5CF6' }
    ].filter(item => item.value > 0); // Only show categories with equipment

    // Prepare data for Maintenance Schedule Chart
    const maintenanceScheduleData = [
        { name: 'Pending', value: maintenanceSchedule.filter(m => m.status === 'Pending').length, color: '#F59E0B' },
        { name: 'In Progress', value: maintenanceSchedule.filter(m => m.status === 'In Progress').length, color: '#3B82F6' },
        { name: 'Overdue', value: overdueTasks.length, color: '#EF4444' }
    ];

    const isTaskOverdue = (scheduledDate) => {
        if (!scheduledDate) return false;
        const today = new Date();
        const scheduled = new Date(scheduledDate);
        return scheduled < today;
    };

    return (
        <>
            <Sidebar admin={admin} onLogout={onLogout} />
            <NotificationPopup notifications={notifications} onClose={handleCloseNotification} />

            <div className="biotech-dashboard with-sidebar">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <Link to="/" className="logo">
                            <span className="logo-icon">+</span>
                            <span className="logo-text">MediCare</span>
                        </Link>
                        <h1 className="page-title">Biomedical Technician Dashboard</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-role">🔧 Biomedical Technician</span>
                            <span className="user-name">{admin?.username}</span>
                        </div>
                        <button className="logout-btn" onClick={onLogout}>
                            Logout <span className="arrow">→</span>
                        </button>
                    </div>
                </header>

                {/* Stats Cards */}
                <section className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#3B82F6' }}>📊</div>
                        <div className="stat-content">
                            <div className="stat-label">Total Equipment</div>
                            <div className="stat-value">{stats.totalEquipment}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#F59E0B' }}>⚠️</div>
                        <div className="stat-content">
                            <div className="stat-label">Needs Calibration</div>
                            <div className="stat-value">{stats.needsCalibration}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#EF4444' }}>🔧</div>
                        <div className="stat-content">
                            <div className="stat-label">Under Maintenance</div>
                            <div className="stat-value">{stats.underMaintenance}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#8B5CF6' }}>📅</div>
                        <div className="stat-content">
                            <div className="stat-label">Upcoming PM</div>
                            <div className="stat-value">{stats.upcomingPM}</div>
                        </div>
                    </div>
                </section>

                {/* Charts Section */}
                <section className="charts-section">
                    <div className="chart-card">
                        <h2 className="chart-title">Equipment Status Distribution</h2>
                        {equipmentStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={equipmentStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {equipmentStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '300px',
                                color: '#6B7280',
                                fontSize: '14px'
                            }}>
                                No equipment data available
                            </div>
                        )}
                    </div>

                    <div className="chart-card">
                        <h2 className="chart-title">Maintenance Schedule Overview</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={maintenanceScheduleData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#3B82F6">
                                    {maintenanceScheduleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Main Content */}
                <div className="dashboard-content">
                    {/* Equipment Status */}
                    <section className="content-card">
                        <h2 className="section-title">Equipment Status Overview</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Equipment ID</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Last Maintenance</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {equipment.map(item => (
                                            <tr key={item.id}>
                                                <td>EQ-{String(item.id).padStart(4, '0')}</td>
                                                <td className="equipment-name">{item.asset_name}</td>
                                                <td>{item.category}</td>
                                                <td>{item.department}</td>
                                                <td>
                                                    <span
                                                        className="status-badge"
                                                        style={{
                                                            background: `${getStatusColor(item.status)}20`,
                                                            color: getStatusColor(item.status)
                                                        }}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>{item.last_maintenance_date || 'N/A'}</td>
                                                <td>
                                                    <button
                                                        className="btn-view-details"
                                                        onClick={() => handleViewDetails(item)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Maintenance Schedule */}
                    <section className="content-card">
                        <h2 className="section-title">Maintenance Schedule</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="maintenance-list">
                                {maintenanceSchedule.map(task => {
                                    const isOverdue = isTaskOverdue(task.scheduled_date) && task.status !== 'Completed';
                                    return (
                                        <div key={task.id} className={`maintenance-item ${isOverdue ? 'overdue' : ''}`}>
                                            <div className="maintenance-header">
                                                <span className="equipment-id">EQ-{String(task.asset_id).padStart(4, '0')}</span>
                                                <div className="header-right">
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => handleStatusUpdate(task.id, e.target.value, task.asset_id)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #D1D5DB',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            background: isOverdue ? '#FEE2E2' : task.status === 'Completed' ? '#D1FAE5' : task.status === 'In Progress' ? '#DBEAFE' : task.status === 'Needs Calibration' ? '#EDE9FE' : '#FEF3C7',
                                                            color: isOverdue ? '#991B1B' : task.status === 'Completed' ? '#065F46' : task.status === 'In Progress' ? '#1E40AF' : task.status === 'Needs Calibration' ? '#5B21B6' : '#92400E'
                                                        }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Needs Calibration">Needs Calibration</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                    {isOverdue && (
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => handleRejectTask(task.id)}
                                                            title="Reject overdue task"
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="maintenance-description">{task.issue_description}</div>
                                            <div className="maintenance-footer">
                                                <span className="technician">👤 {task.technician || 'Unassigned'}</span>
                                                <span className="scheduled-date">📅 {task.scheduled_date || 'Not scheduled'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {selectedAsset && (
                <AssetDetailsModal
                    asset={selectedAsset}
                    maintenanceHistory={assetMaintenanceHistory}
                    onClose={() => setSelectedAsset(null)}
                />
            )}
        </>
    );
}

export default BiomedicalTechnicianDashboard;
