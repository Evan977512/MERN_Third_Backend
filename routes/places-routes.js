const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  console.log("GET request in places");
  res.json({ message: "It works!!" });
});

// how to link to App.js??
module.exports = router;
