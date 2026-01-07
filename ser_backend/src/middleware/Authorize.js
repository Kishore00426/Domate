// Middleware to check if user has one of the allowed roles
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // Ensure user and role exist
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: "No role assigned" });
    }

    // Handle both populated role object and plain string
    let userRole;
    if (typeof req.user.role === "string") {
      userRole = req.user.role.toLowerCase();
    } else if (req.user.role.name) {
      userRole = req.user.role.name.toLowerCase();
    } else {
      return res.status(403).json({ success: false, error: "Invalid role format" });
    }
    // Check if role is allowed
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }


    // ✅ Passed all checks
    next();
  };
};