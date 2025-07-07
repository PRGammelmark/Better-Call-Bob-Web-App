import Opgave from '../models/opgaveModel.js';
import { sendEmail } from '../emailService.js';

const scheduledCleanup = async () => {
    // const thirtyDaysAgo = new Date();
    // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // try {
    //     const result = await Opgave.deleteMany({
    //         isDeleted: { $lte: thirtyDaysAgo }
    //     });
    //     console.log(`Deleted ${result.deletedCount} old opgaver.`);
    // } catch (error) {
    //     console.error('Error deleting old opgaver:', error);
    // }

    console.log("!!! Systemet forsøgte at slette flere opgaver via scheduled cleanup !!!")
    await sendEmail("patrickroeikjaer@gmail.com", `Scheduled cleanup på at slette alle opgaver i papirkurven er blevet blokeret.`, `Systemet forsøgte at slette alle opgaver i papirkurven.<br /><br />Tjek server-loggen for detaljer.` );
};

export default scheduledCleanup;