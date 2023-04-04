const mongoose = require("mongoose");
// to make sure that each piece of information we add to the database is unique.
// This helps us avoid mistakes and keep our information organized.
// const uniqueValidator = require("mongoose-unique-validator");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  // "Place" -> the name of PlaceSchema
  // [] -> User can have multiple places so we use an array
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

userSchema.plugin(uniqueValidator);

// "User" defines the name of the collection
module.exports = mongoose.model("User", userSchema);
