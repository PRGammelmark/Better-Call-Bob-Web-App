import { storage } from '../../../firebase.js'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const uploadFakturaTilFirebase = (fakturaPDF, opgaveID) => {
    const fakturaBlob = new Blob([fakturaPDF.data], { type: 'application/pdf' });
    const storageRef = ref(storage, `fakturaer/faktura_${opgaveID}.pdf`);

    return uploadBytes(storageRef, fakturaBlob)
        .then(() => getDownloadURL(storageRef))
        .then((downloadURL) => {
            console.log("File uploaded. URL:", downloadURL);
            return downloadURL;
        })
        .catch((error) => {
            console.error("Upload error:", error);
            throw error;
        });
}

export default uploadFakturaTilFirebase;
