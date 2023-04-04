const axios = require("axios");

const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyDgLmMpKCzveJf1_yuA0fUzzhy0WRChvZA";

async function getCoordsForAddress(address) {
  // return {
  //   lat: 40.7484474,
  //   lng: -73.9871516
  // };

  // axios is a promise based HTTP client for the browser and node.js
  // it is a package for sending Http requests from frontend to backend
  // but we can also use it to send requests from backend to backend or from backend to another bacakend server.
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  );

  const data = response.data;
  // console.log("DATA: ", data);

  // if there is no data or the status is ZERO_RESULTS
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError("Could not find location for the specified address.", 422);
    throw error;
  }
  // returns an object with lat and lng
  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;
