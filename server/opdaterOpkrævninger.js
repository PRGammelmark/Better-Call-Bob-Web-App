import mongoose from 'mongoose';
import Postering from './models/posteringModel.js';
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
};

const opdaterOpkrævningsbeløbFraTotalbeløb = async () => {
  const posteringer = await Postering.find({});

  let opdateret = 0;
  let antalOpkrævningerOpdateret = 0;

  for (const postering of posteringer) {
    // Check if postering has faktura-opkrævninger
    if (!postering.opkrævninger || postering.opkrævninger.length === 0) {
      continue;
    }

    // Check if postering has totalPris
    if (!postering.totalPris || postering.totalPris === 0) {
      continue;
    }

    // Calculate totalbeløb inkl. moms (25% VAT)
    const totalbeløbInklMoms = postering.totalPris * 1.25;

    // Check if there are any faktura-opkrævninger
    const fakturaOpkrævninger = postering.opkrævninger.filter(
      opkrævning => opkrævning.metode === 'faktura'
    );

    if (fakturaOpkrævninger.length === 0) {
      continue;
    }

    // Update opkrævningsbeløb for each faktura-opkrævning
    let posteringOpdateret = false;
    for (const opkrævning of fakturaOpkrævninger) {
      // Only update if the amount is different (to avoid unnecessary updates)
      if (opkrævning.opkrævningsbeløb !== totalbeløbInklMoms) {
        opkrævning.opkrævningsbeløb = totalbeløbInklMoms;
        posteringOpdateret = true;
        antalOpkrævningerOpdateret++;
      }
    }

    if (posteringOpdateret) {
      await postering.save();
      opdateret++;
      console.log(`Opdateret postering ${postering._id}: ${fakturaOpkrævninger.length} faktura-opkrævning(er) med beløb ${totalbeløbInklMoms.toFixed(2)} kr.`);
    }
  }

  console.log(`\nOpdateret ${opdateret} posteringer med ${antalOpkrævningerOpdateret} faktura-opkrævninger i alt.`);
};

const run = async () => {
  await connect();
  await opdaterOpkrævningsbeløbFraTotalbeløb();
  mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

run();

