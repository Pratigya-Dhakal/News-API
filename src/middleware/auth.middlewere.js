const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const SECRET = process.env.JWT_SECRET;


const authenticateUser = (req, res, next) => {
    try {
        // Your authentication logic here
        const token = req.headers.authorization.split(' ')[1]; // Assuming the token is in the Authorization header

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const decoded = jwt.verify(token, SECRET);
        req.user = decoded; // Assuming decoded user information is stored in req.user

        const { role } = req.user;

        // Check if the role is "ADMIN"
        if (role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access Denied' });
        }

        next(); // Call next() if authentication is successful
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { authenticateUser };
