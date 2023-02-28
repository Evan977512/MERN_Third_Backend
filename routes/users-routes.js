const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", usersController.getUsers);

// signup route needs validation
router.post(
  "/signup",
  [check("name").not().isEmpty(), check("email").normalizeEmail().isEmail(), check("password").isLength({ min: 6 })],
  usersController.signup
);

router.post("/login", usersController.login);

// how to link to App.js??
module.exports = router;
