// uuid package == generate unique id
const uuid = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");

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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: "p1" }
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError("Something went wrong, could not find a place.", 500);
    return next(err);
  }

  if (!place) {
    // 404 error response
    // return res.status(404).json({ message: 'Place not found' });
    const error = new HttpError("Could not find a place for the provided id", 404);
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) }); // > {place} => {place: place}
};

// function getPlaceById() { ... }
// OR
// const getPlaceById = function() { ... }
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    // find method does not return promise, it returns an array
    // If you want to return promise from find method, you can use exec() method
    places = await Place.find({ creator: userId });
  } catch (error) {
    const err = new HttpError("Fetching places failed, please try again later.", 500);
    return next(err);
  }

  if (!places || places.length === 0) {
    // return res.status(404).json({ message: 'Could not find a place for the provided user id' });
    // const error = new Error("Could not find a place for the provided uid " + userId);
    // error.code = 404;
    // return next(error); // this will reach the next error handling middleware.
    return next(new HttpError("Could not find a place for the provided user id", 404));
  }
  res.json({ places });
};

// async is a keyword that tells javascript that this function will return a promise
// no more throw new Error() in async function
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors);
    // throw new HttpError("Invalid inputs passed, please check your data.", 422);
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description, address, creator } = req.body;

  // convert the address to coordinates
  // returns if the address is not valid
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // const title = req.body.title; 의 줄임말
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: "https://knowyourmeme.com/photos/1297938",
    creator,
  });

  try {
    // .save is a mongoose method that saves the data to the database
    // it returns a promise so we can use await here to wait for the promise to be resolved
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again.", 500);
    // next(error); // we should add this next(error) to stop our code from running
    // if we don't have error, the code execution would continue to the next line
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid; // pid is the name of the parameter {/:pid}

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) }; // copy the object
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId); // find the index of the object
  updatedPlace.title = title; // update the object
  updatedPlace.description = description; // update the object

  DUMMY_PLACES[placeIndex] = updatedPlace; // update the dummy data

  res.status(200).json({ place: updatedPlace }); // return the updated object
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  // function that throws an error if the placeId is not found
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Could not find a place for that id", 404);
  }

  console.log("placeId: ", placeId);
  // filter() returns a new array with the elements that pass the test implemented by the provided function.
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
