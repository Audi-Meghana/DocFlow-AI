const jwt = require("jsonwebtoken");
const { findUserById } = require("../utils/storage");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };

      next();
    } else {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token failed",
    });
  }
};

module.exports = protect;