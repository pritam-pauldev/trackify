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
    } else {
      if (user.password === password) {
        console.log("User login Successful");
        return res.status(200).send("User login Successful");
      } else {
        console.log("User not authorized");
        return res.status(401).send("User not authorized");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  signupCreateUser,
  signinUser,
};
