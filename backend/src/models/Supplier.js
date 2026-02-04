import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ["debt", "payment"],
        required: true 
    },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    taxOffice: { type: String },
    taxNumber: { type: String },
    currentBalance: { type: Number, default: 0 }, 
    transactions: [transactionSchema] 
}, { timestamps: true });

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;