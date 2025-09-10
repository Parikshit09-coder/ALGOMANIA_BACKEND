const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "ALGOMANIA3_SECRET_KEY";

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token,"ALGOMANIA3_SECRET_KEY");
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        
        return res.status(403).json({ message: "Access denied" , role : decoded.role});
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token hu" });
    }
  };
}

module.exports = authMiddleware; 