import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:patrick@bettercallbob.dk',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPushNotification = async (subscription, payload) => {
  try {
    console.log('🔔 Sender push notifikation til:', subscription.endpoint);
    const response = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    console.log('✅ Push notifikation sendt');
    return response;
  } catch (error) {
    console.error('❌ Fejl ved afsendelse af push notifikation:', error);

    // Nogle fejl har en statuskode og kan indikere at subscription er ugyldig
    if (
      error.statusCode === 410 || // Gone
      error.statusCode === 404    // Not found
    ) {
      console.warn('⚠️ Subscription er ikke længere gyldig og bør fjernes:', subscription.endpoint);
    }

    throw error; // Genkast fejlen så den kan håndteres oppe i stacken hvis nødvendigt
  }
};
