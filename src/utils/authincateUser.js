const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const isEmailUnique = async (email) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    return !existingUser;
};

const isUsernameUnique = async (username) => {
    const existingUser = await prisma.user.findUnique({
        where: { username },
    });
    return !existingUser;
};

const validateUserCreation = [
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters').custom(async (username) => {
        if (!(await isUsernameUnique(username))) {
            throw new Error('Username already exists');
        }
        return true;
    }),
    check('email').isEmail().withMessage('Invalid email address').custom(async (email) => {
        if (!(await isEmailUnique(email))) {
            throw new Error('Email already exists');
        }
        return true;
    }),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
];
const hashPassword = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.hashedPassword = hashedPassword; 

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    validateUserCreation,
    hashPassword,
};