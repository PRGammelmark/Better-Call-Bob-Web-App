import mongoose from 'mongoose';
import Postering from './models/posteringModel.js';
import Kunde from './models/kunderModel.js';
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

const updatePosteringerMedKundeRef = async () => {
  const posteringer = await Postering.find({ kundeID: { $exists: true }, kunde: { $exists: false } });

  let opdateret = 0;

  for (const postering of posteringer) {
    const kunde = await Kunde.findOne({ _id: postering.kundeID });

    if (kunde) {
      postering.kunde = kunde._id;
      await postering.save();
      opdateret++;
    } else {
      console.warn(`Ingen kunde fundet for kundeID: ${postering.kundeID}`);
    }
  }

  console.log(`Opdateret ${opdateret} posteringer med kunde reference.`);
};

const run = async () => {
  await connect();
  await updatePosteringerMedKundeRef();
  mongoose.disconnect();
};

run();
