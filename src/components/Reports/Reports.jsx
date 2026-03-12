import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Sidebar from '../Sidebar/Sidebar';
import './Reports.css';

function Reports({ admin, onLogout }) {
    const [assets, setAssets] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [generatingReport, setGeneratingReport] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assetsRes, maintenanceRes] = await Promise.all([
                axios.get('http://localhost:5000/api/assets'),
                axios.get('http://localhost:5000/api/maintenance')
            ]);
            setAssets(assetsRes.data);
            setMaintenance(maintenanceRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate monthly maintenance trends
    const getMaintenanceTrends = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const last6Months = [];

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            last6Months.push({
                month: months[monthIndex],
                Pending: Math.floor(Math.random() * 5) + 2,
                'In Progress': Math.floor(Math.random() * 4) + 1,
                Completed: Math.floor(Math.random() * 8) + 3
            });
        }

        return last6Months;
    };

    // Get equipment category distribution
    const getCategoryDistribution = () => {
        const categories = {};
        assets.forEach(asset => {
            categories[asset.category] = (categories[asset.category] || 0) + 1;
        });

        return Object.entries(categories).map(([category, count]) => ({
            category,
            count
        })).sort((a, b) => b.count - a.count);
    };

    // Get analytics data (cost and utilization)
    const getAnalyticsData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map((month, index) => ({
            month,
            cost: 15000 + Math.floor(Math.random() * 10000),
            utilization: 65 + Math.floor(Math.random() * 25)
        }));
    };

    // Export to CSV function
    const exportToCSV = () => {
        setGeneratingReport(true);
        try {
            const csvData = [];
            csvData.push(['Equipment Status Report']);
            csvData.push(['Generated on:', new Date().toLocaleString()]);
            csvData.push(['Date Range:', `${dateRange.startDate} to ${dateRange.endDate}`]);
            csvData.push([]);
            csvData.push(['Asset ID', 'Asset Name', 'Category', 'Department', 'Status', 'Last Maintenance']);

            assets.forEach(asset => {
                csvData.push([
                    `EQ-${String(asset.id).padStart(4, '0')}`,
                    asset.asset_name,
                    asset.category,
                    asset.department,
                    asset.status,
                    asset.last_maintenance_date || 'N/A'
                ]);
            });

            csvData.push([]);
            csvData.push(['Maintenance Records']);
            csvData.push(['ID', 'Asset', 'Issue', 'Technician', 'Status', 'Scheduled Date', 'Completed Date']);

            maintenance.forEach(m => {
                csvData.push([
                    `WO-${String(m.id).padStart(4, '0')}`,
                    m.asset_name,
                    m.issue_description,
                    m.technician || 'Unassigned',
                    m.status,
                    m.scheduled_date || 'N/A',
                    m.completed_date || 'N/A'
                ]);
            });

            const csvContent = csvData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `MediTrack_Report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            alert('✓ CSV report generated successfully!');
        } catch (error) {
            console.error('Error generating CSV:', error);
            alert('Failed to generate CSV report');
        } finally {
            setGeneratingReport(false);
        }
    };

    // Export to PDF function
    const exportToPDF = () => {
        setGeneratingReport(true);
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>MediTrack Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #3B82F6; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
                        h2 { color: #374151; margin-top: 30px; }
                        .header { margin-bottom: 20px; }
                        .info { color: #6B7280; margin: 5px 0; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th { background: #3B82F6; color: white; padding: 12px; text-align: left; }
                        td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
                        tr:hover { background: #F9FAFB; }
                        .status { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                        .functional { background: #D1FAE5; color: #065F46; }
                        .needs-maintenance { background: #FEF3C7; color: #92400E; }
                        .under-maintenance { background: #FEE2E2; color: #991B1B; }
                        .needs-calibration { background: #EDE9FE; color: #5B21B6; }
                        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
                        .stat-card { border: 1px solid #E5E7EB; padding: 15px; border-radius: 8px; }
                        .stat-value { font-size: 32px; font-weight: bold; color: #3B82F6; }
                        .stat-label { color: #6B7280; margin-top: 5px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🏥 MediTrack - Equipment & Maintenance Report</h1>
                        <p class="info"><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p class="info"><strong>Date Range:</strong> ${dateRange.startDate} to ${dateRange.endDate}</p>
                        <p class="info"><strong>Generated by:</strong> ${admin?.username || 'Admin'}</p>
                    </div>
                    
                    <div class="stats">
                        <div class="stat-card">
                            <div class="stat-value">${assets.length}</div>
                            <div class="stat-label">Total Assets</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${maintenance.filter(m => m.status === 'Completed').length}</div>
                            <div class="stat-label">Completed Tasks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${maintenance.filter(m => m.status === 'Pending').length}</div>
                            <div class="stat-label">Pending Tasks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${assets.filter(a => a.status === 'Needs Calibration').length}</div>
                            <div class="stat-label">Needs Calibration</div>
                        </div>
                    </div>
                    
                    <h2>📦 Equipment Inventory</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Asset Name</th>
                                <th>Category</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Last Maintenance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${assets.map(asset => `
                                <tr>
                                    <td>EQ-${String(asset.id).padStart(4, '0')}</td>
                                    <td>${asset.asset_name}</td>
                                    <td>${asset.category}</td>
                                    <td>${asset.department}</td>
                                    <td><span class="status ${asset.status.toLowerCase().replace(/ /g, '-')}">${asset.status}</span></td>
                                    <td>${asset.last_maintenance_date || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <h2>🔧 Maintenance Records</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Work Order</th>
                                <th>Asset</th>
                                <th>Issue</th>
                                <th>Technician</th>
                                <th>Status</th>
                                <th>Scheduled</th>
                                <th>Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${maintenance.map(m => `
                                <tr>
                                    <td>WO-${String(m.id).padStart(4, '0')}</td>
                                    <td>${m.asset_name}</td>
                                    <td>${m.issue_description}</td>
                                    <td>${m.technician || 'Unassigned'}</td>
                                    <td><span class="status">${m.status}</span></td>
                                    <td>${m.scheduled_date || 'N/A'}</td>
                                    <td>${m.completed_date || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            alert('✓ PDF report window opened. Use Print to save as PDF.');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report');
        } finally {
            setGeneratingReport(false);
        }
    };

    const stats = {
        totalReports: maintenance.length,
        completedTasks: maintenance.filter(m => m.status === 'Completed').length,
        pendingTasks: maintenance.filter(m => m.status === 'Pending').length,
        totalAssets: assets.length
    };

    return (
        <>
            <Sidebar admin={admin} onLogout={onLogout} />
            <div className="reports-dashboard with-sidebar">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <Link to="/" className="logo">
                            <span className="logo-icon">+</span>
                            <span className="logo-text">MediCare</span>
                        </Link>
                        <h1 className="page-title">Reports & Analytics Dashboard</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-role">📊 Analytics</span>
                            <span className="user-name">{admin?.username}</span>
                        </div>
                        <button className="logout-btn" onClick={onLogout}>
                            Logout <span className="arrow">→</span>
                        </button>
                    </div>
                </header>

                {/* Report Generation Controls */}
                <section className="report-controls" style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            📅 Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            📅 End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <button
                            onClick={exportToCSV}
                            disabled={generatingReport}
                            style={{
                                background: '#10B981',
                                color: 'white',
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: generatingReport ? 'not-allowed' : 'pointer',
                                opacity: generatingReport ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => !generatingReport && (e.target.style.background = '#059669')}
                            onMouseOut={(e) => !generatingReport && (e.target.style.background = '#10B981')}
                        >
                            📊 Export CSV
                        </button>
                        <button
                            onClick={exportToPDF}
                            disabled={generatingReport}
                            style={{
                                background: '#EF4444',
                                color: 'white',
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: generatingReport ? 'not-allowed' : 'pointer',
                                opacity: generatingReport ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => !generatingReport && (e.target.style.background = '#DC2626')}
                            onMouseOut={(e) => !generatingReport && (e.target.style.background = '#EF4444')}
                        >
                            📄 Export PDF
                        </button>
                    </div>
                </section>

                {/* Stats Cards */}
                <section className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#3B82F6' }}>📄</div>
                        <div className="stat-content">
                            <div className="stat-label">Total Reports</div>
                            <div className="stat-value">{stats.totalReports}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#10B981' }}>✓</div>
                        <div className="stat-content">
                            <div className="stat-label">Completed Tasks</div>
                            <div className="stat-value">{stats.completedTasks}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#F59E0B' }}>⏳</div>
                        <div className="stat-content">
                            <div className="stat-label">Pending Tasks</div>
                            <div className="stat-value">{stats.pendingTasks}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#8B5CF6' }}>📦</div>
                        <div className="stat-content">
                            <div className="stat-label">Total Assets</div>
                            <div className="stat-value">{stats.totalAssets}</div>
                        </div>
                    </div>
                </section>

                {/* Charts Section */}
                <div className="dashboard-content">
                    {/* Maintenance Trends Bar Graph */}
                    <section className="content-card full-width">
                        <h2 className="section-title">📊 Maintenance Trends - Last 6 Months</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={getMaintenanceTrends()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Pending" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="In Progress" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="Completed" fill="#10B981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </section>

                    {/* Equipment Category Distribution Bar Chart */}
                    <section className="content-card full-width">
                        <h2 className="section-title">🏥 Equipment Category Distribution</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart
                                    data={getCategoryDistribution()}
                                    layout="vertical"
                                    margin={{ left: 100 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis type="number" stroke="#6B7280" />
                                    <YAxis dataKey="category" type="category" stroke="#6B7280" />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 8, 8, 0]}>
                                        {getCategoryDistribution().map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </section>

                    {/* Analytics - Cost & Utilization */}
                    <section className="content-card full-width">
                        <h2 className="section-title">💰 Cost & Utilization Analytics</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={getAnalyticsData()}>
                                    <defs>
                                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorUtilization" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" />
                                    <YAxis yAxisId="left" stroke="#6B7280" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="cost"
                                        stroke="#3B82F6"
                                        fillOpacity={1}
                                        fill="url(#colorCost)"
                                        name="Maintenance Cost ($)"
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="utilization"
                                        stroke="#10B981"
                                        fillOpacity={1}
                                        fill="url(#colorUtilization)"
                                        name="Utilization Rate (%)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </section>

                    {/* Summary Statistics */}
                    <section className="content-card full-width">
                        <h2 className="section-title">📈 Summary Statistics</h2>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <div className="summary-label">Average Completion Time</div>
                                <div className="summary-value">4.2 days</div>
                                <div className="summary-trend positive">↑ 12% from last month</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Equipment Uptime</div>
                                <div className="summary-value">94.5%</div>
                                <div className="summary-trend positive">↑ 2.3% from last month</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Maintenance Efficiency</div>
                                <div className="summary-value">87%</div>
                                <div className="summary-trend negative">↓ 3% from last month</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Cost per Asset</div>
                                <div className="summary-value">$1,245</div>
                                <div className="summary-trend positive">↓ 8% from last month</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

export default Reports;
