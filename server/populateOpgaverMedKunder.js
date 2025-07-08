import mongoose from 'mongoose';
import Opgave from './models/opgaveModel.js';
import Kunde from './models/kunderModel.js';
import dotenv from "dotenv"

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

const updateOpgaverMedKundeRef = async () => {
  const opgaver = await Opgave.find({ kundeID: { $exists: true }, kunde: { $exists: false } });

  let opdateret = 0;

  for (const opgave of opgaver) {
    const kunde = await Kunde.findOne({ _id: opgave.kundeID });

    if (kunde) {
      opgave.kunde = kunde._id;
      await opgave.save();
      opdateret++;
    } else {
      console.warn(`Ingen kunde fundet for kundeID: ${opgave.kundeID}`);
    }
  }

  console.log(`Opdateret ${opdateret} opgaver med kunde reference.`);
};

const run = async () => {
  await connect();
  await updateOpgaverMedKundeRef();
  mongoose.disconnect();
};

run();
