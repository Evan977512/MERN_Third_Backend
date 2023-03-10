// uuid package == generate unique id
const uuid = require("uuid");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

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
  res.json({ places: places.map((place) => place.toObject({ getters: true })) });
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

  // check if the user exists
  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError("Creating place failed, please try again.", 500);
    return next(err);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }
  console.log(user);

  try {
    // .save is a mongoose method that saves the data to the database
    // it returns a promise so we can use await here to wait for the promise to be resolved
    // await createdPlace.save();

    // mongoose transaction -> if one of the operation fails, the other operations will be rolled back
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });

    // need to push the place id to the user's places array
    // push() method does not return a promise, so we don't need to use await here
    // push() only adds the id to the array, not the whole place object
    user.places.push(createdPlace);
    await user.save({ session: sess });

    // if everything is successful, commit the transaction
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again.", 500);
    // next(error); // we should add this next(error) to stop our code from running
    // if we don't have error, the code execution would continue to the next line
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors);
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  // const title = req.body.title;
  const { title, description } = req.body;
  const placeId = req.params.pid; // pid is the name of the parameter {/:pid}

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError("Something went wrong, could not update place.", 500);
    return next(err);
  }

  place.title = title; // update the object
  place.description = description; // update the object

  // storing updates to DB == save() method
  try {
    await place.save();
  } catch (error) {
    // if the save() method fails
    const err = new HttpError("Something went wrong, could not update place.", 500);
    return next(err);
  }

  // toObject() method converts the mongoose object to a regular javascript object
  // getters: true means that we want to get the value of the virtual property
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  console.log("placeId: ", placeId);

  let place;
  try {
    // findById() is a mongoose method that returns a promise
    // populate() is a mongoose method that returns the whole object
    place = await Place.findById(placeId).populate("creator");
    // console.log("place: ", place);
  } catch (err) {
    const error = new HttpError("Something went wrong, could not delete place.", 500);
    return next(error);
  }

  // check if the place exists
  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });

    // access the creator of the place
    place.creator.places.pull(place);

    // save new creator data
    await place.creator.save({ session: sess });

    // if everything is successful, commit the transaction
    await sess.commitTransaction();
  } catch (err) {
    // throw err;
    const error = new HttpError("cannot remove the place... try again later.", 500);
    return next(error);
  }

  res.status(200).json({ message: "Delete place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
