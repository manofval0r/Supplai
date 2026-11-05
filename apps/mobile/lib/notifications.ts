import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo';

Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
});

let responseListener: EventSubscription | null = null;

export type NotificationHandler = (
  event: Notifications.NotificationResponse,
) => void;

export async function registerForRemoteNotificationsAsync() {
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
}

export function addNotificationResponseListener(handler: NotificationHandler) {
  responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => handler(response),
  );
  return () => {
    if (responseListener) {
      responseListener.remove();
      responseListener = null;
    }
  };
}

export async function clearAllNotificationsAsync() {
  await Notifications.dismissAllNotificationsAsync();
}

export async function clearLastNotificationResponseAsync() {
  await Notifications.clearLastNotificationResponseAsync();
}
