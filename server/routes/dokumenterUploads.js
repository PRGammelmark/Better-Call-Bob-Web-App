import express from "express"
import requireAuth from "../middleware/requireAuth.js";
import multer from "multer";
import path from "path";
import fs from 'fs';
import { getDokumenter, getDokument, createDokument, deleteDokument, updateDokument } from "../controllers/dokumenterController.js"

const router = express.Router();

router.use(requireAuth) 

// Ensure the uploads directory exists
const uploadsDir = path.resolve('dokumenter-uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads with disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Post et dokument
router.post('/', upload.single('fil'), (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    console.log('Uploaded file:', req.file); // Debug log
    next();
}, createDokument);

// router.post('/', upload.single('file'), (req, res) => {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }
  
//     // Return the correct path and filename from req.file
//     res.status(200).send({
//       message: 'File uploaded successfully.',
//       filSti: `/dokumenter-uploads/${req.file.filename}`, // This should now be defined
//     });
// });

// Get alle dokumenter
router.get('/', getDokumenter)

// router.get('/', (req, res) => {
//     const files = fs.readdirSync(uploadsDir);
//     res.status(200).json(files);
// });

// Get et enkelt dokument
router.get('/:id', getDokument)

// router.get('/:filename', (req, res) => {
//     const { filename } = req.params;
//     const filePath = path.join('dokumenter-uploads', filename);
//     res.status(200).sendFile(filePath);
// });

// DELETE et dokument
router.delete('/:id', deleteDokument)

// router.delete('/:filename', (req, res) => {
//     const { filename } = req.params;
//     const filePath = path.join('dokumenter-uploads', filename);

//     fs.unlink(filePath, (err) => {
//         if (err) {
//             return res.status(400).json({ error: 'File not found or could not be deleted.' });
//         }
//         res.status(200).json({ message: 'File deleted successfully.' });
//     });
// });

// OPDATER et dokument
router.patch('/:id', updateDokument)



export default router;