import Customer from "../models/Customer.js";

export async function getAllCustomers(_, res) {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });

        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "Müşteriler getirilemedi." });
    }
}

export async function createCustomer(req, res) {
    try {
        const newCustomer = new Customer(req.body);
        const savedCustomer = await newCustomer.save();

        res.status(201).json(savedCustomer);
    } catch (error) {
        res.status(500).json({ message: "Müşteri oluşturulamadı." });
    }
}

export async function updateCustomer(req, res) {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );

        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ message: "Güncelleme başarısız." });
    }
}

export async function deleteCustomer(req, res) {
    try {
        await Customer.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Müşteri silindi." });
    } catch (error) {
        res.status(500).json({ message: "Silme işlemi başarısız." });
    }
}

export async function addTransaction(req, res) {
    try {
        const { customerId } = req.params;
        const { type, amount, description, date } = req.body;
        const customer = await Customer.findById(customerId);

        if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı." });

        customer.transactions.push({ type, amount, description, date });

        if (type === 'debt') {
            customer.currentBalance += Number(amount);
        } else {
            customer.currentBalance -= Number(amount);
        }

        await customer.save();

        res.status(200).json(customer);
    } catch (error) {
        console.error(error);

        res.status(500).json({ message: "İşlem eklenemedi." });
    }
}