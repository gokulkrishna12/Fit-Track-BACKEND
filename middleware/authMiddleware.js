const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Header-la "Authorization: Bearer <token>" irukka nu check panrom
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // "Bearer" vaarthaya vittutu token-a mattum edukkurom
            token = req.headers.authorization.split(' ')[1];

            // Token-a namma secret key vechu verify panrom
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verify aana token-la irundhu user ID eduthu, database-la thedi, request kooda attach panrom (password thavira)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Next function-ku pass panrom
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };