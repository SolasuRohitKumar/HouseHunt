const User = require('../schemas/userModel');
const Property = require('../schemas/propertyModel'); // Assuming you have this schema for getAllProperties
const Booking = require('../schemas/bookingModel'); // Assuming you have this schema for bookingHandleController and getAllBookingsController
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Assuming you use JWT for authController and loginController

// Placeholder for a JWT secret, replace with an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "yourSuperSecretJwtKey";

const registerController = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      userType,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (err) {
    console.error("❌ Error in registerController:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found", success: false });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid credentials", success: false });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: '1d' });

    // Send success response with token and user data
    return res.status(200).send({
      message: "Login successful",
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("❌ Error in loginController:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

const forgotPasswordController = async (req, res) => {
  // TODO: Implement forgot password logic (e.g., send reset email)
  console.log("Forgot password requested for:", req.body.email);
  return res.status(200).json({
    message: "Forgot password functionality is not yet implemented. Check console for details.",
    success: true,
  });
};

const authController = async (req, res) => {
  try {
    // The authMiddleware should have attached user data to req.body.userId or req.user
    const user = await User.findById(req.body.userId); // Assuming userId is passed from authMiddleware
    if (!user) {
      return res.status(404).send({ message: "User not found", success: false });
    }
    return res.status(200).send({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("❌ Error in authController:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

const getAllPropertiesController = async (req, res) => {
  try {
    // Logic to get all available properties for renters
    const properties = await Property.find({ isAvailable: 'Available' }); // Fetch only available properties
    return res.status(200).send({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("❌ Error in getAllPropertiesController:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

const bookingHandleController = async (req, res) => {
  const { propertyid } = req.params;
  const { userId, startDate, endDate, message } = req.body; // Assuming userId is from authMiddleware, and other details from request body

  try {
    // Check if property exists and is available
    const property = await Property.findById(propertyid);
    if (!property || property.isAvailable === 'Unavailable') {
      return res.status(400).send({ success: false, message: "Property not available or not found." });
    }

    // Create new booking
    const newBooking = new Booking({
      propertyId: propertyid,
      renterId: userId, // The user making the booking
      ownerID: property.ownerId, // The owner of the property
      startDate,
      endDate,
      message,
      bookingStatus: 'pending', // Initial status
      propertyName: property.propertyName, // Store property name for easier display
      propertyImage: property.propertyImage[0]?.path, // Store first image path
      rent: property.rent // Store rent
    });
    await newBooking.save();

    // Optionally, mark property as unavailable immediately or after approval
    // For now, let's keep it 'Available' until owner accepts booking
    // await Property.findByIdAndUpdate(propertyid, { isAvailable: 'Unavailable' });

    return res.status(201).send({
      success: true,
      message: "Booking request sent successfully. Waiting for owner's approval.",
    });

  } catch (error) {
    console.error("❌ Error in bookingHandleController:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

const getAllBookingsController = async (req, res) => {
  // This controller is likely for a renter to see their own bookings
  const { userId } = req.body; // Assuming userId is passed from authMiddleware
  try {
    const bookings = await Booking.find({ renterId: userId });
    return res.status(200).send({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error in getAllBookingsController (user):", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  authController,
  getAllPropertiesController,
  bookingHandleController,
  getAllBookingsController,
};
