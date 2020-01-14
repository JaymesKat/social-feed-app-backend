const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const errorWithStatus = require("../util/error");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  console.log(req.body);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, name, password } = req.body;

  bcrypt
    .hash(password, 12)
    .then(hashedPass => {
      const user = new User({
        email,
        password: hashedPass,
        name
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: "User created", userId: result._id });
    })
    .catch(err => {
      next(errorWithStatus(err));
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error("A user with this email could not be found");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(matches => {
      if (!matches) {
        const error = new Error("Wrong password");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        "secret_value",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
      next(err);
    });
};
