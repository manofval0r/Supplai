import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { API_BASE, type NotificationEvent } from '../lib/api';
import { theme } from '../lib/theme';

export interface NotificationInboxProps {
  role: 'facility' | 'rider' | 'lga';
  facilityId?: string;
  riderName?: string;
  onSelectOrder?: (reference: string) => void;
}

export function NotificationInbox({
  role,
  facilityId,
  riderName,
  onSelectOrder,
}: NotificationInboxProps) {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role });
      if (role === 'facility' && facilityId)
        params.append('facilityId', facilityId);
      if (role === 'rider' && riderName) params.append('riderName', riderName);
      const res = await fetch(
        `${API_BASE}/api/notifications?${params.toString()}`,
      );
      if (res.ok) {
        const data = (await res.json()) as { events: NotificationEvent[] };
        setEvents(data.events);
      }
    } catch {
      // Ignore network errors in polling
    } finally {
      setLoading(false);
    }
  }, [role, facilityId, riderName]);

  useEffect(() => {
    void fetchNotifications();
    const timer = setInterval(() => {
      void fetchNotifications();
    }, 4000);
    return () => clearInterval(timer);
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

  if (loading && events.length === 0) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LIVE NOTIFICATION STREAM</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount} NEW</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>
        {unreadCount > 0
          ? `${unreadCount} unread alert(s)`
          : 'Network event stream synchronized'}
      </Text>

      {events.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notifications recorded yet</Text>
        </View>
      ) : (
        events.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, !read.has(item.id) && styles.cardUnread]}
            onPress={() => pressEvent(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <View style={[styles.severityPill, severityStyle(item.severity)]}>
                <Text style={styles.severityPillText}>
                  {item.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.cardTime}>
                {new Date(item.occurredAt).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>{item.body}</Text>
            <Text style={styles.cardMeta}>
              Kind: {item.kind}{' '}
              {item.orderReference ? `· Ref: ${item.orderReference}` : ''}
            </Text>
          </TouchableOpacity>
        ))
      )}
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
    if (role === 'facility' && facilityId)
      params.append('facilityId', facilityId);
    if (role === 'rider' && riderName) params.append('riderName', riderName);
    const check = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/notifications?${params.toString()}`,
        );
        if (res.ok) {
          const data = (await res.json()) as { events: NotificationEvent[] };
          setUnread(data.events.length);
        }
      } catch {
        // Ignore
      }
    };
    void check();
    const timer = setInterval(() => {
      void check();
    }, 4000);
    return () => clearInterval(timer);
  }, [role, facilityId, riderName]);

  if (unread === 0) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>● Live Network Activity Feed</Text>
      <View style={styles.bannerCount}>
        <Text style={styles.bannerCountText}>{unread} events</Text>
      </View>
    </View>
  );
}

const severityStyle = (severity: NotificationEvent['severity']) => {
  switch (severity) {
    case 'critical':
      return {
        backgroundColor: theme.colors.redSoft,
        borderColor: theme.borders.color,
      };
    case 'action':
      return {
        backgroundColor: theme.colors.amberSoft,
        borderColor: theme.borders.color,
      };
    case 'info':
    default:
      return {
        backgroundColor: theme.colors.primarySoft,
        borderColor: theme.borders.color,
      };
  }
};

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.muted,
    letterSpacing: 1.1,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: theme.borders.color,
    borderRadius: theme.radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    ...theme.shadows.xs,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#ffffff' },
  empty: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: theme.borders.normal,
    borderColor: theme.borders.color,
    marginBottom: 10,
  },
  emptyText: { color: theme.colors.muted, fontSize: 13, fontStyle: 'italic' },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: theme.borders.normal,
    borderColor: theme.borders.color,
    ...theme.shadows.xs,
  },
  cardUnread: {
    backgroundColor: theme.colors.primarySoft,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  severityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  severityPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  cardTime: {
    fontSize: 10,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.ink,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 12,
    color: theme.colors.ink,
    lineHeight: 16,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 10,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1.5,
    borderColor: theme.borders.color,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.xs,
  },
  bannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  bannerCount: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.borders.color,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bannerCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
});
