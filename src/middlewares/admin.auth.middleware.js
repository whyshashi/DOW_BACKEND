
async function AdminAuthMiddleware(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No valid user role found" });
    }

    if (Number(req.user.role) === 2) {
      return next();
    }
    else{
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    
  } catch (err) {
    console.error( err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = AdminAuthMiddleware;