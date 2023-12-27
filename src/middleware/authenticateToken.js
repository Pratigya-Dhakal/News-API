const { verifyToken } = require('../utils/jwt');
function authenticateToken(req, res, next) {
    const authHeader  = req.header('Authorization');
    console.log(authHeader)
    const token = authHeader.split(" ")[1]
    console.log(token)
    
    console.log('Received token:', token); 

    if (!token) {
        console.log('Token missing');
        return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    const decoded = verifyToken(token);

    console.log('Decoded token:', decoded);
    if (!decoded) {
        console.log('Invalid token');
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    req.user = decoded;

    next();
}


module.exports = authenticateToken;
