const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

// returns all the users stored in DB
const getUsers = async (req, res, next) => {
  let users;
  try {
    // -password means that we don't want to return the password
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Fetching users failed, please try again later.", 500);
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};
// console.log(errors);

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again later.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User exists already, please login instead.", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    // 12 is salt rounds
    // 12 is recommended by the bcryptjs documentation
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again.", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  // save user
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again later.", 500);
    return next(error);
  }

  // create token
  let token;
  try {
    token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, "megasecret_dont_share", {
      expiresIn: "1h",
    });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again later.", 500);
    return next(error);
  }

  // status 201 means success
  // toObject({ getters: true }) is a mongoose method that converts the mongoose object to a javascript object
  // getters: true means that we want to get the value of the virtual property
  // res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Loggin in failed, please try again later.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Invalid credentials, could not log you in.", 401);
    return next(error);
  }

  // if user exist then compare the password
  // it returns false if the password is not correct
  // next() is used to pass the error to the error handling middleware
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Could not log you in, please check your credentials and try again.", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials, could not log you in.", 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, "megasecret_dont_share", {
      expiresIn: "1h",
    });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again later.", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
