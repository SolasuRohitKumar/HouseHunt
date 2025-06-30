const mongoose = require("mongoose");

const userModel = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    set: function (value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  userType: {
    type: String,
    required: [true, "User type is required"], // Matches frontend dropdown
    enum: ["Renter", "Owner"], // Optional: restrict values
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  strict: true,     // Rejects unknown fields
});

const userSchema = mongoose.model("user", userModel);

module.exports = userSchema;
