import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../libs/env.js";
import User from "../models/User.js";

const generateToken = (id) => {
    return jwt.sign({ id }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });
};

export async function getAllUsers(_, res) {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fething user by ID: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function createUser(req, res) {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({
            username,
            email,
            password
        });

        const savedUser = await newUser.save();
        const token = generateToken(savedUser._id);

        res.status(201).json({ token, user: savedUser });
    } catch (error) {
        console.error("Error creating user: ", error);

        if (error.code === 11000) {
            return res.status(400).json({ message: "Username or email already exists" });
        }
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateUser(req, res) {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        if (updateData.password !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteUser(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.status(200).json({ token, user: {
            id: user._id,
            username: user.username,
            email: user.email
        } });
    } catch (error) {
        console.error("Error logging in user: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}