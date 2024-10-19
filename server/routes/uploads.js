import express from "express"
import requireAuth from "../middleware/requireAuth.js";
import fs from 'fs';
import path from 'path';
import multer from "multer"
import sharp from 'sharp';

const router = express.Router();
router.use(requireAuth) 

// Ensure the uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads with conditional image compression
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const compressImage = (req, res, next) => {
    if (!req.file) {
      return next();
    }
  
    const filename = Date.now() + path.extname(req.file.originalname);
    // Resolve the absolute path for the uploads folder
    const filePath = path.resolve('uploads', filename);
  
    sharp(req.file.buffer)
      .metadata()
      .then(metadata => {
        if (metadata.width > 800 || metadata.height > 800) {
          return sharp(req.file.buffer)
            .resize({
              width: metadata.width > 800 ? 800 : null,
              height: metadata.height > 800 ? 800 : null,
              fit: sharp.fit.inside,
              withoutEnlargement: true
            })
            .toFile(filePath); // Save to the absolute path
        } else {
          return sharp(req.file.buffer).toFile(filePath); // Save without resizing
        }
      })
      .then(() => {
        req.file.path = filePath;
        req.file.filename = filename;
        next();
      })
      .catch(err => {
        res.status(500).send('Error processing image.');
      });
  };
  

// Use `compressImage` middleware before the final route handler
router.post('/', upload.single('file'), compressImage, (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    // Return the correct path and filename from req.file
    res.status(200).send({
      message: 'File uploaded successfully.',
      filePath: `/uploads/${req.file.filename}`, // This should now be defined
    });
  });
  

// DELETE et upload
router.delete('/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('uploads', filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(400).json({ error: 'File not found or could not be deleted.' });
        }
        res.status(200).json({ message: 'File deleted successfully.' });
    });
});

export default router;