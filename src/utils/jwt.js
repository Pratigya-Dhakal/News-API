require('dotenv').config();

const SECRET = process.env.JWT_SECRET ;

const jwt = require('jsonwebtoken');

const generateToken = (userId,role) => {
const token = jwt.sign({ userId, role }, SECRET, { expiresIn: '1h' });
return token;
};

const verifyToken = (token) => {
try {
    const decoded = jwt.verify(token, SECRET);
    return decoded;
} catch (error) {
    console.error('Token verification error:', error.message);
    return null;
}
};

module.exports = { generateToken, verifyToken };
