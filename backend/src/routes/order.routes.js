import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { 
    createOrder, 
    getAllOrders, 
    updateOrderStatus, 
    deleteOrder,
    updateOrder
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", protect, getAllOrders);
router.post("/", protect, createOrder);
router.put("/:id", protect, updateOrder);
router.patch("/:id/status", protect, updateOrderStatus);
router.delete("/:id", protect, deleteOrder);

export default router;