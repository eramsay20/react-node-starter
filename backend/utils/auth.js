const jwt = require('jsonwebtoken');

const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;


// ------- USER AUTH MIDDLEWARE -------- // 
// sends a JWT cookie after a user is logged in or signed up
const setTokenCookie = (res, user) => {
    
    const token = jwt.sign( // Create the token.
        { data: user.toSafeObject() }, // only stores JWT safe info on the token
        secret,
        { expiresIn: parseInt(expiresIn) }, // 604,800 seconds = 1 week
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set the token cookie
    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // maxAge in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax",
    });

    return token;
};


// restores the session user based on the contents of the JWT cookie; vital for auth-required routes
const restoreUser = (req, res, next) => {
    const { token } = req.cookies; // token parsed from cookies

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) return next(); // if error, skip and continue

        try {
            const { id } = jwtPayload.data; // grab user id from JWT
            req.user = await User.scope('currentUser').findByPk(id); // find and add user to req
        } catch (e) {
            res.clearCookie('token'); // if err, clear the token cookie from the response
            return next();
        }

        if (!req.user) res.clearCookie('token'); // if err, clear the token cookie from the response
        return next();
    });
};


// requiring a session user to be authenticated before accessing a route
const requireAuth = [
    restoreUser, // ensures restoreUser is run first to confirm userAuth
    function (req, res, next) {
        if (req.user) return next(); // if valid user exists, continue

        // else, create an unauth error and pass to handlers
        const err = new Error('Unauthorized');
        err.title = 'Unauthorized';
        err.errors = ['Unauthorized'];
        err.status = 401;
        return next(err);
    },
];


// export for use elsewhere
module.exports = { setTokenCookie, restoreUser, requireAuth };