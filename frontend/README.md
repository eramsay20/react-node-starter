# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


# FRONTEND Setup
Use the create-react-app command from inside your frontend folder to initialize React inside of the frontend folder:

```npx create-react-app . --use-npm```

In the frontend folder, npm install the following packages as dependencies:
- js-cookie - extracts cookies
- react-redux - React components and hooks for Redux
- react-router-dom - routing for React
- redux - Redux
- redux-thunk - add Redux thunk

``` npm i js-cookie react-redux react-router-dom redux redux-thunk```

npm install -D the following packages as dev-dependencies:
- redux-logger - log Redux actions in the browser's dev tools console

``` npm i -D redux-logger```


## Setting up the Redux Store
Make a folder in frontend/src called store and add an index.js file. In this file, import createStore, combineReducers, applyMiddleware, and compose from the redux package. Import thunk from redux-thunk. Create a rootReducer that calls combineReducers and pass in an empty object for now.

```JS
// frontend/src/store/index.js
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
    //...
});
```

Initialize an enhancer variable that will be set to different store enhancers depending on if the Node environment is in development or production. In production, the enhancer should only apply the thunk middleware.

In development, the logger middleware and Redux dev tools compose enhancer as well. To use these tools, create a logger variable that uses the default export of redux-logger. Then, grab the Redux dev tools compose enhancer with window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ and store it in a variable called composeEnhancers.

Then set the enhancer variable to the return of the composeEnhancers function passing in applyMiddleware invoked with thunk then logger.

```JS
// frontend/src/store/index.js
// ...

let enhancer;

if (process.env.NODE_ENV === 'production') {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require('redux-logger').default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}
```

Next, create a configureStore function that takes in an optional preloadedState. Return createStore invoked with the rootReducer, the preloadedState, and the enhancer.

```JS
// frontend/src/store/index.js
// ...

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
```


In your React application, import BrowserRouter from React Router, Provider from Redux, and the configureStore function your wrote. Create a variable to access your store and expose it to the window. It should not be exposed in production, be sure this is only set in development.

```JS
// frontend/src/index.js
// ...
const store = configureStore();

if (process.env.NODE_ENV !== 'production') {
  window.store = store;
}
```

Next, define a Root React functional component that returns the App component wrapped in Redux's Provider and React Router DOM's BrowserRouter provider components. Make sure to pass in the key of store with the value of store to the Provider. Pass Root to reactDOM.render instead of App. 

```JS
// frontend/src/index.js
// ...
function Root() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}
```

## Wrapping fetch requests with CSRF
First, you need to add a "proxy" in your frontend/package.json. Add a "proxy" key with the value of http://localhost:5000 or wherever you are serving your backend Express application.
``` "proxy": "http://localhost:5000" ```

Next, to make fetch requests with any HTTP verb other than GET, you need to set a XSRF-TOKEN header on the request and the value of the header should be set to the value of the XSRF-TOKEN cookie. Wrap the fetch function on the window that will be used in place of the default fetch function.

Add a csrf.js file in the frontend/src/store folder. Import Cookies from js-cookie that will be used to extract the XSRF-TOKEN cookie value. Define an async function called csrfFetch that will take in url parameter and an options parameter that defaults to an empty object. If options.headers is not set, default it to an empty object. If options.method is not set, set it to the GET method. If it is any method other than a GET method, set the XSRF-TOKEN header on the options object to the extracted value of the XSRF-TOKEN cookie. Call and await the window.fetch with the url and the options object to get the response. Export the custom csrfFetch function from this file.

``` JS
// frontend/src/store/csrf.js
import Cookies from 'js-cookie';

export async function csrfFetch(url, options = {}) {
  // set options.method to 'GET' if there is no method
  options.method = options.method || 'GET';
  // set options.headers to an empty object if there is no headers
  options.headers = options.headers || {};

  // if the options.method is not 'GET', then set the "Content-Type" header to
    // "application/json", and set the "XSRF-TOKEN" header to the value of the 
    // "XSRF-TOKEN" cookie
  if (options.method.toUpperCase() !== 'GET') {
    options.headers['Content-Type'] =
      options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }
  // call the default window's fetch with the url and the options passed in
  const res = await window.fetch(url, options);

  // if the response status code is 400 or above, then throw an error with the
    // error being the response
  if (res.status >= 400) throw res;

  // if the response status code is under 400, then return the response to the
    // next promise chain
  return res;
}
```

In production, the XSRF-TOKEN will be attached to the index.html file in the frontend/build folder. In the backend/routes/index.js file, serve the index.html file at the / route and any routes that don't start with /api. Along with it, attach the XSRF-TOKEN cookie to the response. Serve the static files in the frontend/build folder using the express.static middleware.

```JS
// backend/routes/index.js
// ... after `router.use('/api', apiRouter);`

// Static routes
// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  // Serve the frontend's index.html file at the root route
  router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });

  // Serve the static assets in the frontend's build folder
  router.use(express.static(path.resolve("../frontend/build")));

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });
}

```

In development, you need another way to get the XSRF-TOKEN cookie on your frontend application because the React frontend is on a different server than the Express backend. To solve this, add a backend route, GET /api/csrf/restore in the same file that can be accessed only in development and will restore the XSRF-TOKEN cookie.

``` JS
// backend/routes/index.js
// ...

// Add a XSRF-TOKEN cookie in development
if (process.env.NODE_ENV !== 'production') {
  router.get('/api/csrf/restore', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.json({});
  });
}

// ...
```

Back in the React frontend, this GET /api/csrf/restore route needs to be called when the application is loaded. Define and export a function called restoreCSRF in the frontend/src/store/csrf.js that will call the custom csrfFetch function with /api/csrf/restore as the url parameter.

```JS
// frontend/src/store/csrf.js
// ...

// call this to get the "XSRF-TOKEN" cookie, should only be used in development
export function restoreCSRF() {
  return csrfFetch('/api/csrf/restore');
}
```

In the frontend entry file (frontend/src/index.js), call the restoreCSRF function when in development before defining the Root functional component. Also, attach the custom csrfFetch function onto the window when in development as window.csrfFetch.

Test, commit and complete!


## Login Page Setup