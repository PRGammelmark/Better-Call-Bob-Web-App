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
}

export const opretNotifikation = async ({ modtagerID, udløserID, type, titel, besked, link }: OpretNotifikationProps): Promise<void> => {
  
  try {
    if(modtagerID === "admin") {
      const admins = await Bruger.find({ isAdmin: true });
      
      if(admins.some((admin) => admin._id.toString() === udløserID?.toString())) return;

      for (const admin of admins) {
        const n = new Notifikation({ modtagerID: admin._id, udløserID,type, titel, besked, link });
        await n.save();
      }
  
      return;
    }
  
    if (modtagerID?.toString() === udløserID?.toString()) return;
    
    const n = new Notifikation({ modtagerID, udløserID, type, titel, besked, link });
    await n.save();
  } catch (error) {
    console.error("Fejl ved oprettelse af notifikation:", error);
  }
};
