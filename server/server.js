import express from "express"
import dotenv from "dotenv"
import opgaverRoutes from "./routes/opgaver.js"
import brugerRoutes from "./routes/brugere.js"
import mongoose from "mongoose"
import cors from "cors"

dotenv.config();

const app = express();
const port = process.env.PORT;

// middleware
app.use(cors())
app.use(express.json());

// routes
app.use('/api/opgaver', opgaverRoutes);
app.use('/api/brugere', brugerRoutes);

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