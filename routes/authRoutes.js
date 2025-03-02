const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  console.log("Signup request received");

  try {
    // Check if email is already in use
    await admin.auth().getUserByEmail(email);
    return res.status(400).json({ error: "Email already in use" });
  } catch (error) {
    try {
      // Create new user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email,
        password, // Firebase Authentication handles password hashing
      });
      return res.status(200).json({
        message: "Signup successful",
        user: userRecord,
      });
    } catch (error) {
      console.error("Error creating new user:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }
  }
});

// ✅ Login Route (Using Firebase Admin SDK)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request received");

  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a custom token for authentication
    const token = await admin.auth().createCustomToken(user.uid);

    return res.status(200).json({
      message: "Login successful",
      user: {
        uid: user.uid,
        email: user.email,
        token: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({ error: "Invalid email or password" });
  }
});

module.exports = router;
