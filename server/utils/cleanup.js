import Opgave from '../models/opgaveModel.js';

const deleteOldOpgaver = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        const result = await Opgave.deleteMany({
            isDeleted: { $lte: thirtyDaysAgo }
        });
        console.log(`Deleted ${result.deletedCount} old opgaver.`);
    } catch (error) {
        console.error('Error deleting old opgaver:', error);
    }
};

export default deleteOldOpgaver;