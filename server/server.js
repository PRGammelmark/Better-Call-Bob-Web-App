import express from "express"
import dotenv from "dotenv"
import opgaverRoutes from "./routes/opgaver.js"
import kunderRoutes from "./routes/kunder.js"
import brugerRoutes from "./routes/brugere.js"
import posteringRoutes from "./routes/posteringer.js"
import kommentarerRoutes from "./routes/kommentarer.js"
import ledigeTiderRoutes from "./routes/ledigeTider.js"
import besøgRoutes from "./routes/besøg.js"
import uploadsRoutes from "./routes/uploads.js"
import fakturaerRoutes from "./routes/fakturaer.js"
import smsRoutes from "./routes/sms.js"
import mobilePayRoutes from "./routes/mobilePay.js"
import dokumenterUploadsRoutes from "./routes/dokumenterUploads.js"
import mongoose from "mongoose"
import cors from "cors"
import { sendEmail } from './emailService.js';
import resetPasswordRoutes from './routes/requestResetPassword.js';
import scheduledCleanup from './utils/scheduledCleanup.js';
import requestedCleanup from './utils/requestedCleanup.js';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';

dotenv.config();
const app = express();
const port = process.env.PORT;

const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many password reset requests. Try again later."
});

// middleware
const allowedOrigins = [
    'https://bcb-pwa-app.onrender.com',  // Production
    'https://app.bettercallbob.dk',      // Production
    'http://localhost:3000',             // Development
    'http://localhost:5173',             // Development
    'http://localhost:5174'              // Development
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
app.use(express.json({ limit: '5mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Serve static files from the uploads directory
app.use('/api/uploads', express.static('uploads'));
app.use('/api/fakturaer', express.static('fakturaer'));
app.use('/api/dokumenter-uploads', express.static('dokumenter-uploads'));

// Define email sending route
app.post('/api/send-email', async (req, res) => {
    const { to, subject, body, html } = req.body; // Destructure the email details from the request body

    try {
        await sendEmail(to, subject, body, html); // Call the sendEmail function
        res.status(200).json({ message: 'Email sent successfully' }); // Respond with success
    } catch (error) {
        console.error('Error sending email:', error); // Log any errors
        res.status(500).json({ error: 'Error sending email' }); // Respond with error
    }
});

// routes
app.use('/api/password', resetPasswordRoutes);
app.use('/api/opgaver', opgaverRoutes);
app.use('/api/brugere', brugerRoutes);
app.use('/api/kunder', kunderRoutes);
app.use('/api/posteringer', posteringRoutes);
app.use('/api/kommentarer', kommentarerRoutes);
app.use('/api/ledige-tider', ledigeTiderRoutes);
app.use('/api/besoeg', besøgRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/fakturaer', fakturaerRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/mobilepay', mobilePayRoutes);
app.use('/api/dokumenter-uploads', dokumenterUploadsRoutes);
app.use('/api/cleanup', (req, res) => {
    requestedCleanup();
    res.status(200).json({ message: 'Papirkurv er blevet ryddet.' });
});

// Daily scheduled cleanup
cron.schedule('0 0 * * *', async () => {
    try {
        await scheduledCleanup();
        console.log('Daily cleanup of old opgaver completed successfully.');
    } catch (error) {
        console.error('Error during daily cleanup of old opgaver:', error);
    }
});

// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        // Cleanup deleted tasks more than 30 days old
        await scheduledCleanup();
        
        app.listen(port, () => {
            console.log(`App running, connected to database, and listening on port ${port}.`)
        });
    })
    .catch((error) => {
        console.log(error)
    })
