// const admin = require("firebase-admin");

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const userRecord = await admin.auth().getUserByEmail(email);
//     res.status(200).json({ message: "User found", uid: userRecord.uid });
//   } catch (error) {
//     res.status(401).json({ message: "Invalid credentials", error });
//   }
// };

// module.exports = { loginUser };
