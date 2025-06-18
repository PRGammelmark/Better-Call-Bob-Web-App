import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:\n', vapidKeys.publicKey);
console.log('\nPrivate Key:\n', vapidKeys.privateKey);