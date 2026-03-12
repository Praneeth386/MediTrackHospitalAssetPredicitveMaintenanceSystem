import React, { useEffect } from 'react';
import './NotificationPopup.css';

function NotificationPopup({ notifications, onClose }) {
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                onClose(notifications[0].id);
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [notifications, onClose]);

    if (notifications.length === 0) return null;

    return (
        <div className="notification-container">
            {notifications.map((notification) => (
                <div key={notification.id} className="notification-popup">
                    <div className="notification-header">
                        <span className="notification-icon">✅</span>
                        <span className="notification-title">Task Completed</span>
                        <button
                            className="notification-close"
                            onClick={() => onClose(notification.id)}
                        >
                            ×
                        </button>
                    </div>
                    <div className="notification-body">
                        <p className="notification-message">{notification.message}</p>
                        <div className="notification-details">
                            <div className="detail-item">
                                <span className="detail-icon">👤</span>
                                <span className="detail-text">{notification.technician_name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">🔧</span>
                                <span className="detail-text">{notification.asset_name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">📅</span>
                                <span className="detail-text">{notification.completion_date}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default NotificationPopup;
