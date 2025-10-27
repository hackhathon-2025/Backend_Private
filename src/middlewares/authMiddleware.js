const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token format" });

    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

module.exports = authMiddleware;
