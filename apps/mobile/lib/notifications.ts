import type { EventSubscription } from 'expo';

interface ExpoNotificationsModule {
  setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldShowBanner: boolean;
      shouldShowList: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }) => void;
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  setNotificationChannelAsync: (
    channelId: string,
    channel: { name: string; importance: number; sound: string },
  ) => Promise<void>;
  scheduleNotificationAsync: (request: {
    content: {
      title: string;
      body: string;
      data?: Record<string, string>;
      sound: boolean;
      priority: string;
    };
    trigger: null;
  }) => Promise<string>;
  addNotificationResponseReceivedListener: (
    listener: (response: unknown) => void,
  ) => EventSubscription;
  dismissAllNotificationsAsync: () => Promise<void>;
  clearLastNotificationResponseAsync: () => Promise<void>;
  AndroidImportance: { HIGH: number };
  AndroidNotificationPriority: { HIGH: string };
}

// Safe lazy import of expo-notifications to prevent crashing in environments/Expo Go
// where native modules like ExpoApplication are omitted.
let Notifications: ExpoNotificationsModule | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications') as ExpoNotificationsModule;
  Notifications.setNotificationHandler({
    handleNotification: () =>
      Promise.resolve({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
  });
} catch (e) {
  console.warn(
    'Native notifications module not available in this environment:',
    e,
  );
}

let responseListener: EventSubscription | null = null;

export type NotificationHandler = (event: unknown) => void;

export async function registerForRemoteNotificationsAsync() {
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (String(existing) !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (String(finalStatus) !== 'granted') return false;
    await Notifications.setNotificationChannelAsync('supplai-critical', {
      name: 'Supplai Critical',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
    return true;
  } catch (err) {
    console.warn('registerForRemoteNotificationsAsync error:', err);
    return false;
  }
}

export async function scheduleCriticalAlert({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  if (!Notifications) {
    console.log('[Notification Fallback]', title, body, data);
    return;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('scheduleCriticalAlert error:', err);
  }
}

export function addNotificationResponseListener(handler: NotificationHandler) {
  if (!Notifications) return () => {};
  try {
    responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: unknown) => handler(response),
    );
    return () => {
      if (responseListener) {
        responseListener.remove();
        responseListener = null;
      }
    };
  } catch (err) {
    console.warn('addNotificationResponseListener error:', err);
    return () => {};
  }
}

export async function clearAllNotificationsAsync() {
  if (!Notifications) return;
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (err) {
    console.warn('clearAllNotificationsAsync error:', err);
  }
}

export async function clearLastNotificationResponseAsync() {
  if (!Notifications) return;
  try {
    await Notifications.clearLastNotificationResponseAsync();
  } catch (err) {
    console.warn('clearLastNotificationResponseAsync error:', err);
  }
}
