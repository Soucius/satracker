import { useState, useEffect } from "react";
import api from "../libs/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Truck, // Tedarikçi için kamyon ikonu
  MapPin,
  Phone,
  Wallet,
  History,
  X,
  PackagePlus, // Alış ikonu
  CheckCircle2,
  Calendar,
} from "lucide-react";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const initialFormState = {
    name: "",
    phone: "",
    email: "",
    address: "",
    taxOffice: "",
    taxNumber: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  const [transactionData, setTransactionData] = useState({
    type: "debt", // debt: Alış (Borçlanma), payment: Ödeme
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data);
    } catch (error) {
      toast.error("Tedarikçiler yüklenemedi.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSupplier) {
        await api.put(`/suppliers/${selectedSupplier._id}`, formData);
        toast.success("Tedarikçi güncellendi.");
      } else {
        await api.post("/suppliers", formData);
        toast.success("Tedarikçi oluşturuldu.");
      }
      setIsFormModalOpen(false);
      setFormData(initialFormState);
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (error) {
      toast.error("İşlem başarısız.", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu tedarikçiyi silmek istediğinize emin misiniz?"))
      return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Tedarikçi silindi.");
      fetchSuppliers();
    } catch (error) {
      toast.error("Silme başarısız.", error);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!transactionData.amount || transactionData.amount <= 0) {
      return toast.error("Geçerli bir tutar giriniz.");
    }
    try {
      await api.post(
        `/suppliers/${selectedSupplier._id}/transaction`,
        transactionData,
      );
      toast.success("İşlem kaydedildi.");
      setIsTransactionModalOpen(false);
      setTransactionData({
        type: "debt",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchSuppliers();
    } catch (error) {
      toast.error("İşlem eklenemedi.", error);
    }
  };

  const openAddModal = () => {
    setSelectedSupplier(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      taxOffice: supplier.taxOffice,
      taxNumber: supplier.taxNumber,
    });
    setIsFormModalOpen(true);
  };

  const openTransactionModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsTransactionModalOpen(true);
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalDebt = suppliers.reduce(
    (acc, curr) => acc + (curr.currentBalance || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* ÜST BİLGİ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Kayıtlı Tedarikçi
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {suppliers.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Toplam Borcumuz
            </p>
            <p className="text-2xl font-bold text-slate-800">
              ₺{totalDebt.toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>

      {/* TEDARİKÇİ LİSTESİ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            Tedarikçi Cari Listesi
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tedarikçi ara..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} /> Yeni Tedarikçi
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Firma / Ad Soyad</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4">Güncel Bakiye (Borç)</th>
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
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {supplier.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {supplier.taxOffice
                          ? `${supplier.taxOffice} VD - ${supplier.taxNumber}`
                          : "Bireysel"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <Phone size={14} className="text-slate-400" />{" "}
                        {supplier.phone}
                      </div>
                      {supplier.address && (
                        <div
                          className="flex items-center gap-2 text-xs mt-1 truncate max-w-[200px]"
                          title={supplier.address}
                        >
                          <MapPin size={14} className="text-slate-400" />{" "}
                          {supplier.address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {/* Borç varsa Kırmızı, Yoksa Yeşil */}
                      <span
                        className={`font-bold ${supplier.currentBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {supplier.currentBalance > 0 ? "-" : ""}₺
                        {supplier.currentBalance.toLocaleString("tr-TR")}
                      </span>
                      <div className="text-xs text-slate-400">
                        {supplier.currentBalance > 0 ? "Borçluyuz" : "Borç Yok"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openTransactionModal(supplier)}
                          className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-slate-200 transition-colors"
                        >
                          <History size={14} /> Hareket Ekle
                        </button>
                        <button
                          onClick={() => openEditModal(supplier)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier._id)}
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

      {/* --- MODAL 1: TEDARİKÇİ EKLE/DÜZENLE --- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {selectedSupplier
                  ? "Tedarikçiyi Düzenle"
                  : "Yeni Tedarikçi Ekle"}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)}>
                <X className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Firma Adı
                  </label>
                  <input
                    required
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Telefon
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    E-Posta
                  </label>
                  <input
                    type="email"
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Vergi Dairesi
                  </label>
                  <input
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.taxOffice}
                    onChange={(e) =>
                      setFormData({ ...formData, taxOffice: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Vergi No
                  </label>
                  <input
                    maxLength={11}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.taxNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxNumber: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Adres
                  </label>
                  <textarea
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows="2"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
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

      {/* --- MODAL 2: CARİ İŞLEM (HAREKET) EKLE --- */}
      {isTransactionModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Hareket Ekle
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedSupplier.name}
                </p>
              </div>
              <button onClick={() => setIsTransactionModalOpen(false)}>
                <X className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Alış (Borçlanma) Butonu */}
                <button
                  type="button"
                  onClick={() =>
                    setTransactionData({ ...transactionData, type: "debt" })
                  }
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${transactionData.type === "debt" ? "border-amber-500 bg-amber-50 text-amber-600 ring-1 ring-amber-500" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <PackagePlus size={24} />
                  <span className="font-bold text-sm text-center">
                    Hizmet/Ürün Alışı (Borçlan)
                  </span>
                </button>

                {/* Ödeme Butonu */}
                <button
                  type="button"
                  onClick={() =>
                    setTransactionData({ ...transactionData, type: "payment" })
                  }
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${transactionData.type === "payment" ? "border-emerald-500 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <CheckCircle2 size={24} />
                  <span className="font-bold text-sm text-center">
                    Ödeme Yap (Borç Düş)
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
                  placeholder="Örn: Fatura No: 554 veya Havale"
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
                  İşlemi Kaydet
                </button>
              </div>
            </form>

            {/* SON HAREKETLER */}
            <div className="bg-slate-50 p-4 rounded-b-2xl border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                Son Hareketler
              </h4>
              <div className="space-y-3 max-h-32 overflow-y-auto pr-1">
                {selectedSupplier.transactions &&
                selectedSupplier.transactions.length > 0 ? (
                  [...selectedSupplier.transactions]
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
                          className={`font-bold ${t.type === "debt" ? "text-amber-600" : "text-emerald-600"}`}
                        >
                          {t.type === "debt" ? "+" : "-"} ₺
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

export default SuppliersPage;
