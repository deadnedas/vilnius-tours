const jwt = require("jsonwebtoken");

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Extract token from cookie or Authorization header
    const token =
      req.cookies?.jwt || req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    try {
      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // 3. If roles provided, enforce RBAC
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient privileges" });
      }

      // 4. All good: proceed
      next();
    } catch (error) {
      console.error("JWT error:", error);
      return res.status(401).json({ message: "Token is not valid" });
    }
  };
};
