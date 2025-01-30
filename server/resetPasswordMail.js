import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from './models/brugerModel.js'; // Adjust path as needed

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.simply.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const resetPasswordMail = async ({email, subject, text, html}) => {
    try {
        // Check if the email exists in the database
        const user = await User.findOne({ email: email });
        if (!user) {
            console.log(`Email not found: ${email}`);
            return; // Exit if the email is not in the system
        }

        // Email content
        const mailOptions = {
            from: `"Better Call Bob" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
            html: html
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Reset link sent to: ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};
