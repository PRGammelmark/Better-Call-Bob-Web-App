import Opgave from '../models/opgaveModel.js';
import { sendEmail } from '../emailService.js';

const requestedCleanup = async () => {
    // try {
    //     const result = await Opgave.deleteMany({
    //         isDeleted: { $type: 'date' }
    //     });
    //     console.log(`Deleted ${result.deletedCount} opgaver with isDeleted value of type "date".`);
    // } catch (error) {
    //     console.error('Error deleting opgaver with isDeleted value of type "date":', error);
    // }

    console.log("!!! Systemet forsøgte at slette flere opgaver via requested cleanup !!!")
    await sendEmail("patrickroeikjaer@gmail.com", `En request på at slette alle opgaver i papirkurven er blevet blokeret.`, `Systemet forsøgte at slette alle opgaver i papirkurven.<br /><br />Tjek server-loggen for detaljer.` );
};

export default requestedCleanup;