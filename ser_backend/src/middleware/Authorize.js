// Middleware to check if user has one of the allowed roles
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: "No role assigned" });
    }

    const userRole = req.user.role.name; // assuming Role model has a "name" field
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    next();
  };
};