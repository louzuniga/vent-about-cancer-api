const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

mongoose.Promise = global.Promise;

// Connect to mongoDB using async/await
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit during failure
    process.exit(1);
  }
};

module.exports.CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || 'http://localhost:5000';

module.exports = connectDB;
