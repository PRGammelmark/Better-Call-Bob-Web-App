import express from "express"
import dotenv from "dotenv"
import opgaverRoutes from "./routes/opgaver.js"
import kunderRoutes from "./routes/kunder.js"
import brugerRoutes from "./routes/brugere.js"
import opgavetyperRoutes from "./routes/opgavetyper.js"
import posteringRoutes from "./routes/posteringer.js"
import kommentarerRoutes from "./routes/kommentarer.js"
import ledigeTiderRoutes from "./routes/ledigeTider.js"
import besøgRoutes from "./routes/besøg.js"
import uploadsRoutes from "./routes/uploads.js"
import fakturaerRoutes from "./routes/fakturaer.js"
import fakturaOpkraevningerRoutes from "./routes/fakturaOpkraevninger.js"
import smsRoutes from "./routes/sms.js"
import mobilePayRoutes from "./routes/mobilePay.js"
import dokumenterUploadsRoutes from "./routes/dokumenterUploads.js"
import indstillingerRoutes from "./routes/indstillinger.js";
import mongoose from "mongoose"
import cors from "cors"
import { sendEmail } from './emailService.js';
import resetPasswordRoutes from './routes/requestResetPassword.js';
import scheduledCleanup from './utils/scheduledCleanup.js';
import requestedCleanup from './utils/requestedCleanup.js';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';
import { sendPushNotification } from './utils/pushService.js';
import { collectKvitteringer } from './utils/collectKvitteringer.js';
import aiRoutes from './routes/ai.js';
import { sendFakturaIgen } from './utils/sendFakturaIgen.js';
import { tjekFakturaForBetaling } from './utils/tjekFakturaForBetaling.js';
import { registrerBetalinger } from './utils/registrerBetalinger.js';
import path from 'path';
import { fileURLToPath } from "url";
import elementorWebhookRouter from "./routes/elementorWebhook.js";
import notifikationerRouter from "./routes/notifikationer.js";
import remindersRouter from "./routes/reminders.js";
import { startReminderScheduler } from './utils/reminderScheduler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    'https://bettercallbob.dk',          // Website
    'https://handymankbh.dk',            // Website  
    'https://handymanfrederiksberg.dk',  // Website
    'http://localhost:3000',             // Development
    'http://localhost:5173',             // Development
    'http://localhost:5174',             // Development
    'http://192.168.1.11:3000',          // Development
    'http://192.168.1.11:5173',          // Development
    'http://192.168.1.11:5174'           // Development
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

app.post('/api/send-faktura-igen', async (req, res) => {
    try {
        await sendFakturaIgen(req.body);
        res.status(200).json({ message: 'Fakturaen er blevet sendt igen til ' + req.body.to + '.' });
    } catch (error) {
        console.error('Error sending email for faktura', req.body.fakturaNummer, error);
        res.status(500).json({ error: 'Error sending email' });
    }
});

// Tjek faktura for om den er betalt (true / false)
app.post('/api/tjek-faktura-for-betaling', async (req, res) => {
    try {
      const { opkrævning } = req.body;
      const fakturaNummer = opkrævning.reference.split('/').pop();
      const betalt = await tjekFakturaForBetaling(fakturaNummer);
      res.json({ betalt });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Kunne ikke tjekke betaling' });
    }
});  

// Define push notification route
app.post('/api/send-push', async (req, res) => {
    const { modtager, payload } = req.body;
    try {
      await sendPushNotification(modtager, payload);
      res.status(200).json({ message: 'Push sent' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to send push' });
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
app.use('/api/faktura-opkraevninger', fakturaOpkraevningerRoutes);
app.use('/api/sms', smsRoutes);
app.use("/api/indstillinger", indstillingerRoutes);
app.use('/api/opgavetyper', opgavetyperRoutes)
app.use('/api/mobilepay', mobilePayRoutes);
app.use('/api/dokumenter-uploads', dokumenterUploadsRoutes);
app.use("/api/webhook", elementorWebhookRouter);
app.use("/api/notifikationer", notifikationerRouter);
app.use("/api/reminders", remindersRouter);
app.use('/api/cleanup', (req, res) => {
    requestedCleanup();
    res.status(200).json({ message: 'Papirkurv er blevet ryddet.' });
});
app.get("/api/version", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "version.json"));
});

// AI-parsing af opgaver
app.use('/api/ai', aiRoutes);

// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {     
        // Start reminder scheduler after DB connection
        startReminderScheduler();
        app.listen(port, "0.0.0.0", () => {
            console.log(`App running, connected to database, and listening on port ${port}.`)
        });
    })
    .catch((error) => {
        console.log(error)
    })
