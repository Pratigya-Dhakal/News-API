const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: PASSWORD,
    },
});

function sendVerificationEmail(email, token) { 
    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: 'Account Verification',
        text: `Link will be expired in 5 minutes.Thank You.
        Click the following link to verify your account: localhost:8000/api/admin/verify/${token}

        Regards,
        News-Api Team
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending verification email:', error);
        } else {
            console.log('Verification email sent: ' + info.response);
        }
    });
}

module.exports = { sendVerificationEmail };
