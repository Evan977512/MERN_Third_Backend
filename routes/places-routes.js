const express = require("express");
const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);
/**
 * express-validator is a middleware that can be used to validate the incoming request data.
 * post, patch request body에 대한 validation을 위해 사용한다.
 * you can implement multiple validation rules for a single field.
 */
router.post(
  "/",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 }), check("address").not().isEmpty()],
  placesControllers.createPlace
);

// patch is for updating a resource
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

// how to link to App.js??
module.exports = router;
