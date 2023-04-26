const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

// write all the logic to validate an incoming request for its token.
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  } // if the request is an OPTIONS request, we don't want to do anything

  // check wether we have a token
  // and if we have a token, we need to check if it is valid
  // prefer Header because it does not affect URL and keeps it cleaner
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, "megasecret_dont_share"); // validating the token
    req.userData = { userId: decodedToken.userId }; // we can add data to the request object
    next(); // if the token is valid, we can call next() to continue the request
  } catch (err) {
    const error = new HttpError("Authentication failed.", 401);
    return next(error);
  }
};
