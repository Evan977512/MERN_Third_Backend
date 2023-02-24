const HttpError = require("../models/http-error");

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; // { pid: "p1" }
  // console.log("placeId: ", placeId);
  const place = DUMMY_PLACES.find((p) => {
    console.log("p: ", p);
    return p.id === placeId; // it has to return true
  });

  if (!place) {
    // 404 error response
    // return res.status(404).json({ message: 'Place not found' });
    throw new HttpError("Could not find a place for the provided id", 404);
  }
  res.json({ place }); // > {place} => {place: place}
  console.log("placeId: ", placeId);
};

// function getPlaceById() { ... }
// OR
// const getPlaceById = function() { ... }

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });

  if (!place) {
    //  return res.status(404).json({ message: 'Could not find a place for the provided user id' });
    // const error = new Error("Could not find a place for the provided uid " + userId);
    // error.code = 404;
    // return next(error); // this will reach the next error handling middleware.
    return next(new HttpError("Could not find a place for the provided user id", 404));
  }
  res.json({ place });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
