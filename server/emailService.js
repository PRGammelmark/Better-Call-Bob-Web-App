import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.simply.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
});

export const sendEmail = async (to, subject, body, html) => {
    const mailOptions = {
        from: `"Better Call Bob" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: body,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};