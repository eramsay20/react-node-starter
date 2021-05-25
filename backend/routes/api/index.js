const router = require('express').Router(); // create a router instance

router.post('/test', (req, res) => {
    res.json({ requestBody: req.body })
})
/*
Test this route by navigating to the other test route, http://localhost:5000/hello/world, and creating a fetch request in the browser's development tools console. Make a request to /api/test with the POST method, a body of { hello: 'world' }, a "Content-Type" header, and an XSRF-TOKEN header with the value of the XSRF-TOKEN cookie. After the response gets back to the browser, parse the JSON response body and print it out.

Here's an example full fetch request with response handling:
```
fetch('/api/test', {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<INSERT VALUE OF XSRF-TOKEN COOKIE IN BROWSER>`
  },
  body: JSON.stringify({ hello: 'world' })
}).then(res => res.json()).then(data => console.log(data));
```
*/

module.exports = router; // export router
