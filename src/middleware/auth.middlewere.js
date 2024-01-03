const jwtUtils = require('../utils/jwt'); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log('Access Token:', token);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        let decoded;

        try {
            decoded = jwtUtils.verifyToken(token);
            console.log('Decoded Access Token:', decoded);
            req.user = decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                const refreshToken = req.headers['x-refresh-token'];

                if (!refreshToken) {
                    return res.status(401).json({ error: 'Unauthorized: Access token expired, no refresh token provided' });
                }

                const refreshDecoded = jwtUtils.verifyRefreshToken(refreshToken);

                if (!refreshDecoded) {
                    return res.status(401).json({ error: 'Unauthorized: Invalid refresh token' });
                }

                const { userId, role } = refreshDecoded;
                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (!user || user.role !== role) {
                    return res.status(401).json({ error: 'Unauthorized: Invalid refresh token' });
                }

                const { accessToken, refreshToken: newRefreshToken } = jwtUtils.generateTokens(userId, role);
                req.user = { userId, role, accessToken, newRefreshToken };
            } else {
                console.error('Access token verification error:', error);
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
        }

        const { role } = req.user;

        if (role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access Denied' });
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { authenticateUser };
