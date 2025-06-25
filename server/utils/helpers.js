const { generateToken } = require("./jwt");

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    _id: user._id,
    name: user.firstName,
    email: user.email,
    role: user.role,
    token,
  });
};

module.exports = { sendTokenResponse };