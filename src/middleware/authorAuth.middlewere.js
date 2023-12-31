require('dotenv').config();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const SECRET = process.env.JWT_SECRET;

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

        const decoded = jwt.verify(token, SECRET);
        // console.log('Decoded Token:', decoded);

        if (!decoded || !decoded.userId || !decoded.role) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
        }

        const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
        });

        // console.log('Fetched User:', user);

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
