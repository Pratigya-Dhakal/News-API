require('dotenv').config();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const prisma = new PrismaClient();

const authenticateAuthor = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                const refreshToken = req.headers['x-refresh-token'];

                if (!refreshToken) {
                    return res.status(401).json({ error: 'Unauthorized: Access token expired, no refresh token provided' });
                }

                try {
                    const refreshDecoded = jwt.verify(refreshToken, REFRESH_SECRET);
                    const { userId, role } = refreshDecoded;

                    const user = await prisma.user.findUnique({ where: { id: userId } });

                    if (!user || user.role !== role) {
                        return res.status(401).json({ error: 'Unauthorized: Invalid refresh token' });
                    }

                    const newAccessToken = jwt.sign({ userId, role }, SECRET, { expiresIn: '1h' });

                    req.user = { userId, role, newAccessToken };

                    next();
                    return;
                } catch (refreshError) {
                    console.error('Refresh token verification error:', refreshError);
                    return res.status(401).json({ error: 'Unauthorized: Invalid refresh token' });
                }
            } else {
                console.error('Access token verification error:', error);
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
        }

        if (!decoded || !decoded.userId || !decoded.role) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
        });

        if (!user || user.role !== 'AUTHOR') {
            console.error('User not found or not an author:', user);
            return res.status(403).json({ error: 'Access Denied' });
        }

        req.user = {
            id: user.id,
            role: user.role,
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { authenticateAuthor };
