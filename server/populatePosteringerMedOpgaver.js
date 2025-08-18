import mongoose from 'mongoose';
import Postering from './models/posteringModel.js';
import Kunde from './models/kunderModel.js';
import Opgave from './models/opgaveModel.js';
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

const updatePosteringerMedOpgaver = async () => {
  const posteringer = await Postering.find({ opgaveID: { $exists: true }, opgave: { $exists: false } });

  let opdateret = 0;

  for (const postering of posteringer) {
    const opgave = await Opgave.findOne({ _id: postering.opgaveID });

    if (opgave) {
      postering.opgave = opgave._id;
      await postering.save();
      opdateret++;
    } else {
      console.warn(`Ingen opgave fundet for opgaveID: ${postering.opgaveID}`);
    }
  }

  console.log(`Opdateret ${opdateret} posteringer med opgave reference.`);
};

const run = async () => {
  await connect();
  await updatePosteringerMedOpgaver();
  mongoose.disconnect();
};

run();
