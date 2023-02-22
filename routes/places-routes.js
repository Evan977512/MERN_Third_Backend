const express = require("express");

const router = express.Router();

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire tate Building",
    description: "One of the most famous  place in the world!",
    location: { lat: 40.784474, lng: -73.9871516 },
    address: "wow this is the address New York, NY 10001",
    creator: "u1",
  },
];

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid; // { pid: "p1" }
  // console.log("placeId: ", placeId);
  const place = DUMMY_PLACES.find((p) => {
    console.log("p: ", p);
    return p.id === placeId; // it has to return true
  });
  res.json({ place }); // > {place} => {place: place}
  console.log("placeId: ", placeId);
});

// how to link to App.js??
module.exports = router;
