require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = "mongodb://localhost:27017";

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to local MongoDB using Compass");
  } catch (err) {
    throw new Error(`❌ Could not connect to MongoDB: ${err}`);
  }
};

module.exports = connectDB;
