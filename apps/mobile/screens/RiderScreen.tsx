import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';

import { supplaiApi, type OrderDetail } from '../lib/api';
import {
  NotificationInbox,
  NotificationBanner,
} from '../components/NotificationInbox';
import {
  registerForRemoteNotificationsAsync,
  scheduleCriticalAlert,
} from '../lib/notifications';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  content: { padding: 12 },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#ffffff',
  },
  buttonOutlineText: { color: '#2563eb', fontWeight: '700', fontSize: 14 },
  buttonSuccess: { backgroundColor: '#16a34a' },
  codeBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e40af',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timeline: { marginTop: 8 },
  eventRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
    paddingLeft: 10,
  },
  eventRowActive: { borderLeftColor: '#2563eb' },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9ca3af',
    marginTop: 2,
    marginRight: 8,
  },
  eventDotActive: { backgroundColor: '#2563eb' },
  eventText: { fontSize: 13, color: '#374151', flex: 1 },
  eventMeta: { fontSize: 11, color: '#6b7280' },
  owner: { fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 4 },
  error: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  success: {
    color: '#16a34a',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 15 },
});

export function RiderScreen({ riderName }: { riderName: string }) {
  const [reference, setReference] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    void registerForRemoteNotificationsAsync();
  }, []);

  const fetchOrder = useCallback(async (ref: string) => {
    setLoading(true);
    try {
      const data = await supplaiApi.getOrder(ref);
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = async (action: 'mark_picked_up' | 'mark_in_transit') => {
    if (!order?.reference) return;
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        action,
        actorPhone: '+2348010000003',
      };
      if (action === 'mark_picked_up') payload.riderName = riderName;
      const result = await supplaiApi.actOnOrder(order.reference, payload);
      if (result.accepted) {
        await fetchOrder(order.reference);
        if (action === 'mark_picked_up') {
          await scheduleCriticalAlert({
            title: 'Pickup recorded',
            body: `Picked up by ${riderName}.`,
            data: { reference: order.reference },
          });
        } else {
          await scheduleCriticalAlert({
            title: 'Transfer in transit',
            body: 'Rider is on the way to the receiving facility.',
            data: { reference: order.reference },
          });
        }
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rider</Text>
        <Text style={styles.headerSub}>{riderName}</Text>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <NotificationBanner role="rider" riderName={riderName} />
        {reference && order && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order summary</Text>
              <Text style={styles.label}>Reference</Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#111827',
                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                }}
              >
                {order.reference}
              </Text>
              <Text style={styles.label}>Commodity · quantity</Text>
              <Text style={{ fontSize: 15, color: '#111827' }}>
                {order.commodity.toUpperCase()} · {order.quantity}
              </Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.button} disabled>
                  <Text style={styles.buttonText}>From</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonOutline]}
                  disabled
                >
                  <Text style={styles.buttonOutlineText}>
                    {order.sourceFacility}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} disabled>
                  <Text style={styles.buttonText}>To</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonOutline]}
                  disabled
                >
                  <Text style={styles.buttonOutlineText}>
                    {order.requestingFacility}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.owner}>
                Next accountable: {order.nextAccountableOwner}
              </Text>
            </View>

            {order.transferReference &&
              order.status !== 'received' &&
              order.status !== 'escalated' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Delivery proof code</Text>
                  <Text style={styles.label}>
                    Share this 4-digit code with the receiving facility to
                    verify handover.
                  </Text>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>
                      {order.transferReference.slice(-4)}
                    </Text>
                  </View>
                </View>
              )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              {order.allowedActions.includes('mark_picked_up') && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonSuccess]}
                  onPress={() => handleAction('mark_picked_up')}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Mark picked up</Text>
                </TouchableOpacity>
              )}
              {order.allowedActions.includes('mark_in_transit') && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonSuccess]}
                  onPress={() => handleAction('mark_in_transit')}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Mark in transit</Text>
                </TouchableOpacity>
              )}
              {order.allowedActions.length === 0 &&
                order.status !== 'received' &&
                order.status !== 'escalated' && (
                  <Text style={{ color: '#6b7280', fontSize: 13 }}>
                    Waiting for dispatch. The LGA assigns a rider via
                    /demo/dispatch.
                  </Text>
                )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <View style={styles.timeline}>
                {order.timeline.map((entry) => (
                  <View
                    key={entry.sequence}
                    style={[
                      styles.eventRow,
                      entry.sequence === order.timeline.length &&
                        styles.eventRowActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.eventDot,
                        entry.sequence === order.timeline.length &&
                          styles.eventDotActive,
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventText}>{entry.label}</Text>
                      <Text style={styles.eventMeta}>
                        {entry.actorRole} ·{' '}
                        {new Date(entry.occurredAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        {!reference && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No order loaded yet.</Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
              <Text style={{ color: '#2563eb', fontWeight: '600' }}>&gt;</Text>{' '}
              Ask the requesting facility to raise a request, then the LGA
              dispatches via /demo/dispatch.
            </Text>
          </View>
        )}
        <NotificationInbox
          role="rider"
          riderName={riderName}
          onSelectOrder={(ref) => setReference(ref)}
        />
      </ScrollView>
    </View>
  );
}
