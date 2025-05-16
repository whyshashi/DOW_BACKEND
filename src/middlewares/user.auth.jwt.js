const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { TOKEN_OPTIONS } = require('../config/constant');

async function jwtAuth(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const checkUser = await User.findById(decoded._id);
    if (!checkUser) {
      return res.status(401).json({ msg: " user not found" });
    }

    if(checkUser.isActive===false){
      return res.status(404).json({meassage:"user is blocked"});
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token is expired, please log in again" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token" });
    }

    res.status(500).json({ msg: "Internal server error" });
  }
}

module.exports = jwtAuth;
