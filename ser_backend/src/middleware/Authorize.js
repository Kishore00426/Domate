// Middleware to check if user has one of the allowed roles
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: "No role assigned" });
    }

    // Handle both populated role object and plain string
    let userRole;
    if (typeof req.user.role === "string") {
      userRole = req.user.role;
    } else if (req.user.role.name) {
      userRole = req.user.role.name;
    } else {
      return res.status(403).json({ success: false, error: "Invalid role format" });
    }

    // Check if role is allowed
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Optional: prevent providers from updating other providers
    if (
      userRole === "service_provider" &&
      req.params.id &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({ success: false, error: "Access denied: cannot modify other provider" });
    }

    next();
  };
};