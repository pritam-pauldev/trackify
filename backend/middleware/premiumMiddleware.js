const premiumMiddleware = (req, res, next) => {
  if (!req.user?.isPremium) {
    return res
      .status(403)
      .json({ message: "This feature is for premium users only." });
  }
  next();
};

module.exports = premiumMiddleware;
