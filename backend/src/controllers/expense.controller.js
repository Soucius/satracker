import Expense from "../models/Expense.js";

export async function getAllExpenses(_, res) {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 });

        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Giderler getirilemedi." });
    }
}

export async function createExpense(req, res) {
    try {
        const newExpense = new Expense(req.body);
        const savedExpense = await newExpense.save();

        res.status(201).json(savedExpense);
    } catch (error) {
        res.status(500).json({ message: "Gider kalemi oluşturulamadı." });
    }
}

export async function updateExpense(req, res) {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: "Güncelleme başarısız." });
    }
}

export async function deleteExpense(req, res) {
    try {
        await Expense.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Gider silindi." });
    } catch (error) {
        res.status(500).json({ message: "Silme işlemi başarısız." });
    }
}

export async function addTransaction(req, res) {
    try {
        const { expenseId } = req.params;
        const { type, amount, description, date } = req.body;

        const expense = await Expense.findById(expenseId);

        if (!expense) return res.status(404).json({ message: "Gider kalemi bulunamadı." });

        expense.transactions.push({ type, amount, description, date });

        if (type === 'expense') {
            expense.totalAmount += Number(amount);
        } else {
            expense.totalAmount -= Number(amount);
        }

        await expense.save();

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: "İşlem eklenemedi." });
    }
}