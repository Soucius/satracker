import Order from "../models/Order.js";

export async function getAllOrders(_, res) {
    try {
        const orders = await Order.find()
            .populate("customer", "name phone address")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Siparişler yüklenemedi." });
    }
}

export async function updateOrder(req, res) {
    try {
        const orderId = req.params.id;
        
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, 
            req.body, 
            { new: true, runValidators: true }
        ).populate("customer", "name phone");

        if (!updatedOrder) {
            return res.status(404).json({ message: "Sipariş bulunamadı." });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Güncelleme başarısız." });
    }
}

export async function createOrder(req, res) {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        await savedOrder.populate("customer", "name");

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: "Sipariş oluşturulamadı." });
    }
}

export async function updateOrderStatus(req, res) {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        ).populate("customer", "name");
        
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Durum güncellenemedi." });
    }
}

export async function deleteOrder(req, res) {
    try {
        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Sipariş silindi." });
    } catch (error) {
        res.status(500).json({ message: "Silme başarısız." });
    }
}