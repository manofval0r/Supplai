import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
  buttonDanger: { backgroundColor: '#dc2626' },
  buttonDisabled: { backgroundColor: '#9ca3af' },
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
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
  },
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
});

const statusLabel = (status: string) => {
  switch (status) {
    case 'awaiting_source_confirmation':
      return 'Awaiting source release';
    case 'awaiting_dispatch':
      return 'Awaiting dispatch';
    case 'rider_en_route':
      return 'Rider en route';
    case 'received':
      return 'Received';
    case 'escalated':
      return 'Escalated';
    default:
      return status;
  }
};

export function FacilityScreen({
  facilityId,
  phone,
}: {
  facilityId: string;
  phone: string;
}) {
  const [reference, setReference] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [commodity, setCommodity] = useState<'ors' | 'zinc'>('ors');
  const [quantity, setQuantity] = useState('20');
  const [proofCode, setProofCode] = useState('');

  useEffect(() => {
    void registerForRemoteNotificationsAsync();
  }, []);

  const fetchOrder = useCallback(async (ref: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await supplaiApi.getOrder(ref);
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRequest = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await supplaiApi.createRequest({
        facilityPhone: phone,
        commodity,
        quantity: Number(quantity),
      });
      if (result.status === 'offered' && result.requestReference) {
        setReference(result.requestReference);
        await fetchOrder(result.requestReference);
        setSuccess(
          `Request raised — ${result.sourceFacility} asked to release within 10 minutes.`,
        );
        await scheduleCriticalAlert({
          title: 'Stock request raised',
          body: `${result.sourceFacility} has been asked to release ${quantity} units.`,
          data: { reference: result.requestReference },
        });
      } else {
        setError('No eligible source stock without breaching a safety floor.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    action:
      'confirm_release' | 'decline_release' | 'receive' | 'refuse_receipt',
  ) => {
    if (!order?.reference) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { action, actorPhone: phone };
      if (action === 'receive') payload.proofCode = proofCode;
      if (action === 'refuse_receipt')
        payload.reason = 'Refused by receiving facility';
      const result = await supplaiApi.actOnOrder(order.reference, payload);
      if (result.accepted) {
        setSuccess(result.message);
        await fetchOrder(order.reference);
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (!reference) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Facility</Text>
          <Text style={styles.headerSub}>
            {facilityId} · {phone}
          </Text>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <NotificationBanner role="facility" facilityId={facilityId} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Raise a stock request</Text>
            <Text style={styles.label}>Commodity (ambient only)</Text>
            <TouchableOpacity
              style={[
                styles.input,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
              onPress={() => setCommodity(commodity === 'ors' ? 'zinc' : 'ors')}
            >
              <Text>
                {commodity === 'ors' ? 'ORS sachets' : 'Zinc 20 mg tablets'}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                tap to switch
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleRequest}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Submitting...' : 'Request stock'}
              </Text>
            </TouchableOpacity>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          {success && <Text style={styles.success}>{success}</Text>}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order {order?.reference}</Text>
        <Text style={styles.headerSub}>
          {statusLabel(order?.status ?? '---')} ·{' '}
          {order?.commodity.toUpperCase()}
        </Text>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <NotificationBanner role="facility" facilityId={facilityId} />
        {order && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order summary</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.button} disabled>
                  <Text style={styles.buttonText}>Source</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonOutline]}
                  disabled
                >
                  <Text style={styles.buttonOutlineText}>
                    {order.sourceFacility}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>Quantity requested</Text>
              <Text style={{ fontSize: 15, color: '#111827' }}>
                {order.quantity}
              </Text>
              <View style={[styles.row, { marginTop: 6 }]}>
                <TouchableOpacity style={styles.button} disabled>
                  <Text style={styles.buttonText}>Batch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonOutline]}
                  disabled
                >
                  <Text style={styles.buttonOutlineText}>
                    {order.evidence.batchNumber}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>Ambient only</Text>
              <Text style={{ fontSize: 13, color: '#374151' }}>
                {order.evidence.ambientOnly ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.owner}>
                Next accountable: {order.nextAccountableOwner}
              </Text>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              {order.allowedActions.includes('confirm_release') && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonSuccess]}
                  onPress={() => handleAction('confirm_release')}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Confirm release</Text>
                </TouchableOpacity>
              )}
              {order.allowedActions.includes('decline_release') && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonDanger]}
                  onPress={() => handleAction('decline_release')}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Decline release</Text>
                </TouchableOpacity>
              )}
              {order.allowedActions.includes('receive') && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>
                    Delivery proof code (4 digits)
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={proofCode}
                    onChangeText={setProofCode}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonSuccess,
                      { marginTop: 6 },
                    ]}
                    onPress={() => handleAction('receive')}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>Accept handover</Text>
                  </TouchableOpacity>
                </View>
              )}
              {order.allowedActions.includes('refuse_receipt') && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonDanger]}
                  onPress={() => handleAction('refuse_receipt')}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Refuse receipt</Text>
                </TouchableOpacity>
              )}
              {order.allowedActions.length === 0 && (
                <Text style={{ color: '#6b7280', fontSize: 13 }}>
                  No actions available for this order.
                </Text>
              )}
            </View>
          </>
        )}
        <NotificationInbox
          role="facility"
          facilityId={facilityId}
          onSelectOrder={(ref) => setReference(ref)}
        />
      </ScrollView>
    </View>
  );
}
