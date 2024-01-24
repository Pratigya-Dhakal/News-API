require('dotenv').config();
const SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const  VERIFICATION_SECRET = process.env.JWT_VERIFICATION_SECRET
const jwt = require('jsonwebtoken');

const generateTokens = (userId, role, expiresIn = '2h', refreshExpiresIn = '7d') => {
    const accessToken = jwt.sign({ userId, role }, SECRET, { expiresIn });
    const refreshToken = jwt.sign({ userId, role }, REFRESH_SECRET, { expiresIn: refreshExpiresIn });

    return { accessToken, refreshToken };
};
const generateVerificationToken = (userId, role, expiresIn = '10m') => {
    const verificationToken = jwt.sign({ userId, role }, VERIFICATION_SECRET, { expiresIn });
    return { verificationToken };
    };


const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};
const verifyVerificationToken = (token) => {
    try {
        if (!token) {
            throw new Error('Token is missing.');
        }

        const decoded = jwt.verify(token, VERIFICATION_SECRET);

        if (!decoded) {
            throw new Error('Invalid token.');
        }

        return decoded;
    } catch (error) {
        console.error('Token verification error:', error.message);
        return null;
    }
};


const verifyRefreshToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        return decoded;
    } catch (error) {
        console.error('Refresh token verification error:', error);
        return null;
    }
};

module.exports = { generateTokens,generateVerificationToken, verifyToken, verifyRefreshToken, verifyVerificationToken };
