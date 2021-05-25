# react-node-starter
javascript stack project starter (react / redux / node / express / sequelize)

# Folder Setup
- create backend and frontend folders
- add .gitignore file and add...
    node_modules
    .env
    build
    .DS_Store


# Install Backend Dependencies
CD into the backend folder and initialize the server's package.json by running npm init -y.

Then npm install the following packages as dependencies:

- bcryptjs - password hashing
- cookie-parser - parsing cookies from requests
- cors - CORS
- csurf - CSRF protection
- dotenv - load environment variables into Node.js from a .env file
- express - Express
- express-async-handler - handling async route handlers
- express-validator - validation of request bodies
- faker - random seeding library
- helmet - security middleware
- jsonwebtoken - JWT
- morgan - logging information about server requests/responses
- per-env - use environment variables for starting app differently
- pg@">=8.4.1" - PostgresQL greater or equal to version 8.4.1
- sequelize@5 - Sequelize
- sequelize-cli@5 - use sequelize in the command line

npm install -D the following packages as dev-dependencies:
- dotenv-cli - use dotenv in the command line
- nodemon - hot reload server backend files

# Config Backend
In the backend folder, create a .env file that will be used to define your environment variables.

Populate the .env file based on the example below:
```
PORT=5000
DB_USERNAME=auth_app
DB_PASSWORD=«auth_app user password»
DB_DATABASE=auth_db
DB_HOST=localhost
JWT_SECRET=«generate_strong_secret_here»
JWT_EXPIRES_IN=604800
```

Assign PORT to 5000, add a user password and a strong JWT secret.

Recommendation to genereate a strong secret: create a random string using openssl (a library that should be installed in your Ubuntu/MacOS shell already). Run openssl rand -base64 10 to generate a random JWT secret.

Next, you will create a js configuration file that will read the environment variables loaded and export them.

Add a folder called config in your backend folder. Inside of the folder, create an index.js file with the following contents:
```JS
// backend/config/index.js
module.exports = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
  },
  jwtConfig: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
};
```


# Sequelize Setup
You will setup Sequelize to look in the backend/config/database.js file for its database configurations. You will also setup the backend/db folder to contain all the files for models, seeders, and migrations.

To do this, create a .sequelizerc file in the backend folder with the following contents:
```JS
// backend/.sequelizerc
const path = require('path');

module.exports = {
  config: path.resolve('config', 'database.js'),
  'models-path': path.resolve('db', 'models'),
  'seeders-path': path.resolve('db', 'seeders'),
  'migrations-path': path.resolve('db', 'migrations'),
};
```

Initialize Sequelize to the db folder by running:
```
npx sequelize init
```

Replace the contents of the newly created backend/config/database.js file with the following:
```JS
// backend/config/database.js
const config = require('./index');

const db = config.db;
const username = db.username;
const password = db.password;
const database = db.database;
const host = db.host;

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    dialect: 'postgres',
    seederStorage: 'sequelize',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    seederStorage: 'sequelize',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
```
This will allow you to use the database configuration loaded from the .env file into config/index.js.


# Creating a local database
Create a user using the same credentials in the .env file with the ability to create databases:
```psql -c "CREATE USER <username> PASSWORD '<password>' CREATEDB"```

Finally, create the database using sequelize-cli:
```npx dotenv sequelize db:create```

Remember, any sequelize db: commands need to be prefixed with dotenv to load the database configuration environment variables from the .env file.


# Express Setup
Create a file called app.js in the backend folder. Here you will initialize your Express application.

At the top of the file, import the following packages:
```JS
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
```

Create a variable called isProduction that will be true if the environment is in production or not by checking the environment key in the configuration file (backend/config/index.js).

```JS
const { environment } = require('./config');
const isProduction = environment === 'production';
```

Initialize the Express application:
```JS
const app = express();
```

Connect the morgan middleware for logging information about requests and responses:
```JS
app.use(morgan('dev'));
```

Add the cookie-parser middleware for parsing cookies and the express.json middleware for parsing JSON bodies of requests with Content-Type of "application/json".
```JS
app.use(cookieParser());
app.use(express.json());
```

Add several security middlewares:
```JS
// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}
// helmet helps set a variety of headers to better secure your app
app.use(helmet({
  contentSecurityPolicy: false
}));

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
```

# Add Routes
Create a folder called routes in your backend folder. All your routes will live in this folder.

Create an index.js file in the routes folder. In this file, create an Express router, create a test route, and export the router at the bottom of the file like below:
```JS
// backend/routes/index.js
const express = require('express');
const router = express.Router();

router.get('/hello/world', function(req, res) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.send('Hello World!');
});

module.exports = router;
```


# Setup Server
Create a folder in backend called bin. Inside of it, add a file called www with the following contents:
```
#!/usr/bin/env node
// backend/bin/www
const { port } = require('../config');

const app = require('../app');
const db = require('../db/models');

// Check the database connection before starting the app
db.sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection success! Sequelize is ready to use...');

    // Start listening for connections
    app.listen(port, () => console.log(`Listening on port ${port}...`));
  })
  .catch((err) => {
    console.log('Database connection failure.');
    console.error(err);
  });
  ```

  # Test the Server
  In your package.json, add the following scripts:

  ```
   "scripts": {
    "sequelize": "sequelize",
    "sequelize-cli": "sequelize-cli",
    "start": "per-env",
    "start:development": "nodemon -r dotenv/config ./bin/www",
    "start:production": "node ./bin/www"
  }
  ```
npm start will run the /bin/www in nodemon when started in the development environment with the environment variables in the .env file loaded, or in node when started in production.

Run 'npm start' in the backend folder to start your server on the port defined in the .env file, which should be 5000.

Navigate to the test route at http://localhost:5000/hello/world. There, you should see the text Hello World!. Take a look at your cookies. Delete all the cookies to make sure there are no lingering cookies from other projects, then refresh the page. You should still see the text Hello World! on the page and two cookies, one called _csrf and the other called XSRF-TOKEN.

If you don't see this, then check your backend server logs in your terminal where you ran npm start. Then check your routes.


# Add & Test API Routers
Get started by nesting an api folder in your routes folder. Add an index.js file in the api folder with the following contents:
```JS
// backend/routes/api/index.js
const router = require('express').Router();

module.exports = router;
```

Import this file into the routes/index.js file and connect it to the router there:
```JS
// backend/routes/index.js
// ...
const apiRouter = require('./api');

router.use('/api', apiRouter);
// ...
```

Make sure to test this set up by creating the following test route in the api router:
```JS
// backend/routes/api/index.js
// ...

router.post('/test', function(req, res) {
  res.json({ requestBody: req.body });
});

// ...
```

# Add Error Handling 
After connecting the routes to app.js, add the following error handling middleware functions

```JS
// Catch unhandled requests that don't match any routes defined and pass to error handler.
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = ["The requested resource couldn't be found."];
    err.status = 404;
    next(err);
});

// Catches Sequelize errors and formats them to look pretty before sending the error response
app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error:
    if (err instanceof ValidationError) {
        err.errors = err.errors.map((e) => e.message);
        err.title = 'Validation error';
    }
    next(err);
});

// formats all the errors before returning a JSON response
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
```

You can't really test the Sequelize error handler now because you have no Sequelize models to test it with, but you can test the Resource Not Found error handler and the Error Formatter error handler.

To do this, try to access a route that hasn't been defined in your routes folder yet, like http://localhost:5000/not-found


# Add User Authentication

Create a basic Users table based off the following schema:
<table><thead><tr><th style="text-align: left;">column name</th><th style="text-align: center;">data type</th><th style="text-align: left;">constraints</th></tr></thead><tbody><tr><td style="text-align: left;"><code class="sc-cMljjf gHCMgC">id</code></td><td style="text-align: center;">integer</td><td style="text-align: left;">not null, primary key</td></tr><tr><td style="text-align: left;"><code class="sc-cMljjf gHCMgC">username</code></td><td style="text-align: center;">string</td><td style="text-align: left;">not null, indexed, unique, max 30 characters</td></tr><tr><td style="text-align: left;"><code class="sc-cMljjf gHCMgC">email</code></td><td style="text-align: center;">string</td><td style="text-align: left;">not null, indexed, unique, max 256 characters</td></tr><tr><td style="text-align: left;"><code class="sc-cMljjf gHCMgC">hashedPassword</code></td><td style="text-align: center;">binary string</td><td style="text-align: left;">not null</td></tr><tr><td style="text-align: left;"><code class="sc-cMljjf gHCMgC">createdAt</code></td><td style="text-align: center;">datetime</td><td style="text-align: left;">not null, default value of now()</td></tr><tr><td style="text-align: left;"><code class="sc-cMljjf gHCMgC">updatedAt</code></td><td style="text-align: center;">datetime</td><td style="text-align: left;">not null, default value of now()</td></tr></tbody></table>

First generate a migrate and model file with the following command while cd'd into the backend folder: 
```npx sequelize model:generate --name User --attributes 'username:STRING, email:STRING,hashedPassword:STRING```

This will create a file in your backend/db/migrations folder and a file called user.js in your backend/db/models folder. In the migration file, apply the constraints from the above schema. 

Next, migrate the Users table by running the following command:
```npx dotenv sequelize db:migrate```

If you encounter errors and need to undo the migrations, run:
```npx dotenv sequelize db:migrate:undo```

# Add Model Level Constraints ( OPTIONAL )
DOCS: https://sequelize.org/master/manual/validations-and-constraints.html
See 'backend > models > user.js' for sample code on how to add model level constraints


# Add User Seed Data
Generate a users seeder file for the demo user with the following command:
```npx sequelize seed:generate --name demo-user```

In the seeder file, create a demo user with an email, username, and hashedPassword fields. For the down function, delete the user with the username or email of the demo user.

After you finish creating your demo user seed file, migrate the seed file by running the following command:
```npx dotenv sequelize db:seed:all```

If there is no error in seeding but you want to change the seed file, remember to undo the seed first, change the file, then seed again.
```npx dotenv sequelize db:seed:undo:all```

# Add Model Scopes to Limit Frontend Access of User Info ( OPTIONAL )
To ensure that a user's information like their hashedPassword doesn't get sent to the frontend, you should define User model scopes.

DOCS: https://sequelize.org/master/manual/scopes.html
See 'backend > models > user.js' for sample code on how to add scope constraints


# Add User Methods
- toSafeObject: return jwt safe user obj excluding sensitive user info
- validatePassword: check hashedPW to validate sign in
- getCurrentUserById: get frontend safe user obj after sign in
- login: log in a user
- signup: create a new user

See 'backend > models > user.js' for sample code adding user methods to the model


# Add User Auth Middlewares
Create a folder called utils in your backend folder. Add a file named auth.js to store the auth helper functions.
```JS
// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;
```

Next add middleware auth functions for ...
- setTokenCookie: sets the JWT cookie after a user is logged in / signed up
- restoreUser: restore the session user based on the contents of the JWT cookie 
- requireUser: requiring a session user to be authenticated before accessing a route

Lastly, export these functions from auth.js for use elsewhere. See 'backend > utils > auth.js' for full middleware function code and notes. 


# Setup User Auth Route Structure
Create a file called session.js in the routes > api folder. Create and export an Express router from this file.

Next, create a file called users.js in the routes > api folder. Create and export an Express router from this file.

Connect all the routes exported from these two files in the index.js file nested in the backend/routes/api folder:
```JS
// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');

router.use('/session', sessionRouter);
router.use('/users', usersRouter);

module.exports = router;
```

# Add User Login API Route
In the API > session.js file, import the following: 
```JS
const express = require('express');
const asyncHandler = require('express-async-handler');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();
```

Next, add the POST /api/session route to the router:
```JS
// Log in
// ...
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
// ...
```

# Add User Logout Route
Create a DELETE /api/session logout route to remove the token cookie from the response and return a JSON success message:
```JS
// backend/routes/api/session.js
// ...

// Log out
router.delete('/', (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
  }
);

// ...
```