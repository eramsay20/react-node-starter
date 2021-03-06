const express = require('express')
const asyncHandler = require('express-async-handler'); // used to wrap routes with custom mws

const { check } = require('express-validator'); // used to validate req body
const { handleValidationErrors } = require('../../utils/validation'); // used to validate req body
const { setTokenCookie, restoreUser } = require('../../utils/auth'); // get user auth functions
const { User } = require('../../db/models'); // get User table

const router = express.Router();

// validates credential inputs before handling possible errors
const validateLogin = [
    check('credential')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Please provide a valid email or username.'),
    check('password')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a password.'),
    handleValidationErrors,
];

// Restore session user
router.get('/', restoreUser, (req, res) => {
        const { user } = req;
        if (user) {
            return res.json({ user: user.toSafeObject() }); // if user, return safe user obj
        } else return res.json({}); // else return empty obj
    }
);

// Log in
router.post('/', validateLogin, asyncHandler(async (req, res, next) => {
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
        return res.json({ user });
    }),
);

// Log out
router.delete('/', (_req, res) => {
        res.clearCookie('token');
        return res.json({ message: 'success' });
    }
);

module.exports = router;