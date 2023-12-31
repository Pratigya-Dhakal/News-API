const bcrypt = require('bcrypt');
const hashUpdatePassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        req.hashedPassword = hashedPassword;
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = {
    hashUpdatePassword,
};
