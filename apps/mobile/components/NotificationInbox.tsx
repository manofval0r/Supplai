import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { API_BASE, type NotificationEvent } from '../lib/api';

export interface NotificationInboxProps {
  role: 'facility' | 'rider' | 'lga';
  facilityId?: string;
  riderName?: string;
  onSelectOrder?: (reference: string) => void;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#ffffff' },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 15 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  cardUnread: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardBody: { fontSize: 13, color: '#374151', marginTop: 4 },
  cardMeta: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  severityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  severityCritical: { backgroundColor: '#dc2626' },
  severityAction: { backgroundColor: '#2563eb' },
  severityInfo: { backgroundColor: '#6b7280' },
});

const severityColor = (severity: NotificationEvent['severity']) => {
  switch (severity) {
    case 'critical':
      return '#dc2626';
    case 'action':
      return '#2563eb';
    default:
      return '#6b7280';
  }
};

export function NotificationInbox({
  role,
  facilityId,
  riderName,
  onSelectOrder,
}: NotificationInboxProps) {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [read, setRead] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams({ role });
      if (facilityId) params.set('facilityId', facilityId);
      if (riderName) params.set('riderName', riderName);
      const response = await fetch(`${API_BASE}/api/notifications?${params}`);
      const feed = (await response.json()) as { events: NotificationEvent[] };
      setEvents(feed.events ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [role, facilityId, riderName]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = events.filter((e) => !read.has(e.id)).length;

  const markRead = (id: string) => {
    setRead((prev) => new Set([...prev, id]));
  };

  const pressEvent = (event: NotificationEvent) => {
    markRead(event.id);
    if (event.orderReference && onSelectOrder) {
      onSelectOrder(event.orderReference);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View
            style={[
              styles.badge,
              { backgroundColor: severityColor(events[0].severity) },
            ]}
          >
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>
        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
      </Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !read.has(item.id) && styles.cardUnread]}
            onPress={() => pressEvent(item)}
            activeOpacity={0.9}
          >
            <View style={styles.cardRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.severityDot,
                    { backgroundColor: severityColor(item.severity) },
                  ]}
                />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            </View>
            <Text style={styles.cardBody}>{item.body}</Text>
            <Text style={styles.cardMeta}>
              {new Date(item.occurredAt).toLocaleString()} · {item.kind}
              {item.orderReference ? ` · ${item.orderReference}` : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export function NotificationBanner({
  role,
  facilityId,
  riderName,
}: {
  role: 'facility' | 'rider' | 'lga';
  facilityId?: string;
  riderName?: string;
}) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ role });
    if (facilityId) params.set('facilityId', facilityId);
    if (riderName) params.set('riderName', riderName);
    fetch(`${API_BASE}/api/notifications?${params}`)
      .then((response) => response.json())
      .then((feed: { events: NotificationEvent[] }) => {
        setUnread(feed.events?.length ?? 0);
      })
      .catch(() => setUnread(0));
  }, [role, facilityId, riderName]);

  if (unread === 0) return null;

  return (
    <View
      style={{
        backgroundColor: '#fef3c7',
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f59e0b',
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#d97706',
          marginRight: 8,
        }}
      />
      <Text
        style={{ fontSize: 13, fontWeight: '600', color: '#92400e', flex: 1 }}
      >
        {unread} new alert{unread === 1 ? '' : 's'} — tap to open inbox
      </Text>
    </View>
  );
}
