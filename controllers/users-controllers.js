const uuid = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Evan Kim",
    email: "test@example.com",
    password: "password",
  },
];

// returns all the users stored in DB
const getUsers = async (req, res, next) => {
  let users;
  try {
    // -password means that we don't want to return the password
    users = await User.find({}, "-password");
  } catch (error) {
    const err = new HttpError("Fetching users failed, please try again later.", 500);
    return err;
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log("errors: ", errors);
  if (!errors.isEmpty()) {
    // console.log(errors);
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  console.log(req.body);
  const { name, email, password, places } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again later.", 500);
    return next(err);
  }

  if (existingUser) {
    const error = new HttpError("User exists already, please login instead.", 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: "https://knowyourmeme.com/photos/1297938",
    password,
    places,
  });

  // save user
  try {
    await createdUser.save();
  } catch (error) {
    throw error;
    // const err = new HttpError("Signing up failed, please try again later.", 500);
    // return next(err);
  }

  // status 201 means success
  // toObject({ getters: true }) is a mongoose method that converts the mongoose object to a javascript object
  // getters: true means that we want to get the value of the virtual property
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  // post request has body and headers
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

  // validate email and password
  if (!identifiedUser || identifiedUser.password !== password) {
    // 401 means that authentication failed
    throw new HttpError("Could not find user, credentials not available", 401);
  }

  res.json({ message: "Logged in!!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
