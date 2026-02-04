import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { 
    createExpense, 
    getAllExpenses, 
    updateExpense, 
    deleteExpense,
    addTransaction 
} from "../controllers/expense.controller.js";

const router = express.Router();

router.get("/", protect, getAllExpenses);
router.post("/", protect, createExpense);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);
router.post("/:expenseId/transaction", protect, addTransaction);

export default router;