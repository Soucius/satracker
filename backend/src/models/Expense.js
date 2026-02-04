import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['expense', 'refund'],
        required: true 
    },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});

const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    totalAmount: { type: Number, default: 0 }, 
    transactions: [transactionSchema] 
}, { timestamps: true });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;