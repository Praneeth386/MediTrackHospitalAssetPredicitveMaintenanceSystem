import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Maintenance({ admin, onLogout }) {
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        asset_id: '',
        issue_description: '',
        technician: '',
        status: 'Pending',
        scheduled_date: '',
        completed_date: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [maintenanceRes, assetsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/maintenance'),
                axios.get('http://localhost:5000/api/assets')
            ]);
            setMaintenanceRecords(maintenanceRes.data);
            setAssets(assetsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Failed to fetch data' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                await axios.put(`http://localhost:5000/api/maintenance/${editingRecord.id}`, formData);
                setMessage({ type: 'success', text: 'Maintenance record updated successfully!' });
            } else {
                await axios.post('http://localhost:5000/api/maintenance', formData);
                setMessage({ type: 'success', text: 'Maintenance record created successfully!' });
            }
            fetchData();
            closeModal();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Operation failed' });
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            asset_id: record.asset_id,
            issue_description: record.issue_description,
            technician: record.technician || '',
            status: record.status,
            scheduled_date: record.scheduled_date || '',
            completed_date: record.completed_date || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this maintenance record?')) {
            try {
                await axios.delete(`http://localhost:5000/api/maintenance/${id}`);
                setMessage({ type: 'success', text: 'Maintenance record deleted successfully!' });
                fetchData();
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to delete record' });
            }
        }
    };

    const openAddModal = () => {
        setEditingRecord(null);
        setFormData({
            asset_id: '',
            issue_description: '',
            technician: '',
            status: 'Pending',
            scheduled_date: '',
            completed_date: ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRecord(null);
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Pending': 'badge-warning',
            'In Progress': 'badge-info',
            'Completed': 'badge-success',
            'Cancelled': 'badge-danger'
        };
        return badges[status] || 'badge-secondary';
    };

    return (
        <div className="page-wrapper">
            <div className="header">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1>🏥 Medi Care Hospital - Maintenance Portal</h1>
                </Link>
                <div className="header-right">
                    <div className="user-info">
                        <span>👤 {admin?.username}</span>
                    </div>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </div>

            <nav className="nav-menu">
                <Link to="/dashboard" className="nav-btn">Dashboard</Link>
                <Link to="/assets" className="nav-btn">Assets</Link>
                <Link to="/maintenance" className="nav-btn active">Maintenance</Link>
                <Link to="/warnings" className="nav-btn">Warnings</Link>
                <Link to="/reports" className="nav-btn">Reports</Link>
                <Link to="/settings" className="nav-btn">Settings</Link>
            </nav>

            <div className="container">
                <div className="content-wrapper">
                    <div className="card-header">
                        <h2 className="card-title">Maintenance Records</h2>
                        <button onClick={openAddModal} className="btn btn-primary">
                            + Add Maintenance Record
                        </button>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Asset Name</th>
                                        <th>Category</th>
                                        <th>Issue Description</th>
                                        <th>Technician</th>
                                        <th>Status</th>
                                        <th>Scheduled Date</th>
                                        <th>Completed Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {maintenanceRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                                No maintenance records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        maintenanceRecords.map(record => (
                                            <tr key={record.id}>
                                                <td><strong>{record.asset_name}</strong></td>
                                                <td>{record.category || 'N/A'}</td>
                                                <td>{record.issue_description}</td>
                                                <td>{record.technician || 'Not Assigned'}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(record.status)}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td>{record.scheduled_date || 'N/A'}</td>
                                                <td>{record.completed_date || 'N/A'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleEdit(record)}
                                                        className="btn btn-secondary"
                                                        style={{ marginRight: '8px', padding: '6px 12px' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(record.id)}
                                                        className="btn btn-danger"
                                                        style={{ padding: '6px 12px' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
                            </h3>
                            <button onClick={closeModal} className="close-btn">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="asset_id">Asset *</label>
                                <select
                                    id="asset_id"
                                    name="asset_id"
                                    className="form-control"
                                    value={formData.asset_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Asset</option>
                                    {assets.map(asset => (
                                        <option key={asset.id} value={asset.id}>
                                            {asset.asset_name} ({asset.category}) - {asset.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="issue_description">Issue Description *</label>
                                <textarea
                                    id="issue_description"
                                    name="issue_description"
                                    className="form-control"
                                    value={formData.issue_description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="technician">Technician</label>
                                <input
                                    type="text"
                                    id="technician"
                                    name="technician"
                                    className="form-control"
                                    value={formData.technician}
                                    onChange={handleInputChange}
                                    placeholder="Assign technician"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status *</label>
                                <select
                                    id="status"
                                    name="status"
                                    className="form-control"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Needs Calibration">Needs Calibration</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="scheduled_date">Scheduled Date</label>
                                <input
                                    type="date"
                                    id="scheduled_date"
                                    name="scheduled_date"
                                    className="form-control"
                                    value={formData.scheduled_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="completed_date">Completed Date</label>
                                <input
                                    type="date"
                                    id="completed_date"
                                    name="completed_date"
                                    className="form-control"
                                    value={formData.completed_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary">
                                    {editingRecord ? 'Update Record' : 'Create Record'}
                                </button>
                                <button type="button" onClick={closeModal} className="btn btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Maintenance;
