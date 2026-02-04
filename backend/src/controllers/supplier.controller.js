import Supplier from "../models/Supplier.js";

export async function getAllSuppliers(_, res) {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: "Tedarikçiler getirilemedi." });
    }
}

export async function createSupplier(req, res) {
    try {
        const newSupplier = new Supplier(req.body);
        const savedSupplier = await newSupplier.save();

        res.status(201).json(savedSupplier);
    } catch (error) {
        res.status(500).json({ message: "Tedarikçi oluşturulamadı." });
    }
}

export async function updateSupplier(req, res) {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ message: "Güncelleme başarısız." });
    }
}

export async function deleteSupplier(req, res) {
    try {
        await Supplier.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Tedarikçi silindi." });
    } catch (error) {
        res.status(500).json({ message: "Silme işlemi başarısız." });
    }
}

export async function addTransaction(req, res) {
    try {
        const { supplierId } = req.params;
        const { type, amount, description, date } = req.body;

        const supplier = await Supplier.findById(supplierId);

        if (!supplier) return res.status(404).json({ message: "Tedarikçi bulunamadı." });

        supplier.transactions.push({ type, amount, description, date });

        if (type === 'debt') {
            supplier.currentBalance += Number(amount);
        } else {
            supplier.currentBalance -= Number(amount);
        }

        await supplier.save();

        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: "İşlem eklenemedi." });
    }
}