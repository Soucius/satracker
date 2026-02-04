import { useState, useEffect } from "react";
import api from "../libs/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Receipt, // Fiş İkonu
  Wallet,
  History,
  X,
  TrendingDown, // Harcama İkonu
  RotateCcw, // İade İkonu
  Calendar,
  Tag,
} from "lucide-react";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modallar
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Form State (Gider Kalemi Oluşturma)
  const initialFormState = { name: "", description: "" };
  const [formData, setFormData] = useState(initialFormState);

  // İşlem State (Harcama Ekleme)
  const [transactionData, setTransactionData] = useState({
    type: "expense", // expense: Harcama, refund: İade
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (error) {
      toast.error("Giderler yüklenemedi.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // CRUD İşlemleri
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedExpense) {
        await api.put(`/expenses/${selectedExpense._id}`, formData);
        toast.success("Gider kalemi güncellendi.");
      } else {
        await api.post("/expenses", formData);
        toast.success("Gider kalemi oluşturuldu.");
      }
      setIsFormModalOpen(false);
      setFormData(initialFormState);
      setSelectedExpense(null);
      fetchExpenses();
    } catch (error) {
      toast.error("İşlem başarısız.", error);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bu gider kalemini ve tüm geçmişini silmek istediğinize emin misiniz?",
      )
    )
      return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Silindi.");
      fetchExpenses();
    } catch (error) {
      toast.error("Silme başarısız.", error);
    }
  };

  // İşlem Ekleme
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!transactionData.amount || transactionData.amount <= 0) {
      return toast.error("Geçerli bir tutar giriniz.");
    }
    try {
      await api.post(
        `/expenses/${selectedExpense._id}/transaction`,
        transactionData,
      );
      toast.success("İşlem kaydedildi.");
      setIsTransactionModalOpen(false);
      setTransactionData({
        type: "expense",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchExpenses();
    } catch (error) {
      toast.error("İşlem eklenemedi.", error);
    }
  };

  // Modal Yardımcıları
  const openAddModal = () => {
    setSelectedExpense(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setFormData({ name: expense.name, description: expense.description });
    setIsFormModalOpen(true);
  };

  const openTransactionModal = (expense) => {
    setSelectedExpense(expense);
    setIsTransactionModalOpen(true);
  };

  const filteredExpenses = expenses.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalExpenditure = expenses.reduce(
    (acc, curr) => acc + (curr.totalAmount || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* ÜST BİLGİ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Gider Kalemi Sayısı
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {expenses.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Toplam Genel Gider
            </p>
            <p className="text-2xl font-bold text-slate-800">
              ₺{totalExpenditure.toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>

      {/* GİDER LİSTESİ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            Gider Takip Listesi
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Gider ara (Kira, Elektrik...)"
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} /> Yeni Gider Kalemi
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Gider Adı</th>
                <th className="px-6 py-4">Açıklama / Abonelik</th>
                <th className="px-6 py-4">Toplam Harcama</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    Yükleniyor...
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                          <Receipt size={18} />
                        </div>
                        <div className="font-medium text-slate-900">
                          {expense.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {expense.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">
                        ₺{expense.totalAmount.toLocaleString("tr-TR")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openTransactionModal(expense)}
                          className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-slate-200 transition-colors"
                        >
                          <History size={14} /> Fiş/Fatura Ekle
                        </button>
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: GİDER KALEMİ EKLE/DÜZENLE --- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {selectedExpense ? "Kalemi Düzenle" : "Yeni Gider Kalemi"}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)}>
                <X className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Gider Adı
                </label>
                <input
                  required
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Örn: Ofis Kirası, Elektrik, Mutfak"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Açıklama / Abone No
                </label>
                <textarea
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows="3"
                  placeholder="Örn: Sözleşme No: 2024-A, Abone No: 123456"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: İŞLEM (HARCAMA) EKLE --- */}
      {isTransactionModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">İşlem Ekle</h3>
                <p className="text-sm text-slate-500">{selectedExpense.name}</p>
              </div>
              <button onClick={() => setIsTransactionModalOpen(false)}>
                <X className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setTransactionData({ ...transactionData, type: "expense" })
                  }
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${transactionData.type === "expense" ? "border-red-500 bg-red-50 text-red-600 ring-1 ring-red-500" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <TrendingDown size={24} />
                  <span className="font-bold text-sm text-center">
                    Harcama Ekle
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTransactionData({ ...transactionData, type: "refund" })
                  }
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${transactionData.type === "refund" ? "border-indigo-500 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <RotateCcw size={24} />
                  <span className="font-bold text-sm text-center">
                    İade / Düzeltme
                  </span>
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Tutar (TL)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  value={transactionData.amount}
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
                      amount: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Açıklama
                </label>
                <input
                  type="text"
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Örn: Ocak Faturası, Mutfak Alışverişi"
                  value={transactionData.description}
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Tarih
                </label>
                <input
                  type="date"
                  required
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={transactionData.date}
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Kaydet
                </button>
              </div>
            </form>

            {/* SON HAREKETLER */}
            <div className="bg-slate-50 p-4 rounded-b-2xl border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                Son Hareketler
              </h4>
              <div className="space-y-3 max-h-32 overflow-y-auto pr-1">
                {selectedExpense.transactions &&
                selectedExpense.transactions.length > 0 ? (
                  [...selectedExpense.transactions]
                    .reverse()
                    .slice(0, 3)
                    .map((t, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs"
                      >
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-medium truncate max-w-[120px]">
                            {t.description || "İşlem"}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {new Date(t.date).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <span
                          className={`font-bold ${t.type === "expense" ? "text-red-600" : "text-indigo-600"}`}
                        >
                          {t.type === "expense" ? "-" : "+"} ₺
                          {t.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Henüz işlem yok.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
