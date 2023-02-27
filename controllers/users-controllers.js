const uuid = require('uuid');

const HttpError = require('../models/http-error');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Evan Kim',
        email: 'test@example.com',
        password: 'password',
    },
];

const getUsers = (req, res, next) => {
    res.status(200).json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
    console.log(req.body);
    const { name, email, password } = req.body;

    // check if the user email is already registered
    const hasUser = DUMMY_USERS.find((u) => u.email === email);
    console.log('hasUser: ', hasUser);
    if (hasUser) {
        // 422 == invalid user input
        throw new HttpError('Could not create user, email already in use', 422);
    }

    const createdUser = {
        id: uuid.v4(),
        name /** name = name */,
        email,
        password,
    };

    DUMMY_USERS.push(createdUser);
    // status 201 means success
    res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
    // post request has body and headers
    const { email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

    // validate email and password
    if (!identifiedUser || identifiedUser.password !== password) {
        // 401 means that authentication failed
        throw new HttpError('Could not find user, credentials not available', 401);
    }

    res.json({ message: 'Logged in!!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
