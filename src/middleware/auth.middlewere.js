const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const SECRET = process.env.JWT_SECRET;


const authenticateUser = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const decoded = jwt.verify(token, SECRET);
        req.user = decoded; 

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
