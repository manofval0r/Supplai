import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RolePicker, type Role } from './components/RolePicker';
import { FacilityScreen } from './screens/FacilityScreen';
import { RiderScreen } from './screens/RiderScreen';

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [facilityId, setFacilityId] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [riderName, setRiderName] = useState<string>('');

  useEffect(() => {
    StatusBar.setStyle('dark');
  }, []);

  if (!role) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <RolePicker
          onRoleSelected={(selectedRole, identity) => {
            setRole(selectedRole);
            setFacilityId(identity.facilityId ?? '');
            setPhone(identity.phone ?? '');
            setRiderName(identity.riderName ?? '');
          }}
        />
      </SafeAreaView>
    );
  }

  if (role === 'facility') {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <FacilityScreen facilityId={facilityId} phone={phone} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RiderScreen riderName={riderName} />
    </SafeAreaView>
  );
}
