import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../libs/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Ruler,
  Factory,
  CheckCircle2,
  X,
} from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null); // Düzenlenen sipariş state'i

  // Form State
  const initialFormState = {
    customerId: "",
    width: "",
    height: "",
    ralCode: "",
    glassColor: "clear",
    cost: "",
    price: "",
    description: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- VERİ ÇEKME ---
  const fetchData = async () => {
    try {
      const [ordersRes, customersRes] = await Promise.all([
        api.get("/orders"),
        api.get("/customers"),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      toast.error("Veriler yüklenemedi.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CRUD İŞLEMLERİ ---

  // KAYDET VEYA GÜNCELLE
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId) return toast.error("Lütfen bir müşteri seçin.");

    try {
      const payload = { ...formData, customer: formData.customerId };

      if (editingOrder) {
        // GÜNCELLEME İŞLEMİ (PUT)
        await api.put(`/orders/${editingOrder._id}`, payload);
        toast.success("Sipariş güncellendi.");
      } else {
        // YENİ KAYIT (POST)
        await api.post("/orders", payload);
        toast.success("Sipariş oluşturuldu.");
      }

      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingOrder(null); // State'i temizle
      fetchData();
    } catch (error) {
      toast.error("İşlem başarısız.", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Durum güncellendi.");
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      toast.error("Durum değişemedi.", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Siparişi silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Sipariş silindi.");
      fetchData();
    } catch (error) {
      toast.error("Silinemedi.", error);
    }
  };

  // --- MODAL YÖNETİMİ ---

  const openAddModal = () => {
    setEditingOrder(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    // Formu mevcut verilerle doldur
    setFormData({
      customerId: order.customer?._id || "", // Populate edilmiş objeden ID'yi al
      width: order.width,
      height: order.height,
      ralCode: order.ralCode,
      glassColor: order.glassColor,
      cost: order.cost,
      price: order.price,
      description: order.description || "",
    });
    setIsModalOpen(true);
  };

  // --- UI YARDIMCILARI ---
  const getStatusBadge = (status) => {
    const styles = {
      received: {
        bg: "bg-slate-100",
        text: "text-slate-600",
        label: "Sipariş Alındı",
      },
      production: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        label: "Üretimde",
      },
      assembly: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        label: "Montaj/Toplama",
      },
      packaging: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        label: "Paketlemede",
      },
      ready: {
        bg: "bg-indigo-100",
        text: "text-indigo-600",
        label: "Teslime Hazır",
      },
      installed: {
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        label: "Teslim Edildi",
      },
      cancelled: { bg: "bg-red-100", text: "text-red-600", label: "İptal" },
    };
    return styles[status] || styles.received;
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o._id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeOrders = orders.filter(
    (o) => o.status !== "installed" && o.status !== "cancelled",
  ).length;
  const totalProfit = orders.reduce(
    (acc, curr) => acc + (curr.price - curr.cost),
    0,
  );

  return (
    <div className="space-y-6">
      {/* İSTATİSTİKLER (DEĞİŞMEDİ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Factory size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Aktif Sipariş (Üretimde)
            </p>
            <p className="text-2xl font-bold text-slate-800">{activeOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Tahmini Toplam Kâr
            </p>
            <p className="text-2xl font-bold text-slate-800">
              ₺{totalProfit.toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>

      {/* TABLO */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            Şeffaf Kepenk Siparişleri
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Müşteri veya Sipariş No..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Buton onClick güncellendi */}
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} /> Yeni Sipariş
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Müşteri</th>
                <th className="px-6 py-4">Ürün Detayları</th>
                <th className="px-6 py-4">Ölçüler (cm)</th>
                <th className="px-6 py-4">Fiyat / Kâr</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    Yükleniyor...
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {order.customer?.name || "Silinmiş Müşteri"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded w-fit">
                          RAL: {order.ralCode || "-"}
                        </span>
                        <span className="text-xs text-slate-500">
                          Cam:{" "}
                          {order.glassColor === "clear" ? "Şeffaf" : "Füme"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-700 font-mono">
                        <Ruler size={14} className="text-slate-400" />
                        {order.width} x {order.height}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">
                        ₺{order.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-emerald-600 font-medium">
                        Net: ₺{(order.price - order.cost).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={`px-2 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer appearance-none text-center min-w-[120px] ${getStatusBadge(order.status).bg} ${getStatusBadge(order.status).text}`}
                      >
                        <option value="received">Sipariş Alındı</option>
                        <option value="production">Üretimde</option>
                        <option value="assembly">Montaj/Toplama</option>
                        <option value="packaging">Paketleme</option>
                        <option value="ready">Teslime Hazır</option>
                        <option value="installed">Teslim Edildi</option>
                        <option value="cancelled">İptal Edildi</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* DÜZENLEME BUTONU EKLENDİ */}
                        <button
                          onClick={() => openEditModal(order)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
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

      {/* --- MODAL (EKLEME & DÜZENLEME) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingOrder
                  ? "Siparişi Düzenle"
                  : "Yeni Şeffaf Kepenk Siparişi"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {/* Müşteri Seçimi */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Müşteri Seçin
                </label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value })
                    }
                    required
                  >
                    <option value="">Seçiniz...</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                  {!editingOrder && (
                    <Link
                      to="/dashboard/customers"
                      className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center"
                    >
                      <Plus size={16} className="mr-1" /> Yeni
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ölçüler */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Genişlik (cm)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Örn: 250"
                    value={formData.width}
                    onChange={(e) =>
                      setFormData({ ...formData, width: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Yükseklik (cm)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Örn: 300"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>

                {/* Özellikler */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    RAL Renk Kodu
                  </label>
                  <input
                    type="text"
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Örn: 7016 Antrasit"
                    value={formData.ralCode}
                    onChange={(e) =>
                      setFormData({ ...formData, ralCode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Cam Rengi
                  </label>
                  <select
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.glassColor}
                    onChange={(e) =>
                      setFormData({ ...formData, glassColor: e.target.value })
                    }
                  >
                    <option value="clear">Şeffaf</option>
                    <option value="smoked">Füme (Koyu)</option>
                  </select>
                </div>

                {/* Finansal */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Maliyet (TL)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Satış Fiyatı (TL)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Ek Açıklama (Opsiyonel)
                </label>
                <textarea
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows="2"
                  placeholder="Montaj adresi farklı, 3 gün sonra teslim vb."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingOrder ? "Güncelle" : "Siparişi Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
