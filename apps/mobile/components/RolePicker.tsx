import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  optionSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 10,
    flex: 1,
  },
  hint: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#ffffff',
  },
  buttonOutlineText: { color: '#2563eb', fontWeight: '700', fontSize: 15 },
});

export type Role = 'facility' | 'rider';

export interface RolePickerProps {
  onRoleSelected: (
    role: Role,
    identity: { facilityId?: string; phone?: string; riderName?: string },
  ) => void;
}

export function RolePicker({ onRoleSelected }: RolePickerProps) {
  const [role, setRole] = useState<Role | null>(null);
  const [facilityId, setFacilityId] = useState('PHC-A');
  const [phone, setPhone] = useState('+2348010000001');
  const [riderName, setRiderName] = useState('Demo Rider');

  const isFacility = role === 'facility';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supplai</Text>
      <Text style={styles.subtitle}>
        Emergency medicine redistribution &middot; role shell
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select role</Text>
        <TouchableOpacity
          style={[styles.option, isFacility && styles.optionSelected]}
          onPress={() => setRole('facility')}
        >
          <Text
            style={[
              styles.optionLabel,
              { color: isFacility ? '#2563eb' : '#374151' },
            ]}
          >
            Facility (requester / source)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, !isFacility && styles.optionSelected]}
          onPress={() => setRole('rider')}
        >
          <Text
            style={[
              styles.optionLabel,
              { color: !isFacility ? '#2563eb' : '#374151' },
            ]}
          >
            Rider (pickup / handover)
          </Text>
        </TouchableOpacity>
      </View>

      {isFacility && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Facility id (e.g. PHC-A)"
            value={facilityId}
            onChangeText={setFacilityId}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone (e.g. +2348010000001)"
            value={phone}
            onChangeText={setPhone}
          />
          <Text style={styles.hint}>
            PHC-A = requester, PHC-B = source custodian
          </Text>
        </>
      )}
      {!isFacility && (
        <TextInput
          style={styles.input}
          placeholder="Rider name (e.g. Demo Rider)"
          value={riderName}
          onChangeText={setRiderName}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!role) return Alert.alert('Pick a role first');
          if (isFacility && (!facilityId.trim() || !phone.trim())) {
            return Alert.alert('Enter facility id and phone');
          }
          onRoleSelected(role, {
            ...(isFacility
              ? { facilityId: facilityId.trim(), phone: phone.trim() }
              : { riderName: riderName.trim() }),
          });
        }}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
