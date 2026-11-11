export type NotificationHandler = (event: unknown) => void;

const activeNotifications = new Set<Notification>();
const responseHandlers = new Set<NotificationHandler>();
let lastResponse: unknown = null;

export async function registerForRemoteNotificationsAsync() {
  if (typeof window === 'undefined' || !('Notification' in window))
    return false;
  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
  return permission === 'granted';
}

export function scheduleCriticalAlert({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  )
    return Promise.resolve();

  const notification = new Notification(title, {
    body,
    data,
    icon: '/icon.png',
    tag: data?.orderReference,
  });
  activeNotifications.add(notification);
  notification.addEventListener(
    'close',
    () => activeNotifications.delete(notification),
    { once: true },
  );
  notification.addEventListener(
    'click',
    () => {
      lastResponse = { title, body, data };
      responseHandlers.forEach((handler) => handler(lastResponse));
      window.focus();
      notification.close();
    },
    { once: true },
  );
  return Promise.resolve();
}

export function addNotificationResponseListener(handler: NotificationHandler) {
  responseHandlers.add(handler);
  return () => {
    responseHandlers.delete(handler);
  };
}

export function clearAllNotificationsAsync(): Promise<void> {
  activeNotifications.forEach((notification) => notification.close());
  activeNotifications.clear();
  return Promise.resolve();
}

export function clearLastNotificationResponseAsync(): Promise<void> {
  lastResponse = null;
  return Promise.resolve();
}
