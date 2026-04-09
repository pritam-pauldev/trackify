const Users = require("../models/users");

const signupCreateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const findUser = await Users.findOne({
      where: {
        email: email,
      },
    });
    if (findUser) {
        res.status(409).send("already exist");
        return;
    } else {
      await Users.create({
        name: name,
        email: email,
        password: password,
      });
      console.log("user: ${name}, email: ${email} account is created");
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

module.exports = {
  signupCreateUser,
};
