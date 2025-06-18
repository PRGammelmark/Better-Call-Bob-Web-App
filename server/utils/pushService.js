import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:patrick@bettercallbob.dk',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPushNotification = (subscription, payload) => {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
};
