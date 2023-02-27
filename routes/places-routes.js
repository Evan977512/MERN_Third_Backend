const express = require('express');

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.post('/', placesControllers.createPlace);

// patch is for updating a resource
router.patch('/:pid', placesControllers.updatePlaceById);

router.delete('/:pid', placesControllers.deletePlaceById);

// how to link to App.js??
module.exports = router;
