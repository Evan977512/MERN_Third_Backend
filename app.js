const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes); // => /api/places/...만 되도록 설정해보자

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

app.listen(5000);
