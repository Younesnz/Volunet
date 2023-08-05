require('dotenv').config('../.env');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('./middleware/googleAuth');

const app = express();
const debug = require('debug')('app:server');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS as view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

const swaggerDefinitions = require('./swaggerDefinitions');
// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Volunet API',
      version: '1.0.0',
      description: 'API Documentation for Volunet',
    },
    components: {
      schemas: swaggerDefinitions,
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(
  session({
    secret: 'somesecretkey_thats_in_env_file', // process.env.SESSION_SECRET
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize DB
require('./db')();

const applicationsRoute = require('./routes/applications');
const eventsRoute = require('./routes/events');
const reportsRoute = require('./routes/reports');
const usersRoute = require('./routes/users');

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/api/v1/applications/', applicationsRoute);
app.use('/api/v1/events/', eventsRoute);
app.use('/api/v1/reports/', reportsRoute);
app.use('/api/v1/users/', usersRoute);

const PORT = process.env.NODE_LOCAL_PORT || 3000;
app.listen(PORT, () => {
  debug(`Server started on port ${PORT}`);
});
