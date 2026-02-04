import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { 
    createCustomer, 
    getAllCustomers, 
    updateCustomer, 
    deleteCustomer,
    addTransaction 
} from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/", protect, getAllCustomers);
router.post("/", protect, createCustomer);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);
router.post("/:customerId/transaction", protect, addTransaction);

export default router;