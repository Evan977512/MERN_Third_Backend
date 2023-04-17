const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();

const port = process.env.PORT || 5002;

app.use(bodyParser.json());

// image handler middleware
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  // image error handling
  if (req.file) {
    fs.unlink(req.file.path, () => {
      console.log("Image deleted!");
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  // .connect("mongodb+srv://emdwlekr:rladudcks91@cluster0.wuba1f8.mongodb.net/mern_third?retryWrites=true&w=majority", {
  .connect("mongodb+srv://emdwlekr:rladudcks91@cluster0.wuba1f8.mongodb.net/mern_third?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // Use createIndexes instead of collection.ensureIndex
    writeConcern: {
      // Use writeConcern instead of top-level w, wtimeout, j, and fsync
      w: "majority",
      j: true,
      wtimeout: 1000,
    },
  })
  .then(() => {
    app.listen(port);
    console.log(`Server is running on ${port}`);
  })
  .catch((err) => {
    console.log(err);
  });
