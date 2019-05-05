'use strict';
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

// Connect to mongoDB using async/await
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true
    });
  } catch (err) {
    console.error(err.message);
    // Exit during failure
    process.exit(1);
  }
};

module.exports = connectDB;
