const jwtUtils = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateUser = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const tokenParts = authorizationHeader.split(' ');

        if (tokenParts.length !== 2) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
        }

        const token = tokenParts[1];
        // console.log('Access Token:', token);

        let decoded;

        try {
            decoded = jwtUtils.verifyToken(token);
            // console.log('Decoded Access Token:', decoded);

            if (!decoded || !decoded.userId || !decoded.role) {
                return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
            }

            req.user = { userId: decoded.userId, role: decoded.role };
        } catch (error) {
            console.error('Access token verification error:', error);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const { userId, role } = req.user;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || user.role !== role) {
            return res.status(401).json({ error: 'Unauthorized: User not found or invalid role' });
        }

        if (user.verify !== 'VERIFIED') {
            return res.status(401).json({ error: 'Unauthorized: Email not verified' });
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { authenticateUser };
