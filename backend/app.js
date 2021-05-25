const express = require('express'); // server
const morgan = require('morgan');   // req/res server logging tool
const cors = require('cors');       // enable cross origin protection/sharing
const csurf = require('csurf');     // security tokens for requests
const helmet = require('helmet');   //security mw
const cookieParser = require('cookie-parser'); // parses cookies from requests

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


app.use(routes); // Connect all the routes


// export the app
module.exports = app;