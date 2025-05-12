const admin = require("firebase-admin");
const authService = require("../servicers/authServicer");

const db = admin.firestore();

const signup = async (req, res) => {
  const { email, password } = req.body;
  console.log("Signup request received");

  try {
    // Check if the user already exists by email
    await authService.getUserByEmail(email);
    // If this doesn't throw an error, it means the user exists, and you should not proceed with signup
    return res.status(400).json({ error: "Email already in use" });
  } catch (error) {
    // If the error is because the user doesn't exist, we can proceed to create a new user
    if (error.code === "auth/user-not-found") {
      try {
        // Create the new user
        const user = await authService.createUser(email, password);
        return res.status(200).json({ message: "Signup successful", user });
      } catch (createError) {
        console.error("Error creating new user:", createError);
        return res.status(500).json({ error: "Failed to create user" });
      }
    } else {
      // If it's some other error, handle it
      console.error("Error during signup:", error);
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request received");

  try {
    const { idToken, localId } = await authService.signInWithEmailAndPassword(
      email,
      password
    );

    // Optional: Fetch additional user data
    const snapshot = await db
      .collection("employees")
      .where("email", "==", email)
      .get();
    let restaurantId = null;

    if (!snapshot.empty) {
      restaurantId = snapshot.docs[0].data().restaurantId || null;
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        uid: localId,
        email,
        token: idToken,
        restaurantId,
      },
    });
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return res.status(401).json({ error: "Invalid email or password" });
  }
};

module.exports = {
  signup,
  login,
};
