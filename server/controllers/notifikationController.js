import Notifikation from "../models/notifikationModel.js";

// Hent notifikationer pr. bruger
export const hentNotifikationer = async (req, res) => {
  try {
    const { userID } = req.params; // eller hent fra auth token
    const notifikationer = await Notifikation.find({ modtagerID: userID })
      .sort({ createdAt: -1 })
      .limit(10); // de seneste 10
    res.json(notifikationer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hent 10 flere notifikationer
export const hentFlereNotifikationer = async (req, res) => {
  try {
    const { userID } = req.params;
    const { offset } = req.query;
    const notifikationer = await Notifikation.find({ modtagerID: userID })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(10);
    res.json(notifikationer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SSE endpoint
export const sseNotifikationer = async (req, res) => {
    const { userID } = req.params;
  
    // Indstil headers til SSE
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders();
  
    // Send heartbeat for at holde connection åben
    const interval = setInterval(() => {
      res.write(":\n\n"); // kommentar linje holder connection alive
    }, 20000);
  
    // Funktion til at sende notifikationer
    const sendNotifikation = async (notifikation) => {
      if (notifikation.modtagerID.toString() === userID) {
        res.write(`data: ${JSON.stringify(notifikation)}\n\n`);
      }
    };
  
    let sidsteTid = new Date();

    const poll = setInterval(async () => {
      const nye = await Notifikation.find({
        modtagerID: userID,
        createdAt: { $gt: sidsteTid } // kun nyere
      }).sort({ createdAt: 1 });
    
      nye.forEach(n => {
        sendNotifikation(n);
        sidsteTid = n.createdAt; // opdater sidst sendte tid
      });
    }, 5000);
    
  
    // Cleanup ved disconnect
    req.on("close", () => {
      clearInterval(interval);
      clearInterval(poll);
    });
};

// Opret ny notifikation
export const opretNotifikation = async (req, res) => {
  try {
    const { modtagerID, udløserID, type, titel, besked, link } = req.body;
    const ny = new Notifikation({ modtagerID, udløserID, type, titel, besked, link });
    await ny.save();
    res.status(201).json(ny);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Markér som læst
export const laest = async (req, res) => {
  try {
    const { id } = req.params;
    const notifikation = await Notifikation.findByIdAndUpdate(id, { læst: true }, { new: true });
    if (!notifikation) return res.status(404).json({ message: "Notifikation ikke fundet" });
    res.json(notifikation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Markér som ulæst
export const ulaest = async (req, res) => {
  try {
    const { id } = req.params;
    const notifikation = await Notifikation.findByIdAndUpdate(id, { læst: false }, { new: true });
    if (!notifikation) return res.status(404).json({ message: "Notifikation ikke fundet" });
    res.json(notifikation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Markér som set
export const set = async (req, res) => {
  const { id } = req.params;
  const notifikation = await Notifikation.findByIdAndUpdate(id, { set: true }, { new: true });
  if (!notifikation) return res.status(404).json({ message: "Notifikation ikke fundet" });
  res.json(notifikation);
};

// Markér flere som set
export const setFlere = async (req, res) => {
  try {
    const { ids } = req.body;
    await Notifikation.updateMany(
      { _id: { $in: ids } },
      { $set: { set: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Slet en notifikation
export const sletNotifikation = async (req, res) => {
  const { id } = req.params;
  const notifikation = await Notifikation.findByIdAndDelete(id);
  if (!notifikation) return res.status(404).json({ message: "Notifikation ikke fundet" });
  res.json(notifikation);
};