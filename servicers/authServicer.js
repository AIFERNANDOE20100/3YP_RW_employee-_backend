const admin = require("firebase-admin");
const axios = require("axios");

// Ensure you access the API key from process.env
const apiKey = process.env.FIREBASE_API_KEY;

const getUserByEmail = async (email) => {
  return await admin.auth().getUserByEmail(email);
};

const createUser = async (email, password) => {
  return await admin.auth().createUser({ email, password });
};

const generateCustomToken = async (uid) => {
  return await admin.auth().createCustomToken(uid);
};

const signInWithEmailAndPassword = async (email, password) => {
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, // Use apiKey from process.env
    {
      email,
      password,
      returnSecureToken: true,
    }
  );
  return response.data; // contains idToken, localId, etc.
};

module.exports = {
  getUserByEmail,
  createUser,
  generateCustomToken,
  signInWithEmailAndPassword,
};
