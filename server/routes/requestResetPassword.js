import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs"
import User from "../models/brugerModel.js";
import { resetPasswordMail } from "../resetPasswordMail.js";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const router = express.Router();

// Rate limiter to prevent abuse
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Too many password reset requests. Try again later."
});

// Request password reset
router.post("/request-reset-password", emailLimiter, async (req, res) => {
    const { email } = req.body;

    try {
        console.log(email)
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "No user found with this email: " + email });

        // Generate a unique reset token (expires in 1 hour)
        // const resetToken = crypto.randomBytes(32).toString("hex");
        // user.resetToken = resetToken;
        // user.resetTokenExpires = Date.now() + 3600000; // 1 hour
        // await user.save();
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `${process.env.VITE_FRONTEND_URL}/gendan-kodeord?token=${resetToken}`;

        const subject = "Gendan kodeord til Better Call Bob";
        const text = `Hej,\n\nKlik på linket herunder for at oprette et nyt kodeord:\n\n${resetLink}\n\nHvis dette ikke var dig, så kan du ignorere denne mail.\n\nDbh,\nBetter Call Bob`;
        const html = `<p>Hej,</p><p>Klik på linket herunder for at oprette et nyt kodeord:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Hvis dette ikke var dig, så kan du ignorere denne mail.</p><p>Dbh,<br>Better Call Bob</p>`;

        // Send email
        await resetPasswordMail({email, subject, text, html});

        res.json({ message: "Password reset email sent." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error. Try again later." });
    }
});

// Reset password
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Decode the token to get the email
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if the token is valid
        if (!decoded || !decoded.email) {
            return res.status(400).json({ error: "Invalid or expired token." });
        }

        // Find the user by the email stored in the decoded token
        const user = await User.findOne({ email: decoded.email });

        if (!user) return res.status(400).json({ error: "User not found." });

        // Hash the new password and update the user
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password successfully updated." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error. Try again later." });
    }
});

export default router;