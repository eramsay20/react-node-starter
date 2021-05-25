const express = require('express');

const apiRouter = require('./api'); // grab api routes from api folder

const router = express.Router(); // create an express router instance

router.use('/api', apiRouter); // funnel handling of api routes


// create a test route
router.get('/hello/world', function (req, res) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.send('Hello World!');
});
// In this test route, you are setting a cookie on the response with the name of XSRF - TOKEN to the value of the req.csrfToken method's return. Then, you are sending the text, Hello World! as the response's body.


// export the router
module.exports = router;