import mongoose from 'mongoose';
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

const logOpgaveBeskrivelser = async () => {
  try {
    // Fetch all opgaver
    const opgaver = await Opgave.find({}).sort({ createdAt: -1 });
    
    console.log(`\n=== Fundet ${opgaver.length} opgaver i systemet ===\n`);
    
    // Log each opgavebeskrivelse
    opgaver.forEach((opgave, index) => {
      console.log(`--- Opgave ${index + 1} ---`);
      console.log(`Opgavebeskrivelse: ${opgave.opgaveBeskrivelse || '(Ingen beskrivelse)'}`);
      console.log(''); // Empty line for readability
    });
    
    console.log(`\n=== Færdig med at logge ${opgaver.length} opgavebeskrivelser ===\n`);
  } catch (error) {
    console.error('Fejl ved hentning af opgaver:', error);
    throw error;
  }
};

const run = async () => {
  await connect();
  await logOpgaveBeskrivelser();
  mongoose.disconnect();
  console.log('Databaseforbindelse lukket.');
};

run();

