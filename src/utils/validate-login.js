const { check, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const {generateToken} = require('../utils/jwt')

const prisma = new PrismaClient();

const loginValidationMiddleware = [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 }),
    ];

    const validateLogin = async (req, res, next) => {
    loginValidationMiddleware.forEach((middleware) => middleware(req, res, () => {}));

    const { email, password } = req.body;

    try {
        const storedUser = await prisma.user.findUnique({
        where: {
            email: email,
        },
        });
        if (!storedUser) {
            return res.status(401).json({ error: 'Invalid email' });
        }

        if (!storedUser || !storedUser.password) {
        return res.status(401).json({ error: 'Invalid Credential' });
        }

        const passwordMatch = await bcrypt.compare(password, storedUser.password);

        if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid Password' });
        }
        const token = generateToken(storedUser.id,storedUser.role);
        return res.status(200).json({ message: 'Login successful', storedUser , token});
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    };

    module.exports = { loginValidationMiddleware, validateLogin };
