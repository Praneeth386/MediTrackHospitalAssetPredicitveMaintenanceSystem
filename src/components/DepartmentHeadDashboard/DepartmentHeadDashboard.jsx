import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Sidebar from '../Sidebar/Sidebar';
import './DepartmentHeadDashboard.css';

function DepartmentHeadDashboard({ admin, onLogout }) {
    const [stats, setStats] = useState({
        totalAssets: 0,
        departmentBudget: 0,
        maintenanceCost: 0,
        pendingApprovals: 0
    });
    const [analytics, setAnalytics] = useState({
        monthly_maintenance: [],
        repair_status: {
            total_allocation: 0,
            spent_so_far: 0,
            monthly_allocation: 0,
            repair_cost_rate: 0,
            completed_repairs: 0,
            pending_repairs: 0,
            remaining_budget: 0
        }
    });
    const [departmentAssets, setDepartmentAssets] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [newBudget, setNewBudget] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assetsRes, maintenanceRes, analyticsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/assets'),
                axios.get('http://localhost:5000/api/maintenance'),
                axios.get('http://localhost:5000/api/reports/dashboard_analytics')
            ]);

            const assetsData = assetsRes.data || [];
            const maintenanceData = maintenanceRes.data || [];
            const analyticsData = analyticsRes.data || {};

            setDepartmentAssets(assetsData);
            setMaintenanceRequests(maintenanceData.filter(m => m.status === 'Pending'));

            if (analyticsData.repair_status) {
                setAnalytics(analyticsData);
                setStats({
                    totalAssets: assetsData.length,
                    departmentBudget: analyticsData.repair_status.total_allocation || 0,
                    maintenanceCost: analyticsData.repair_status.spent_so_far || 0,
                    pendingApprovals: maintenanceData.filter(m => m.status === 'Pending').length
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetUpdate = async () => {
        const budgetValue = parseFloat(newBudget);
        if (isNaN(budgetValue) || budgetValue <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        try {
            await axios.put('http://localhost:5000/api/settings/repair_allocation', { value: budgetValue.toString() });
            fetchData();
            setShowBudgetModal(false);
            setNewBudget('');
            alert('Allocation updated successfully!');
        } catch (error) {
            console.error('Error updating allocation:', error);
            alert('Failed to update allocation');
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await axios.put(`http://localhost:5000/api/maintenance/${requestId}/approve`);
            alert('Maintenance request approved successfully!');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request');
        }
    };

    const handleReject = async (requestId) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            await axios.put(`http://localhost:5000/api/maintenance/${requestId}/reject`, { reason });
            alert('Maintenance request rejected');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request');
        }
    };

    const getCategoryDistribution = () => {
        const distribution = {};
        departmentAssets.forEach(asset => {
            distribution[asset.category] = (distribution[asset.category] || 0) + 1;
        });
        return Object.entries(distribution).map(([category, count]) => ({
            category,
            count,
            percentage: ((count / departmentAssets.length) * 100).toFixed(1)
        }));
    };

    return (
        <>
            <Sidebar admin={admin} />
            <div className="depthead-dashboard with-sidebar">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <Link to="/" className="logo">
                            <span className="logo-icon">+</span>
                            <span className="logo-text">MediCare</span>
                        </Link>
                        <h1 className="page-title">Department Head Dashboard</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-role">👔 Department Head</span>
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
                            <div className="stat-label">Total Assets</div>
                            <div className="stat-value">{stats.totalAssets}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#10B981' }}>💰</div>
                        <div className="stat-content">
                            <div className="stat-label">Total Allocation</div>
                            <div className="stat-value">${(stats.departmentBudget / 1000).toFixed(0)}K</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#F59E0B' }}>💵</div>
                        <div className="stat-content">
                            <div className="stat-label">Total Spent</div>
                            <div className="stat-value">${(stats.maintenanceCost / 1000).toFixed(1)}K</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#EF4444' }}>✓</div>
                        <div className="stat-content">
                            <div className="stat-label">Pending Approvals</div>
                            <div className="stat-value">{stats.pendingApprovals}</div>
                        </div>
                    </div>
                </section>

                {/* New Analytics Section */}
                <div className="dashboard-content">
                    {/* Monthly Maintenance Bill Chart */}
                    <section className="content-card">
                        <h2 className="section-title">Monthly Budget vs Spend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.monthly_maintenance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${(value || 0).toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="spent" fill="#EF4444" name="Spent ($)" />
                                <Bar dataKey="allocated" fill="#10B981" name="Allocated ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="monthly-stats" style={{ marginTop: '15px', padding: '10px', background: '#F3F4F6', borderRadius: '8px' }}>
                            <div className="variation">
                                <strong>Repair Rate: </strong>
                                <span>${(analytics.repair_status?.repair_cost_rate || 0).toLocaleString()} per equipment update</span>
                            </div>
                        </div>
                    </section>

                    {/* Repair Budget Plan */}
                    <section className="content-card">
                        <h2 className="section-title">Repair Budget Plan</h2>
                        <div className="budget-plan-metrics">
                            <div className="plan-metric">
                                <div className="metric-label">Monthly Allocation</div>
                                <div className="metric-value">${(analytics.repair_status?.monthly_allocation || 0).toLocaleString()}</div>
                            </div>
                            <div className="plan-metric">
                                <div className="metric-label">Total Spent (Repairs)</div>
                                <div className="metric-value" style={{ color: '#EF4444' }}>${(analytics.repair_status?.spent_so_far || 0).toLocaleString()}</div>
                            </div>
                            <div className="plan-metric highlight">
                                <div className="metric-label">Remaining Budget</div>
                                <div className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: (analytics.repair_status?.remaining_budget || 0) > 0 ? '#10B981' : '#EF4444' }}>
                                    ${(analytics.repair_status?.remaining_budget || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="budget-status-msg" style={{ marginTop: '10px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            {analytics.repair_status.remaining_budget > 0
                                ? "✅ Repair budget is sufficient for all identified needs."
                                : "⚠️ Budget shortfall detected. Keep track of equipment updates."}
                        </div>
                    </section>
                </div>

                {/* Existing Main Content */}
                <div className="dashboard-content">
                    {/* Asset Distribution */}
                    <section className="content-card">
                        <h2 className="section-title">Asset Distribution by Category</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={getCategoryDistribution()}
                                            dataKey="count"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={(entry) => `${entry.category}: ${entry.percentage}%`}
                                        >
                                            {getCategoryDistribution().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="distribution-list" style={{ marginTop: '20px' }}>
                                    {getCategoryDistribution().map(item => (
                                        <div key={item.category} className="distribution-item">
                                            <div className="distribution-header">
                                                <span className="category-name">{item.category}</span>
                                                <span className="category-count">{item.count} assets</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${item.percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="percentage-label">{item.percentage}%</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Approval Queue */}
                    <section className="content-card">
                        <h2 className="section-title">Pending Approvals</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="approval-list">
                                {maintenanceRequests.slice(0, 6).map(request => (
                                    <div key={request.id} className="approval-item">
                                        <div className="approval-header">
                                            <span className="request-id">REQ-{String(request.id).padStart(4, '0')}</span>
                                            <span className="request-date">{request.scheduled_date}</span>
                                        </div>
                                        <div className="request-description">{request.issue_description}</div>
                                        <div className="approval-footer">
                                            <span className="technician">👤 {request.technician}</span>
                                            <div className="approval-actions">
                                                <button className="approve-btn" onClick={() => handleApprove(request.id)}>✓ Approve</button>
                                                <button className="reject-btn" onClick={() => handleReject(request.id)}>✗ Reject</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Budget Overview */}
                    <section className="content-card full-width">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="section-title">Budget Overview</h2>
                        </div>
                        <div className="budget-summary">
                            <div className="budget-item">
                                <div className="budget-label">Total Allocation</div>
                                <div className="budget-value">${(analytics.repair_status?.total_allocation || 0).toLocaleString()}</div>
                            </div>
                            <div className="budget-item">
                                <div className="budget-label">Total Spent</div>
                                <div className="budget-value spent">${(analytics.repair_status?.spent_so_far || 0).toLocaleString()}</div>
                            </div>
                            <div className="budget-item">
                                <div className="budget-label">Remaining</div>
                                <div className="budget-value remaining">
                                    ${(analytics.repair_status?.remaining_budget || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="budget-item">
                                <div className="budget-label">Repair Count</div>
                                <div className="budget-value">{(analytics.repair_status?.completed_repairs || 0)} updates</div>
                            </div>
                        </div>
                        <div className="budget-progress">
                            <div
                                className="budget-progress-fill"
                                style={{
                                    width: `${Math.min(100, ((analytics.repair_status?.spent_so_far || 0) / (analytics.repair_status?.total_allocation || 1)) * 100)}%`,
                                    background: ((analytics.repair_status?.spent_so_far || 0) / (analytics.repair_status?.total_allocation || 1)) > 0.9 ? '#EF4444' : '#10B981'
                                }}
                            ></div>
                        </div>
                    </section>
                </div>

                {/* Budget Update Modal */}
                {showBudgetModal && (
                    <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Update Department Budget</h3>
                            <input
                                type="number"
                                className="budget-input"
                                placeholder="Enter new budget amount"
                                value={newBudget}
                                onChange={(e) => setNewBudget(e.target.value)}
                            />
                            <div className="modal-actions">
                                <button className="approve-btn" onClick={handleBudgetUpdate}>Update</button>
                                <button className="reject-btn" onClick={() => setShowBudgetModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default DepartmentHeadDashboard;
