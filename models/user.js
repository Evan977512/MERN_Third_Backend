const mongoose = require("mongoose");
// to make sure that each piece of information we add to the database is unique.
// This helps us avoid mistakes and keep our information organized.
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // "unique" enhaces the performance of the database
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true }, // we will fix it later more dynamically
});

// userSchema.plugin(uniqueValidator);

// "User" defines the name of the collection
module.exports = mongoose.model("User", userSchema);
