'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faTriangleExclamation,
  faTruckFast,
  faShieldHalved,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';
import { Drawer, Button, SegmentedControl, EmptyState } from './ui';

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

  const filterOptions = (['all', 'critical', 'transfers', 'safety'] as const).map(
    (tab) => ({
      value: tab,
      label: `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${
        tab === 'all'
          ? notifications.length
          : notifications.filter((n) => n.category === tab).length
      })`,
    }),
  );

  return (
    <Drawer
      onClose={onClose}
      ariaLabel="Notification Center"
      title="LGA Alert Center"
      subtitle={
        unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts caught up'
      }
      icon={faBell}
      className="notification-drawer"
      headerActions={
        unreadCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            icon={faCheckDouble}
            onClick={markAllAsRead}
          >
            Read all
          </Button>
        ) : undefined
      }
    >

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
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              void handleRequestPush();
            }}
          >
            Enable
          </Button>
        </div>
      )}

      <SegmentedControl
        options={filterOptions}
        value={activeFilter}
        onChange={(value) =>
          setActiveFilter(value as 'all' | 'critical' | 'transfers' | 'safety')
        }
        ariaLabel="Filter notifications"
        className="drawer-tabs"
      />

        {/* Notification list */}
        <div className="notification-list">
          {filtered.length === 0 ? (
          <EmptyState
            icon={faCheckDouble}
            title="No notifications in this category"
            text="Everything is operating normally."
          />
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
    </Drawer>
  );
}
