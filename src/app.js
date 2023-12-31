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

// Serve static files from the "views" directory
app.use(express.static('views'));

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
// CDN CSS
const CSS_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { customCssUrl: CSS_URL })
);

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

const usersRoute = require('./routes/users');
const applicationsRoute = require('./routes/applications');
const eventsRoute = require('./routes/events');
const reportsRoute = require('./routes/reports');

app.get('/', (req, res) => {
  res.sendFile('public/index.html');
});

app.use('/api/v1/applications/', applicationsRoute);
app.use('/api/v1/events/', eventsRoute);
app.use('/api/v1/reports/', reportsRoute);
app.use('/api/v1/users/', usersRoute);

const PORT = process.env.NODE_LOCAL_PORT || 3000;
app.listen(PORT, () => {
  debug(`Server started on port ${PORT}`);
});
