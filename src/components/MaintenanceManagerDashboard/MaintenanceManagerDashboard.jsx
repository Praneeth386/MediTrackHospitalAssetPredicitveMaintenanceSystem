import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../Sidebar/Sidebar';
import './MaintenanceManagerDashboard.css';

function MaintenanceManagerDashboard({ admin, onLogout }) {
    const [stats, setStats] = useState({
        totalWorkOrders: 0,
        inProgress: 0,
        pending: 0,
        completed: 0
    });
    const [workOrders, setWorkOrders] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [technicianEmail, setTechnicianEmail] = useState('');
    const [technicianPhone, setTechnicianPhone] = useState('');
    const [showTechnicianModal, setShowTechnicianModal] = useState(false);
    const [selectedTechnicianInfo, setSelectedTechnicianInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch maintenance records
            const maintenanceRes = await axios.get('http://localhost:5000/api/maintenance');
            const maintenanceData = maintenanceRes.data;
            setWorkOrders(maintenanceData);

            // Fetch technician statistics
            const techStatsRes = await axios.get('http://localhost:5000/api/maintenance/technicians/stats');
            const techStats = techStatsRes.data;

            // List of technicians to remove if they have no email and no phone
            const techniciansToRemove = ['arun', 'Emily Brown', 'David Wilson', 'John Smith', 'Mike', 'Mike Davis', 'Sarah Johnson'];

            const filteredTechs = techStats.filter(tech => {
                const isTargeted = techniciansToRemove.includes(tech.name);
                const hasNoEmail = !tech.email || tech.email === 'No email' || tech.email === 'N/A';
                const hasNoPhone = !tech.phone || tech.phone === 'No phone' || tech.phone === 'N/A';

                // If it's one of the targeted people AND they don't have contact info, remove them
                if (isTargeted && hasNoEmail && hasNoPhone) {
                    return false;
                }
                return true;
            });

            setTechnicians(filteredTechs);

            setStats({
                totalWorkOrders: maintenanceData.length,
                inProgress: maintenanceData.filter(m => m.status === 'In Progress').length,
                pending: maintenanceData.filter(m => m.status === 'Pending').length,
                completed: maintenanceData.filter(m => m.status === 'Completed').length
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (status) => {
        const colors = {
            'Pending': '#F59E0B',
            'In Progress': '#3B82F6',
            'Calibration': '#8B5CF6',
            'Completed': '#10B981'
        };
        return colors[status] || '#6B7280';
    };

    const handleStatusUpdate = async (maintenanceId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/maintenance/${maintenanceId}/status`, {
                status: newStatus
            });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleAssignClick = (workOrder) => {
        setSelectedWorkOrder(workOrder);
        setSelectedTechnician(workOrder.technician || '');
        setTechnicianEmail('');
        setTechnicianPhone('');
        setShowAssignModal(true);
    };

    const handleTechnicianCardClick = (technician) => {
        // Get all work orders for this technician
        const techWorkOrders = workOrders.filter(wo => wo.technician === technician.name);
        setSelectedTechnicianInfo({ ...technician, workOrders: techWorkOrders });
        setShowTechnicianModal(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedTechnician) {
            alert('Please enter technician name');
            return;
        }
        if (!technicianEmail) {
            alert('Please enter technician email');
            return;
        }
        if (!technicianPhone) {
            alert('Please enter technician phone number');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/maintenance/${selectedWorkOrder.id}/assign`, {
                technician: selectedTechnician,
                email: technicianEmail,
                phone: technicianPhone
            });
            alert('Work order assigned successfully! Email notification sent to technician.');
            setShowAssignModal(false);
            setSelectedWorkOrder(null);
            setSelectedTechnician('');
            setTechnicianEmail('');
            setTechnicianPhone('');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error assigning work order:', error);
            alert('Failed to assign work order');
        }
    };


    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: '#fff',
                    padding: '15px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '5px' }}>
                        👤 {data.fullName}
                    </p>
                    <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '10px' }}>
                        <div style={{ marginBottom: '4px' }}>📧 {data.email}</div>
                        <div>📞 {data.phone}</div>
                    </div>
                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
                        {payload.map((entry, index) => (
                            <div key={index} style={{ color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '20px', fontSize: '12px', fontWeight: 600 }}>
                                <span>{entry.name}:</span>
                                <span>{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const getWorkOrderStatusData = () => {
        return [
            { name: 'Pending', value: stats.pending, color: '#F59E0B' },
            { name: 'In Progress', value: stats.inProgress, color: '#3B82F6' },
            { name: 'Completed', value: stats.completed, color: '#10B981' }
        ];
    };

    const getTechnicianChartData = () => {
        return technicians.map(tech => ({
            name: tech.name.split(' ')[0], // First name only
            fullName: tech.name,
            email: tech.email || 'N/A',
            phone: tech.phone || 'N/A',
            Pending: tech.pending || 0,
            'In Progress': tech.in_progress || 0,
            Completed: tech.completed || 0
        }));
    };

    return (
        <>
            <Sidebar admin={admin} />
            <div className="maintenance-manager-dashboard with-sidebar">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <Link to="/" className="logo">
                            <span className="logo-icon">+</span>
                            <span className="logo-text">MediCare</span>
                        </Link>
                        <h1 className="page-title">Maintenance Manager Dashboard</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-role">🛠️ Maintenance Manager</span>
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
                        <div className="stat-icon" style={{ background: '#3B82F6' }}>📋</div>
                        <div className="stat-content">
                            <div className="stat-label">Total Work Orders</div>
                            <div className="stat-value">{stats.totalWorkOrders}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#F59E0B' }}>⏳</div>
                        <div className="stat-content">
                            <div className="stat-label">Pending</div>
                            <div className="stat-value">{stats.pending}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#8B5CF6' }}>🔧</div>
                        <div className="stat-content">
                            <div className="stat-label">In Progress</div>
                            <div className="stat-value">{stats.inProgress}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#10B981' }}>✓</div>
                        <div className="stat-content">
                            <div className="stat-label">Completed</div>
                            <div className="stat-value">{stats.completed}</div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="dashboard-content">
                    {/* Work Orders */}
                    <section className="content-card large">
                        <div className="section-header-with-search" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>Work Order Queue</h2>
                            <div className="search-box" style={{ position: 'relative', width: '350px' }}>
                                <input
                                    type="text"
                                    placeholder="Search asset or work order ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 18px 12px 42px',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        outline: 'none',
                                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#0ea5e9';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E2E8F0';
                                        e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                                    }}
                                />
                                <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '18px' }}>🔍</span>
                            </div>
                        </div>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Equipment</th>
                                            <th>Issue</th>
                                            <th>Technician</th>
                                            <th>Status</th>
                                            <th>Scheduled</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workOrders
                                            .filter(wo => wo.status !== 'Completed')
                                            .filter(wo => {
                                                const searchLower = searchTerm.toLowerCase();
                                                const orderIdStr = `WO-${String(wo.id).padStart(4, '0')}`.toLowerCase();
                                                return wo.asset_name.toLowerCase().includes(searchLower) ||
                                                    orderIdStr.includes(searchLower) ||
                                                    (wo.issue_description && wo.issue_description.toLowerCase().includes(searchLower));
                                            })
                                            .map(order => (
                                            <tr key={order.id}>
                                                <td className="order-id">WO-{String(order.id).padStart(4, '0')}</td>
                                                <td className="equipment-name">{order.asset_name}</td>
                                                <td className="issue-desc">{order.issue_description.substring(0, 100)}...</td>
                                                <td>{order.technician}</td>
                                                <td>
                                                    <span
                                                        className="status-badge"
                                                        style={{
                                                            background: `${getPriorityColor(order.status)}20`,
                                                            color: getPriorityColor(order.status)
                                                        }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{order.scheduled_date}</td>
                                                <td>
                                                    <button className="action-btn" onClick={() => handleAssignClick(order)}>Assign</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Technician Workload */}
                    <section className="content-card" style={{ gridColumn: '1 / -1' }}>
                        <h2 className="section-title">Technician Workload</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={500}>
                                    <BarChart 
                                        data={getTechnicianChartData()} 
                                        margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
                                        barCategoryGap="25%"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="name"
                                            interval={0}
                                            angle={-30}
                                            textAnchor="end"
                                            style={{ fontSize: '14px', fontWeight: 600, fill: '#475569' }}
                                            height={90}
                                        />
                                        <YAxis style={{ fontSize: '14px', fontWeight: 600, fill: '#475569' }} />
                                        <Tooltip 
                                            content={<CustomTooltip />}
                                            cursor={{ fill: '#F1F5F9' }}
                                        />
                                        <Legend verticalAlign="top" height={50} iconType="circle" />
                                        <Bar dataKey="Pending" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="In Progress" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="Completed" fill="#10B981" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="technician-list" style={{ 
                                    marginTop: '30px', 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '20px' 
                                }}>
                                    {technicians.map((tech, index) => {
                                        const activeTasks = (tech.pending || 0) + (tech.in_progress || 0);
                                        return (
                                            <div
                                                key={index}
                                                className="technician-card"
                                                onClick={() => handleTechnicianCardClick(tech)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="tech-header">
                                                    <span className="tech-name">👤 {tech.name}</span>
                                                </div>
                                                <div className="tech-contact" style={{ fontSize: '13px', color: '#666', marginTop: '8px', marginBottom: '12px' }}>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        📧 <a href={`mailto:${tech.email}`} style={{ color: '#3B82F6', textDecoration: 'none' }}>{tech.email || 'No email'}</a>
                                                    </div>
                                                    <div>
                                                        📞 <span style={{ color: '#666' }}>{tech.phone || 'No phone'}</span>
                                                    </div>
                                                </div>
                                                <div className="tech-stats">
                                                    <div className="tech-stat">
                                                        <div className="tech-stat-label">Pending</div>
                                                        <div className="tech-stat-value" style={{ color: '#F59E0B' }}>{tech.pending || 0}</div>
                                                    </div>
                                                    <div className="tech-stat">
                                                        <div className="tech-stat-label">In Progress</div>
                                                        <div className="tech-stat-value" style={{ color: '#3B82F6' }}>{tech.in_progress || 0}</div>
                                                    </div>
                                                    <div className="tech-stat">
                                                        <div className="tech-stat-label">Completed</div>
                                                        <div className="tech-stat-value completed">{tech.completed || 0}</div>
                                                    </div>
                                                </div>
                                                <div className="workload-bar">
                                                    <div
                                                        className="workload-fill"
                                                        style={{ width: `${Math.min((activeTasks / 5) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="workload-label">
                                                    {activeTasks < 3 ? 'Available' : activeTasks < 5 ? 'Moderate' : 'High Load'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Work Order Status Chart */}
                    <section className="content-card" style={{ gridColumn: '1 / -1' }}>
                        <h2 className="section-title">Work Order Status Distribution</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={getWorkOrderStatusData()}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={(entry) => `${entry.name}: ${entry.value}`}
                                    >
                                        {getWorkOrderStatusData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </section>
                </div>

                {/* Assign Modal */}
                {showAssignModal && (
                    <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Assign Work Order</h3>
                            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <p style={{ margin: '4px 0' }}><strong>Order ID:</strong> WO-{String(selectedWorkOrder?.id).padStart(4, '0')}</p>
                                <p style={{ margin: '4px 0' }}><strong>Equipment:</strong> {selectedWorkOrder?.asset_name}</p>
                                <p style={{ margin: '4px 0' }}><strong>Issue:</strong> {selectedWorkOrder?.issue_description}</p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                    👤 Technician Name: <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="technician-input"
                                    placeholder="Enter technician full name"
                                    value={selectedTechnician}
                                    onChange={(e) => setSelectedTechnician(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                    📧 Email Address: <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    className="technician-input"
                                    placeholder="technician@example.com"
                                    value={technicianEmail}
                                    onChange={(e) => setTechnicianEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                    📞 Phone Number: <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="tel"
                                    className="technician-input"
                                    placeholder="(555) 123-4567"
                                    value={technicianPhone}
                                    onChange={(e) => setTechnicianPhone(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{
                                padding: '12px',
                                backgroundColor: '#eff6ff',
                                borderLeft: '4px solid #3B82F6',
                                borderRadius: '4px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
                                    💡 <strong>Note:</strong> An email notification with work order details will be sent to the entered email address.
                                </p>
                            </div>

                            <div className="modal-actions">
                                <button className="action-btn" onClick={handleAssignSubmit}>
                                    Assign & Send Email
                                </button>
                                <button className="reject-btn" onClick={() => setShowAssignModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Technician Details Modal */}
                {showTechnicianModal && selectedTechnicianInfo && (
                    <div className="modal-overlay" onClick={() => setShowTechnicianModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ borderBottom: '2px solid #3B82F6', paddingBottom: '10px', color: '#3B82F6' }}>
                                👤 Technician Details
                            </h3>

                            {/* Contact Information */}
                            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h4 style={{ marginTop: 0, color: '#374151' }}>Contact Information</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <strong>Name:</strong> {selectedTechnicianInfo.name}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> <a href={`mailto:${selectedTechnicianInfo.email}`} style={{ color: '#3B82F6', textDecoration: 'none' }}>{selectedTechnicianInfo.email || 'N/A'}</a>
                                    </div>
                                    <div>
                                        <strong>Phone:</strong> {selectedTechnicianInfo.phone || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Active Tasks:</strong> {(selectedTechnicianInfo.pending || 0) + (selectedTechnicianInfo.in_progress || 0)}
                                    </div>
                                </div>
                            </div>

                            {/* Work Orders */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#374151' }}>📋 Assigned Work Orders ({selectedTechnicianInfo.workOrders?.length || 0})</h4>
                                {selectedTechnicianInfo.workOrders && selectedTechnicianInfo.workOrders.length > 0 ? (
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {selectedTechnicianInfo.workOrders.map((wo, idx) => (
                                            <div key={idx} style={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '15px',
                                                marginBottom: '10px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <strong style={{ fontSize: '16px' }}>WO-{String(wo.id).padStart(4, '0')}</strong>
                                                    <span style={{
                                                        backgroundColor: getPriorityColor(wo.status),
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px'
                                                    }}>
                                                        {wo.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                                    <strong>Equipment:</strong> {wo.asset_name}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                                    <strong>Issue:</strong> {wo.issue_description}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                                                    <div>
                                                        <strong>📅 Assigned:</strong> {wo.created_at ? new Date(wo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>⏰ Due:</strong> {wo.scheduled_date ? new Date(wo.scheduled_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'To be determined'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>No work orders assigned to this technician yet.</p>
                                )}
                            </div>

                            {/* Email Preview */}
                            {selectedTechnicianInfo.workOrders && selectedTechnicianInfo.workOrders.length > 0 && (
                                <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '8px', border: '1px solid #3B82F6' }}>
                                    <h4 style={{ marginTop: 0, color: '#1e40af' }}>📧 Email Notification Preview</h4>
                                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>
                                        <p style={{ fontSize: '16px', marginTop: 0 }}>Dear <strong>{selectedTechnicianInfo.name}</strong>,</p>
                                        <p>You have been assigned to perform repair/maintenance tasks. Below are your current assignments:</p>

                                        {selectedTechnicianInfo.workOrders.slice(0, 2).map((wo, idx) => (
                                            <div key={idx} style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
                                                <div style={{ color: '#1e40af', fontWeight: 'bold', marginBottom: '10px' }}>
                                                    Work Order: WO-{String(wo.id).padStart(4, '0')}
                                                </div>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <strong>Equipment:</strong> {wo.asset_name}
                                                </div>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <strong>Issue:</strong> {wo.issue_description}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                                                    <div>
                                                        <strong>Assignment Date:</strong><br />
                                                        {wo.created_at ? new Date(wo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>Due Date:</strong><br />
                                                        {wo.scheduled_date ? new Date(wo.scheduled_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'To be determined'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {selectedTechnicianInfo.workOrders.length > 2 && (
                                            <p style={{ fontStyle: 'italic', color: '#666' }}>
                                                ...and {selectedTechnicianInfo.workOrders.length - 2} more work order(s)
                                            </p>
                                        )}

                                        <p style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981', borderRadius: '4px' }}>
                                            <strong>⚡ Action Required:</strong> Please log in to the MediTrack system to view complete details and update work order status as you progress.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button className="reject-btn" onClick={() => setShowTechnicianModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default MaintenanceManagerDashboard;
