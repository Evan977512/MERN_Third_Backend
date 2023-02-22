const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

app.use('/api/places', placesRoutes); // => /api/places/...만 되도록 설정해보자

// create middleware function, default error handler
// Express will apply on every incoming request
// 4params is recognized as a special middleware function
// only executed on the requests that have an error
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    // || => if 'error.code' is false it returns 500
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred' });
});

app.listen(5001);
