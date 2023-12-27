require('dotenv').config();

const SECRET = process.env.JWT_SECRET ;

const jwt = require('jsonwebtoken');

const generateToken = (userId, role, expiresIn = '1h') => {
    return jwt.sign({ userId, role }, SECRET, { expiresIn });
};

module.exports = { generateToken };