import { sendEmail } from './emailService.js';

const testEmail = async () => {
    const to = 'patrickroeikjaer@gmail.com'; // Replace with the recipient's email address
    const subject = 'Test-email fra Better Call Bob';
    const text = 'Lad os se om dette fungerer!';

    try {
        await sendEmail(to, subject, text);
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Error sending test email:', error);
    }
};

testEmail();