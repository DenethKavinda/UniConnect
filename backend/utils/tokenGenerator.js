const jwt = require('jsonwebtoken');

// JWT token generator

// const generateToken = (userId) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: '7d'
//   });
// };
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
