import mongoose from 'mongoose';
import Postering from './models/posteringModel.js';
import Kunde from './models/kunderModel.js';
import Bruger from './models/brugerModel.js';
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

const infusePercentageVariablesIntoPosteringer = async () => {
  const posteringer = await Postering.find({});

  let opdateret = 0;

  for (const postering of posteringer) {
    const ekstraSatser = {
      aftenTillægPris: 50,
      natTillægPris: 100,
    }

    postering.satser = { ...postering.satser, ...ekstraSatser };
    await postering.save();
    opdateret++;
  }

  console.log(`Opdateret ${opdateret} posteringer med bruger reference.`);
};

const run = async () => {
  await connect();
  await infusePercentageVariablesIntoPosteringer();
  mongoose.disconnect();
};

run();
