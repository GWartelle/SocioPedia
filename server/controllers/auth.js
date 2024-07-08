import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { deleteImageFromS3 } from "./aws.js";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const picturePath = req.file.location;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does nto exist." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* DELETE USER */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user in the database and get their profile picture URL
    const user = await User.findById(userId);
    const profilePictureUrl = user.picturePath;

    // Delete the user's profile picture from the bucket
    await deleteImageFromS3(profilePictureUrl);

    // Get the user's posts and their image URLs
    const posts = await Post.find({ userId });
    const imageUrls = posts.map((post) => post.picturePath);

    // Delete the posts images from the bucket
    for (const imageUrl of imageUrls) {
      if (imageUrl) {
        await deleteImageFromS3(imageUrl);
      }
    }

    // Delete the user's posts
    await Post.deleteMany({ userId });

    // Delete the user from other users' friend list
    await User.updateMany({}, { $pull: { friends: userId } }, { multi: true });

    // Delete the user from the database
    await User.findByIdAndDelete(userId);

    res.status(200).json({ msg: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
