import React from 'react';
import './AssetDetailsModal.css';

function AssetDetailsModal({ asset, onClose, maintenanceHistory = [] }) {
    if (!asset) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Asset Details</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="asset-info-section">
                        <h3 className="section-title">Basic Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Equipment ID:</span>
                                <span className="info-value">EQ-{String(asset.id).padStart(4, '0')}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Name:</span>
                                <span className="info-value">{asset.asset_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Category:</span>
                                <span className="info-value">{asset.category}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Department:</span>
                                <span className="info-value">{asset.department}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Status:</span>
                                <span className={`status-badge ${asset.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {asset.status}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Purchase Date:</span>
                                <span className="info-value">{asset.purchase_date || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Last Maintenance:</span>
                                <span className="info-value">{asset.last_maintenance_date || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {maintenanceHistory.length > 0 && (
                        <div className="maintenance-history-section">
                            <h3 className="section-title">Maintenance History</h3>
                            <div className="history-list">
                                {maintenanceHistory.map((record) => (
                                    <div key={record.id} className="history-item">
                                        <div className="history-header">
                                            <span className="history-date">📅 {record.scheduled_date}</span>
                                            <span className={`history-status ${record.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                        <p className="history-description">{record.issue_description}</p>
                                        <div className="history-footer">
                                            <span className="history-technician">👤 {record.technician}</span>
                                            {record.completed_date && (
                                                <span className="history-completed">✅ Completed: {record.completed_date}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default AssetDetailsModal;
