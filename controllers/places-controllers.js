// uuid package == generate unique id
const uuid = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

let DUMMY_PLACES = [
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

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    //  return res.status(404).json({ message: 'Could not find a place for the provided user id' });
    // const error = new Error("Could not find a place for the provided uid " + userId);
    // error.code = 404;
    // return next(error); // this will reach the next error handling middleware.
    return next(new HttpError("Could not find a place for the provided user id", 404));
  }
  res.json({ places });
};

const createPlace = (req, res, next) => {
  // validationResult function will look into this request and check if there are any errors.
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { title, description, coordinates, address, creator } = req.body;
  // const title = req.body.title; 의 줄임말
  const createdPlace = {
    id: uuid.v4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace); // add to the dummy data

  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid; // pid is the name of the parameter {/:pid}

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) }; // copy the object
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId); // find the index of the object
  updatedPlace.title = title; // update the object
  updatedPlace.description = description; // update the object

  DUMMY_PLACES[placeIndex] = updatedPlace; // update the dummy data

  res.status(200).json({ place: updatedPlace }); // return the updated object
};

const deletePlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  console.log("placeId: ", placeId);
  // filter() returns a new array with the elements that pass the test implemented by the provided function.
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
