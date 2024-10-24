import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import fs from 'fs';
import path from 'path';
import multer from "multer";

const router = express.Router();
router.use(requireAuth);

// Ensure the uploads directory exists
const fakturaerDir = path.resolve('fakturaer');
if (!fs.existsSync(fakturaerDir)) {
    fs.mkdirSync(fakturaerDir, { recursive: true });
}

router.use('/fakturaer', express.static(fakturaerDir));

// Set up multer for file uploads with disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, fakturaerDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST et upload
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Return the correct path and filename from req.file
    res.status(200).send({
        message: 'File uploaded successfully.',
        filePath: `/fakturaer/${req.file.filename}`,
    });
});

// DELETE et upload
router.delete('/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(fakturaerDir, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(400).json({ error: 'File not found or could not be deleted.' });
        }
        res.status(200).json({ message: 'File deleted successfully.' });
    });
});

export default router;