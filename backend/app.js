const express = require('express'); // server
const morgan = require('morgan');   // req/res server logging tool
const cors = require('cors');       // enable cross origin protection/sharing
const csurf = require('csurf');     // security tokens for requests
const helmet = require('helmet');   //security mw
const cookieParser = require('cookie-parser'); // parses cookies from requests
const { ValidationError } = require('sequelize');

const routes = require('./routes'); // import routes
const { environment } = require('./config'); // grab env variables from config file
const isProduction = environment === 'production'; // create variable to be true if in prod


const app = express(); // init Express app


// ------ LOGGING & PARSING MIDDLEWARE ------- //
app.use(morgan('dev')); // Connect morgan mw for logging information about req/res
app.use(cookieParser()); // add mw for parsing cookies
app.use(express.json()); // add mw for parsing JSON bodies with Content-Type of 'application/json'


// ------ SECURITY MIDDLEWARE ------  // 
// enable cors only in development since frontend/backend servers will be run on diff ports
if (!isProduction) app.use(cors()); 

// helmet helps set a variety of headers to better secure your app
app.use(helmet({ contentSecurityPolicy: false }));

// add the csurf middleware and configure it to use cookies
    // i.e. sets the _csrf token and create req.csrfToken method
app.use(
    csurf({
        cookie: {
            secure: isProduction,
            sameSite: isProduction && "Lax",
            httpOnly: true,
        },
    })
);


// ------ ROUTES ------- //
// Connect all the routes
app.use(routes); 


// ------- ERROR HANDLING -------- // 
// Catch unhandled requests that don't match any of the routes defined and forward to error handler.
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = ["The requested resource couldn't be found."];
    err.status = 404;
    next(err);
});

// Catch Sequelize errors and format it to look pretty before sending the error response
app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error:
    if (err instanceof ValidationError) {
        err.errors = err.errors.map((e) => e.message);
        err.title = 'Validation error';
    }
    next(err);
});

// formatting all the errors before returning a JSON response
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack,
    });
});



// export the app
module.exports = app;