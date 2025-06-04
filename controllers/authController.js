const admin = require("firebase-admin");
const AWS = require("aws-sdk");
// const awsIot = require("aws-iot-device-sdk"); /////////////////// Uncomment if wanna test AWS IoT/////////////////
const authService = require("../servicers/authServicer");

const db = admin.firestore();

const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Generate password reset link via Firebase Admin SDK
    const link = await admin.auth().generatePasswordResetLink(email);

    // Here, you can send the email yourself using your preferred email service,
    // or just return the link to the frontend for client-side email sending.
    // For now, let's just return the link (or you can implement Nodemailer, etc.)

    // Example: send via Nodemailer (optional)
    // await sendResetEmail(email, link);

    return res.status(200).json({ message: "Password reset link generated", resetLink: link });
  } catch (error) {
    console.error("Error generating password reset link:", error);
    return res.status(500).json({ error: "Failed to generate password reset email" });
  }
};


const signup = async (req, res) => {
  const { email, password } = req.body;
  //console.log("Signup request received");

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
        //console.error("Error creating new user:", createError);
        return res.status(500).json({ error: "Failed to create user" });
      }
    } else {
      // If it's some other error, handle it
      //console.error("Error during signup:", error);
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  //console.log("Login request received");

  try {
    const { idToken, localId } = await authService.signInWithEmailAndPassword(
      email,
      password
    );

    // Configure AWS region and temporary credentials from Cognito Identity Pool
    AWS.config.region = process.env.AWS_REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID,
      Logins: {
        [`securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`]: idToken,
      },
    });

    console.log("AWS credentials configured");

    // Fetch AWS temporary credentials
    await new Promise((resolve, reject) => {
      AWS.config.credentials.get(function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    const identityId = AWS.config.credentials.identityId;
    console.log("Fetched AWS Identity ID:", identityId);

    // === Step: Ensure IoT policy is attached to this Identity ID ===
    const iot = new AWS.Iot();

    const policyName = process.env.AWS_IOT_POLICY_NAME;

    try {
      const attached = await iot
        .listAttachedPolicies({ target: identityId })
        .promise();
      console.log("Attached policies checked");
      const alreadyAttached = attached.policies.some(
        (policy) => policy.policyName === policyName
      );

      if (!alreadyAttached) {
        console.log(`Policy not attached, attaching policy: ${policyName}`);
        await iot
          .attachPolicy({
            policyName: policyName,
            target: identityId,
          })
          .promise();
        console.log("IoT policy attached successfully");
      } else {
        console.log("IoT policy already attached");
      }
    } catch (err) {
      console.error("Error checking/attaching IoT policy:", err);
      return res.status(500).json({ error: "Failed to ensure IoT permissions" });
    }

    // === Step: Fetch Firestore data for user ===
    const snapshot = await db
      .collection("employees")
      .where("email", "==", email)
      .get();
    let restaurantId = null;

    if (!snapshot.empty) {
      restaurantId = snapshot.docs[0].data().restaurantId || null;
    }

    /////////////////// Uncomment if wanna test AWS IoT/////////////////
    // console.log("User data fetched from Firestore:", {
    //   email,
    //   restaurantId,
    // });

    // // === Step: Connect to AWS IoT via MQTT using temporary credentials ===
    // const device = awsIot.device({
    //   region: process.env.AWS_REGION,
    //   protocol: "wss",
    //   accessKeyId: AWS.config.credentials.accessKeyId,
    //   secretKey: AWS.config.credentials.secretAccessKey,
    //   sessionToken: AWS.config.credentials.sessionToken,
    //   host: process.env.AWS_IOT_ENDPOINT,
    // });

    // console.log("Connecting to AWS IoT via MQTT...");

    // device.on("connect", function () {
    //   console.log("Connected to AWS IoT via MQTT!");
    //   device.publish(
    //     "test/topic",
    //     JSON.stringify({
    //       message: `User ${email} logged in`,
    //       timestamp: new Date().toISOString(),
    //     }),
    //     (err) => {
    //       if (err) {
    //         console.error("Publish error:", err);
    //       } else {
    //         console.log("Message published to test/topic");
    //       }
    //     }
    //   );
    // });
    /////////////////// Uncomment if wanna test AWS IoT/////////////////

    // console.log(`robot/${identityId}/control`);
    // // print all AWS.config credentials
    // console.log("AWS Credentials:");
    // console.log(`Access Key ID: ${AWS.config.credentials.accessKeyId}`);
    // console.log(`Secret Access Key: ${AWS.config.credentials.secretAccessKey}`);
    // console.log(`Session Token: ${AWS.config.credentials.sessionToken}`);

    return res.status(200).json({
      message: "Login successful",
      user: {
        uid: localId,
        email,
        token: idToken,
        restaurantId,
        awsAccessKey: AWS.config.credentials.accessKeyId,
        awsSecretKey: AWS.config.credentials.secretAccessKey,
        awsSessionToken: AWS.config.credentials.sessionToken,
        awsRegion: process.env.AWS_REGION,
        awsHost: process.env.AWS_IOT_ENDPOINT,
        topic: `robot/${identityId}/control`, // dynamically include idToken in the topic string
      },
    });
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return res.status(401).json({ error: "Invalid email or password" });
  }
};

const logout = async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.auth().revokeRefreshTokens(uid);
    console.log(`Revoked tokens for user: ${uid}`);
    return res.status(200).json({ message: "Logout successful and token revoked" });
  } catch (error) {
    console.error("Error revoking tokens:", error);
    return res.status(500).json({ error: "Failed to revoke tokens" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  sendPasswordResetEmail,
};
