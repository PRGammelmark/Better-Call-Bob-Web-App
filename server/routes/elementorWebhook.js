import express from "express";
import { handleElementorWebhook } from "../controllers/elementorWebhookController.js";

const router = express.Router();

// POST /api/webhook/elementor
router.post("/elementor", handleElementorWebhook);

export default router;