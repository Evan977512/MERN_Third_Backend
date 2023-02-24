const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");

const app = express();

app.use("/api/places", placesRoutes); // => /api/places/...만 되도록 설정해보자

app.listen(5000);
