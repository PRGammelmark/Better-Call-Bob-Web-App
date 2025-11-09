import Postering from "../models/posteringModel.js";

export async function registrerOpkrævninger(posteringer, reference, metode, opkrævningsbeløb) {
    for (const postering of posteringer) {
        const dbPostering = await Postering.findById(postering._id);
        if (dbPostering) {
        dbPostering.opkrævninger.push({
            reference: reference,
            opkrævningsbeløb: opkrævningsbeløb,
            metode: metode,
            dato: new Date()
        });
        await dbPostering.save();
        }
    }
}
