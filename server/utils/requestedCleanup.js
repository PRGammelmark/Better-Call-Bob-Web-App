import Opgave from '../models/opgaveModel.js';

const requestedCleanup = async () => {
    try {
        const result = await Opgave.deleteMany({
            isDeleted: { $nin: [null] }
        });
        console.log(`Deleted ${result.deletedCount} opgaver with isDeleted value.`);
    } catch (error) {
        console.error('Error deleting opgaver with isDeleted value:', error);
    }
};

export default requestedCleanup;