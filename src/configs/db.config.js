const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.log(err.message);
    });
};

// Exports
module.exports = connectDB;
