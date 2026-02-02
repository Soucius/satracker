import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.post("/", createUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;