const Users = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendPasswordResetEmail = require("../utils/sendEmail");
const { Op } = require("sequelize");
require("dotenv").config();

const signupCreateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const findUser = await Users.findOne({
      where: {
        email: email,
      },
    });
    const hash = await bcrypt.hash(password, 10);

    if (findUser) {
      res.status(409).send("already exist");
      return;
    } else {
      await Users.create({
        name: name,
        email: email,
        password: hash,
        isPremium: false,
        totalExpense: 0,
      });

      console.log(`user: ${name}, email: ${email} account is created`);
      res.status(201).json({
        name: name,
        email: email,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign(
        {
          userId: user.id,
          isPremium: user.isPremium,
        },
        "1q2waSE34rdZXcG457HVnjuY67InKu89PlIFYU64SRTUinvcd4679OJfr",
        { expiresIn: "1h" },
      );
      console.log("User login Successful");
      return res.status(200).json({
        token: token,
      });
    } else {
      console.log("User not authorized");
      return res.status(401).send("User not authorized");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

// ── FORGOT PASSWORD ─────────────────────────────────────────
const forgotPassword = async (req, res) => {
  console.log("SMTP USER:", process.env.BREVO_SMTP_USER);
  console.log("SMTP PASS:", process.env.BREVO_SMTP_PASS?.slice(0, 10));
  try {
    const { email } = req.body;
    const user = await Users.findOne({ where: { email } });

    // Always respond the same — never leak if email exists
    if (!user) {
      return res.status(200).json({
        message: "If this email is registered, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;
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

// ── RESET PASSWORD ──────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await Users.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { [Op.gt]: new Date() }, // token must not be expired
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    console.log(`Password reset successful for: ${user.email}`);
    return res
      .status(200)
      .json({ message: "Password reset successfully! You can now sign in." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signupCreateUser,
  signinUser,
  forgotPassword,
  resetPassword,
};
