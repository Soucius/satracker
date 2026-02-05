import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Customer", 
        required: true 
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    ralCode: { type: String, default: "Standart" },
    glassColor: { 
        type: String, 
        enum: ['clear', 'smoked'],
        default: 'clear' 
    },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {
        type: String,
        enum: [
            "received",
            "production",
            "assembly",
            "packaging",
            "ready",
            "installed",
            "cancelled"
        ],
        default: 'received'
    },
    description: { type: String }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;