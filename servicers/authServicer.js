// authService.js
const admin = require("firebase-admin");

const getUserByEmail = async (email) => {
  return await admin.auth().getUserByEmail(email);
};

const createUser = async (email, password) => {
  return await admin.auth().createUser({ email, password });
};

const generateCustomToken = async (uid) => {
  return await admin.auth().createCustomToken(uid);
};

module.exports = {
  getUserByEmail,
  createUser,
  generateCustomToken,
};
