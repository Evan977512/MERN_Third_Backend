const express = require('express');

const usersController = require('../controllers/users-controllers');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post('/signup', usersController.signup);
router.post('/login', usersController.login);

// how to link to App.js??
module.exports = router;
