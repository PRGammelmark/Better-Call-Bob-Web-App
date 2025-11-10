import cron from 'node-cron';
import mongoose from 'mongoose';
import { natligFakturaBetalingTjek } from './utils/natligFakturaBetalingTjek.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('DB connected');

  cron.schedule('0 3 * * *', async () => {
    console.log('⏰ Kører natligt fakturabetalingstjek (kl. 03:00)...');
    await natligFakturaBetalingTjek();
  }, { timezone: 'Europe/Copenhagen' });

  console.log('✅ Cronjob kører som baggrundsproces');
});
