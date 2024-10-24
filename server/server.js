import express from "express"
import dotenv from "dotenv"
import multer from "multer"
import path from "path"
import opgaverRoutes from "./routes/opgaver.js"
import brugerRoutes from "./routes/brugere.js"
import posteringRoutes from "./routes/posteringer.js"
import kommentarerRoutes from "./routes/kommentarer.js"
import ledigeTiderRoutes from "./routes/ledigeTider.js"
import besøgRoutes from "./routes/besøg.js"
import uploadsRoutes from "./routes/uploads.js"
import fakturaerRoutes from "./routes/fakturaer.js"
import smsRoutes from "./routes/sms.js"
import mongoose from "mongoose"
import cors from "cors"
import { sendEmail } from './emailService.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

// middleware
const allowedOrigins = [
    'https://bcb-pwa-app.onrender.com',  // Production
    'https://app.bettercallbob.dk',      // Production
    'http://localhost:3000',             // Development
    'http://localhost:5173'              // Development
];

const corsOptions = {
    origin: (origin, callback) => {
        // If no origin (like in server-to-server calls) or origin is allowed, proceed
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // if using cookies/authentication
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '2mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Serve static files from the uploads directory
app.use('/api/uploads', express.static('uploads'));
app.use('/api/fakturaer', express.static('fakturaer'));

// Define email sending route
app.post('/api/send-email', async (req, res) => {
    const { to, subject, body } = req.body; // Destructure the email details from the request body

    try {
        await sendEmail(to, subject, body); // Call the sendEmail function
        res.status(200).json({ message: 'Email sent successfully' }); // Respond with success
    } catch (error) {
        console.error('Error sending email:', error); // Log any errors
        res.status(500).json({ error: 'Error sending email' }); // Respond with error
    }
});

// routes
app.use('/api/opgaver', opgaverRoutes);
app.use('/api/brugere', brugerRoutes);
app.use('/api/posteringer', posteringRoutes);
app.use('/api/kommentarer', kommentarerRoutes);
app.use('/api/ledige-tider', ledigeTiderRoutes);
app.use('/api/besoeg', besøgRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/fakturaer', fakturaerRoutes);
app.use('/api/sms', smsRoutes);



// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(port, () => {
            console.log(`App running, connected to database, and listening on port ${port}.`)
        });
    })
    .catch((error) => {
        console.log(error)
    })
