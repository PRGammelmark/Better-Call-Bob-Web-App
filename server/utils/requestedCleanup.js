import Opgave from '../models/opgaveModel.js';

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
};

export default requestedCleanup;