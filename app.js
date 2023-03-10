const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");
const port = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.json());

// CORS configuration middleware
app.use((req, res, next) => {
  // attach headers to the all response
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-control-Allow-Headers", "Origin, X-requested-With, Content-Type, Acceept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Create routes
app.use("/api/places", placesRoutes); // => /api/places/...만 되도록 설정해보자
app.use("/api/users", usersRoutes);

// this error handling middleware will be executed if the request is not handled by any of the above middlewares.
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error; // use 'throw' when it is a synchronous code
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect("mongodb+srv://emdwlekr:rladudcks91@cluster0.wuba1f8.mongodb.net/mern_third?retryWrites=true&w=majority")
  .then(() => {
    app.listen(port);
    console.log(`Server is running on port ${port}`);
  })
  .catch((err) => {
    console.log(err);
  });
