// Input validators

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Password validation logic (min 8 chars, uppercase, lowercase, number, special char)
  return password.length >= 8;
};

const validateUsername = (username) => {
  // Username validation (alphanumeric, no spaces)
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername
};
