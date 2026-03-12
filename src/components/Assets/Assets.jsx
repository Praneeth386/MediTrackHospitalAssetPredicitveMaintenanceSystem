import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Assets({ admin, onLogout }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [formData, setFormData] = useState({
        asset_name: '',
        category: '',
        department: '',
        status: 'Active',
        purchase_date: '',
        last_maintenance_date: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/assets');
            setAssets(response.data);
        } catch (error) {
            console.error('Error fetching assets:', error);
            setMessage({ type: 'error', text: 'Failed to fetch assets' });
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
            if (editingAsset) {
                await axios.put(`http://localhost:5000/api/assets/${editingAsset.id}`, formData);
                setMessage({ type: 'success', text: 'Asset updated successfully!' });
            } else {
                await axios.post('http://localhost:5000/api/assets', formData);
                setMessage({ type: 'success', text: 'Asset created successfully!' });
            }
            fetchAssets();
            closeModal();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Operation failed' });
        }
    };

    const handleEdit = (asset) => {
        setEditingAsset(asset);
        setFormData({
            asset_name: asset.asset_name,
            category: asset.category,
            department: asset.department,
            status: asset.status,
            purchase_date: asset.purchase_date || '',
            last_maintenance_date: asset.last_maintenance_date || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await axios.delete(`http://localhost:5000/api/assets/${id}`);
                setMessage({ type: 'success', text: 'Asset deleted successfully!' });
                fetchAssets();
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to delete asset' });
            }
        }
    };

    const openAddModal = () => {
        setEditingAsset(null);
        setFormData({
            asset_name: '',
            category: '',
            department: '',
            status: 'Active',
            purchase_date: '',
            last_maintenance_date: ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAsset(null);
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Active': 'badge-success',
            'Under Maintenance': 'badge-warning',
            'Inactive': 'badge-secondary',
            'Decommissioned': 'badge-danger'
        };
        return badges[status] || 'badge-secondary';
    };

    return (
        <div className="page-wrapper">
            <div className="header">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1>🏥 Medi Care Hospital - Assets Portal</h1>
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
                <Link to="/assets" className="nav-btn active">Assets</Link>
                <Link to="/maintenance" className="nav-btn">Maintenance</Link>
                <Link to="/warnings" className="nav-btn">Warnings</Link>
                <Link to="/reports" className="nav-btn">Reports</Link>
                <Link to="/settings" className="nav-btn">Settings</Link>
            </nav>

            <div className="container">
                <div className="content-wrapper">
                    <div className="card-header">
                        <h2 className="card-title">Asset Management</h2>
                        <button onClick={openAddModal} className="btn btn-primary">
                            + Add New Asset
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
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Purchase Date</th>
                                        <th>Last Maintenance</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                                No assets found. Click "Add New Asset" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        assets.map(asset => (
                                            <tr key={asset.id}>
                                                <td><strong>{asset.asset_name}</strong></td>
                                                <td>{asset.category}</td>
                                                <td>{asset.department}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(asset.status)}`}>
                                                        {asset.status}
                                                    </span>
                                                </td>
                                                <td>{asset.purchase_date || 'N/A'}</td>
                                                <td>{asset.last_maintenance_date || 'Never'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleEdit(asset)}
                                                        className="btn btn-secondary"
                                                        style={{ marginRight: '8px', padding: '6px 12px' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(asset.id)}
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
                                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                            </h3>
                            <button onClick={closeModal} className="close-btn">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="asset_name">Asset Name *</label>
                                <input
                                    type="text"
                                    id="asset_name"
                                    name="asset_name"
                                    className="form-control"
                                    value={formData.asset_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    className="form-control"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Imaging">Imaging</option>
                                    <option value="Life Support">Life Support</option>
                                    <option value="Monitoring">Monitoring</option>
                                    <option value="Pumps">Pumps</option>
                                    <option value="Surgical">Surgical</option>
                                    <option value="Lab Equipment">Lab Equipment</option>
                                    <option value="Diagnostic">Diagnostic</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="department">Department *</label>
                                <select
                                    id="department"
                                    name="department"
                                    className="form-control"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="Radiology">Radiology</option>
                                    <option value="ICU">ICU</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                </select>
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
                                    <option value="Active">Active</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Decommissioned">Decommissioned</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="purchase_date">Purchase Date</label>
                                <input
                                    type="date"
                                    id="purchase_date"
                                    name="purchase_date"
                                    className="form-control"
                                    value={formData.purchase_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_maintenance_date">Last Maintenance Date</label>
                                <input
                                    type="date"
                                    id="last_maintenance_date"
                                    name="last_maintenance_date"
                                    className="form-control"
                                    value={formData.last_maintenance_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary">
                                    {editingAsset ? 'Update Asset' : 'Create Asset'}
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

export default Assets;
