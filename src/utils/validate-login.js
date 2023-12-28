const { check } = require('express-validator');

const loginValidationMiddleware = [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 }),
];

module.exports = { loginValidationMiddleware };
