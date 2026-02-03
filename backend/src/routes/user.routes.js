import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { createUser, deleteUser, forgotPassword, getAllUsers, getUserById, login, resetPassword, updateUser, verifyOtp } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.post("/", createUser);
router.post("/signin", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;