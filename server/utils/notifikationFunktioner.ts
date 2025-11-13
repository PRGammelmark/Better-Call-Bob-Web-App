import Notifikation from "../models/notifikationModel.js";
import { Types } from "mongoose";
import Bruger from "../models/brugerModel.js";

interface OpretNotifikationProps {
  modtagerID: Types.ObjectId | string;
  udløserID?: Types.ObjectId | string;
  type: string;
  titel: string;
  besked: string;
  link?: string;
  erVigtig?: boolean;
}

// Helper function to validate and convert udløserID to a valid ObjectId or null
const validateUdløserID = (udløserID?: Types.ObjectId | string): Types.ObjectId | null | undefined => {
  if (!udløserID) return null;
  
  // If it's already an ObjectId, return it
  if (udløserID instanceof Types.ObjectId) return udløserID;
  
  // If it's a string, check if it's a valid ObjectId
  if (typeof udløserID === 'string') {
    // Check if it's a special string like "system" or "admin" that shouldn't be an ObjectId
    if (udløserID === "system" || udløserID === "admin") {
      return null;
    }
    
    // Check if it's a valid ObjectId string
    if (Types.ObjectId.isValid(udløserID)) {
      return new Types.ObjectId(udløserID);
    }
    
    // If it's not a valid ObjectId, return null
    return null;
  }
  
  return null;
};

export const opretNotifikation = async ({ modtagerID, udløserID, type, titel, besked, link, erVigtig = false }: OpretNotifikationProps): Promise<void> => {
  
  try {
    // Validate and convert udløserID
    const validatedUdløserID = validateUdløserID(udløserID);
    
    if(modtagerID === "admin") {
      const admins = await Bruger.find({ isAdmin: true });
      
      if(admins.some((admin) => admin._id.toString() === validatedUdløserID?.toString())) return;

      for (const admin of admins) {
        const n = new Notifikation({ modtagerID: admin._id, udløserID: validatedUdløserID, type, titel, besked, link, erVigtig });
        await n.save();
      }
  
      return;
    }
  
    if (modtagerID?.toString() === validatedUdløserID?.toString()) return;
    
    const n = new Notifikation({ modtagerID, udløserID: validatedUdløserID, type, titel, besked, link, erVigtig });
    await n.save();
  } catch (error) {
    console.error("Fejl ved oprettelse af notifikation:", error);
  }
};
