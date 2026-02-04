import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { 
    createSupplier, 
    getAllSuppliers, 
    updateSupplier, 
    deleteSupplier,
    addTransaction 
} from "../controllers/supplier.controller.js";

const router = express.Router();

router.get("/", protect, getAllSuppliers);
router.post("/", protect, createSupplier);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, deleteSupplier);
router.post("/:supplierId/transaction", protect, addTransaction);

export default router;