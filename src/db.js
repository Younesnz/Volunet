const debug = require('debug')('app:db');
const mongoose = require('mongoose');

module.exports = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => debug('MongoDB Connected...'))
    .catch((err) => debug(`ERROR connecting to MongoDB: ${err.message}`));

  mongoose.connection.on('connected', () => debug('Mongoose connected to db'));

  mongoose.connection.on('error', (err) =>
    debug(`ERROR connecting Mongoose: ${err.message}`)
  );

  mongoose.connection.on('disconnected', () =>
    debug('Mongoose is disconnected...')
  );
};
