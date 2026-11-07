'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faTriangleExclamation,
  faTruckFast,
  faShieldHalved,
  faXmark,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';

export interface WebNotification {
  id: string;
  category: 'critical' | 'transfers' | 'safety';
  title: string;
  detail: string;
  timestamp: string;
  read: boolean;
  orderRef?: string;
}

const INITIAL_NOTIFICATIONS: WebNotification[] = [
  {
    id: 'notif-1',
    category: 'critical',
    title: 'Severe stockout: Aiyetoro Central PHC',
    detail: 'Oral Rehydration Salts (ORS) at 0 on hand. Emergency threshold is 20 sachets.',
    timestamp: '2 min ago',
    read: false,
    orderRef: 'REQ-0001',
  },
  {
    id: 'notif-2',
    category: 'transfers',
    title: 'Courier en route: TRF-0042',
    detail: 'Ade Okafor carrying 20 ORS sachets from Idera PHC. ETA: 4 minutes.',
    timestamp: '6 min ago',
    read: false,
    orderRef: 'TRF-0042',
  },
  {
    id: 'notif-3',
    category: 'safety',
    title: 'Tamper seal #7842 verified',
    detail: 'Crate sealed and confirmed at source gate before rider pickup.',
    timestamp: '14 min ago',
    read: false,
    orderRef: 'TRF-0042',
  },
  {
    id: 'notif-4',
    category: 'critical',
    title: 'Safety floor protection active',
    detail: 'Demo PHC B surplus capped at 60 sachets. 20 minimum stock reserved for local patients.',
    timestamp: '22 min ago',
    read: true,
  },
  {
    id: 'notif-5',
    category: 'transfers',
    title: 'Custody transfer completed',
    detail: 'Ajegunle PHC confirmed receipt of 12 Zinc tablets. Movement #MOV-891 signed.',
    timestamp: '1 hr ago',
    read: true,
    orderRef: 'TRF-0039',
  },
];

export function NotificationDrawer({
  isOpen,
  onClose,
  onSelectOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (orderRef: string) => void;
}) {
  const [notifications, setNotifications] = useState<WebNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'transfers' | 'safety'>('all');
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleRequestPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushStatus(perm);
      } catch {
        setPushStatus('granted');
      }
    } else {
      setPushStatus('granted');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer-panel notification-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Notification Center"
      >
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-icon">
              <FontAwesomeIcon icon={faBell} />
            </span>
            <div>
              <h3>LGA Alert Center</h3>
              <p className="drawer-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts caught up'}
              </p>
            </div>
          </div>
          <div className="drawer-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="drawer-action-btn"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <FontAwesomeIcon icon={faCheckDouble} /> Read all
              </button>
            )}
            <button
              type="button"
              className="drawer-close-btn"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Browser Push Permission Banner */}
        {pushStatus === 'default' && (
          <div className="push-permission-card">
            <div className="push-permission-info">
              <strong>Enable Browser Push Alerts</strong>
              <p>
                Receive instant desktop alerts when a clinic hits a stockout or a
                transfer requires supervisor attention.
              </p>
            </div>
            <button
              type="button"
              className="push-enable-btn"
              onClick={() => {
                void handleRequestPush();
              }}
            >
              Enable
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="drawer-tabs">
          {(['all', 'critical', 'transfers', 'safety'] as const).map((tab) => {
            const count =
              tab === 'all'
                ? notifications.length
                : notifications.filter((n) => n.category === tab).length;
            return (
              <button
                key={tab}
                type="button"
                className={`drawer-tab-btn ${activeFilter === tab ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        <div className="notification-list">
          {filtered.length === 0 ? (
            <div className="drawer-empty-state">
              <span>✓</span>
              <strong>No notifications in this category</strong>
              <p>Everything is operating normally.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id}
                className={`notif-card notif-category-${item.category} ${item.read ? 'is-read' : 'is-unread'}`}
                onClick={() => {
                  markAsRead(item.id);
                  if (item.orderRef && onSelectOrder) {
                    onSelectOrder(item.orderRef);
                  }
                }}
              >
                <div className="notif-card-icon">
                  {item.category === 'critical' ? (
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                  ) : item.category === 'transfers' ? (
                    <FontAwesomeIcon icon={faTruckFast} />
                  ) : (
                    <FontAwesomeIcon icon={faShieldHalved} />
                  )}
                </div>
                <div className="notif-card-body">
                  <div className="notif-card-top">
                    <strong className="notif-title">{item.title}</strong>
                    <time className="notif-time">{item.timestamp}</time>
                  </div>
                  <p className="notif-detail">{item.detail}</p>
                  {item.orderRef && (
                    <div className="notif-footer">
                      <span className="notif-ref-tag">Order: {item.orderRef}</span>
                      <span className="notif-action-hint">View details →</span>
                    </div>
                  )}
                </div>
                {!item.read && <span className="notif-unread-dot" />}
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
