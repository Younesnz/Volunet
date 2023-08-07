require('dotenv').config('../.env');
const express = require('express');

const app = express();
const debug = require('debug')('app:server');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB
require('./db')();

const usersRoute = require('./routes/users');
const applicationsRoute = require('./routes/applications');
const eventsRoute = require('./routes/events');
const reportsRoute = require('./routes/reports');

app.use('/api/v1/users/', usersRoute);
app.use('/api/v1/applications/', applicationsRoute);
app.use('/api/v1/events/', eventsRoute);
app.use('/api/v1/reports/', reportsRoute);

const PORT = process.env.NODE_LOCAL_PORT || 3000;
app.listen(PORT, () => {
  debug(`Server started on port ${PORT}`);
});
