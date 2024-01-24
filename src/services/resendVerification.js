const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwtUtils = require('../utils/jwt');
const emailService = require('../middleware/emailService');

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email not provided in the request body.' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.verify === 'VERIFIED') {
            return res.status(400).json({ error: 'User is already verified.' });
        }

        const { verificationToken } = jwtUtils.generateVerificationToken(user.id, user.role);

        await emailService.sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Verification email resent successfully.' });
    } catch (error) {
        console.error('Error resending verification email:', error);

        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = { resendVerification };
