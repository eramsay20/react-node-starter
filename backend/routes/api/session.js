const express = require('express')
const asyncHandler = require('express-async-handler'); // used to wrap routes with custom mws

const { setTokenCookie, restoreUser } = require('../../utils/auth'); // get user auth functions
const { User } = require('../../db/models'); // get User table

const router = express.Router();

// Log in
router.post('/', asyncHandler(async (req, res, next) => {
        const { credential, password } = req.body; // get info from req
        const user = await User.login({ credential, password }); // validate

        if (!user) {
            const err = new Error('Login failed');
            err.status = 401;
            err.title = 'Login failed';
            err.errors = ['The provided credentials were invalid.'];
            return next(err);
        }

        await setTokenCookie(res, user); // if valid, set current user token
        return res.json({ // return the user
            user,
        });
    }),
);

module.exports = router;