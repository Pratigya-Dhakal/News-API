const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwtUtils = require('../utils/jwt');

const verifyUser = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwtUtils.verifyVerificationToken(token);

        if (!decoded) {
            return res.status(400).send('Invalid token.');
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(404).send('User not found.');
        }

        if (user.verify === 'VERIFIED') {
            return res.status(400).send('User already verified.');
        }

        // Only update if the user is not already verified
        if (user.verify === 'NOTVERIFIED') {
            await prisma.user.update({
                where: { id: decoded.userId },
                data: { verify: 'VERIFIED' },
            });

            res.send('Account verified successfully!');
        } else {
            res.status(400).send('User already verified.');
        }
    } catch (error) {
        console.error('Error verifying user:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(400).send('Verification link has expired.');
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { verifyUser };
