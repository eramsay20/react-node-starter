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


# Add API Routes
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