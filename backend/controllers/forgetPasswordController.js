const Users = require("../models/users");
const ForgotPassword = require("../models/forgotPassword");
const bcrypt = require("bcrypt");
const sendPasswordResetEmail = require("../utils/sendEmail");

// POST /password/forgotpassword
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ where: { email } });

    // Never leak whether email exists
    if (!user) {
      return res.status(200).json({
        message: "If this email is registered, a reset link has been sent.",
      });
    }

    // Create a new ForgotPassword row — UUID is auto-generated
    const resetRequest = await ForgotPassword.create({ userId: user.id });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?id=${resetRequest.id}`;
    await sendPasswordResetEmail(user.email, resetLink);

    console.log(`Password reset email sent to: ${email}`);
    return res.status(200).json({
      message: "If this email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// POST /password/resetpassword/:uuid
const resetPassword = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { newPassword } = req.body;

    // Check request exists and is still active
    const resetRequest = await ForgotPassword.findOne({
      where: { id: uuid, isActive: true },
    });

    if (!resetRequest) {
      return res.status(400).json({
        message:
          "Reset link is invalid or has already been used. Please request a new one.",
      });
    }

    // Hash and update password
    const hash = await bcrypt.hash(newPassword, 10);
    await Users.update(
      { password: hash },
      { where: { id: resetRequest.userId } },
    );

    // Invalidate the reset link
    resetRequest.isActive = false;
    await resetRequest.save();

    console.log(`Password reset successful for userId: ${resetRequest.userId}`);
    return res.status(200).json({
      message: "Password reset successfully! You can now sign in.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { forgotPassword, resetPassword };
