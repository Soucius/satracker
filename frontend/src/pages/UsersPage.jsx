import { useState, useEffect } from "react";
import api from "../libs/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Wallet,
  CalendarClock,
  X,
} from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMonthlyCost: 0,
    totalWeeklyCost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const initialFormState = {
    username: "",
    email: "",
    password: "",
    role: "personel",
    financials: {
      salary: 0,
      salaryType: "monthly",
      insurance: 0,
      benefits: 0,
      transport: 0,
      overtime: 0,
    },
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get("/users"),
        api.get("/users/stats"),
      ]);

      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);

      toast.error("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (
      [
        "salary",
        "salaryType",
        "insurance",
        "benefits",
        "transport",
        "overtime",
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        financials: { ...prev.financials, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
        toast.success("Personel güncellendi.");
      } else {
        await api.post("/users", formData);
        toast.success("Personel eklendi.");
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setFormData(initialFormState);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "İşlem başarısız.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu personeli silmek istediğinize emin misiniz?"))
      return;
    try {
      await api.delete(`/users/${id}`);

      toast.success("Personel silindi.");

      fetchData();
    } catch (error) {
      toast.error("Silme işlemi başarısız.", error);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      financials: {
        salary: user.financials?.salary || 0,
        salaryType: user.financials?.salaryType || "monthly",
        insurance: user.financials?.insurance || 0,
        benefits: user.financials?.benefits || 0,
        transport: user.financials?.transport || 0,
        overtime: user.financials?.overtime || 0,
      },
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Users size={24} />
          </div>

          <div>
            <p className="text-sm text-slate-500 font-medium">
              Toplam Personel
            </p>

            <p className="text-2xl font-bold text-slate-800">
              {stats.totalUsers}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CalendarClock size={24} />
          </div>

          <div>
            <p className="text-sm text-slate-500 font-medium">
              Aylık Toplam Maliyet
            </p>

            <p className="text-2xl font-bold text-slate-800">
              ₺{stats.totalMonthlyCost.toLocaleString("tr-TR")}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Wallet size={24} />
          </div>

          <div>
            <p className="text-sm text-slate-500 font-medium">
              Haftalık Ödeme Planı
            </p>

            <p className="text-2xl font-bold text-slate-800">
              ₺
              {stats.totalWeeklyCost.toLocaleString("tr-TR", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Personel Listesi</h2>

          <div className="flex gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Personel ara..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} /> Yeni Ekle
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ad Soyad / Kullanıcı</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Maaş (Net)</th>
                <th className="px-6 py-4">Ek Giderler</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const f = user.financials || {};
                  const totalExtras =
                    (f.insurance || 0) +
                    (f.benefits || 0) +
                    (f.transport || 0) +
                    (f.overtime || 0);

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {user.username}
                        </div>

                        <div className="text-xs text-slate-400">
                          {user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {user.role === "admin" ? "Yönetici" : "Personel"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium">
                        ₺{f.salary?.toLocaleString("tr-TR")}
                        <span className="text-xs text-slate-400 font-normal ml-1">
                          ({f.salaryType === "monthly" ? "Ay" : "Hafta"})
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        ₺{totalExtras.toLocaleString("tr-TR")}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingUser ? "Personel Düzenle" : "Yeni Personel Ekle"}
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">
                  Kimlik Bilgileri
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ad Soyad
                    </label>

                    <input
                      required
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Ad Soyad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      E-Posta
                    </label>

                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="ornek@mail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {editingUser ? "Yeni Şifre (Boş bırakılabilir)" : "Şifre"}
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Rol
                    </label>

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="personel">Personel</option>
                      <option value="admin">Yönetici</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">
                  Finansal Bilgiler
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Maaş Tutarı
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ₺
                      </span>

                      <input
                        type="number"
                        name="salary"
                        value={formData.financials.salary}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ödeme Tipi
                    </label>

                    <select
                      name="salaryType"
                      value={formData.financials.salaryType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="monthly">Aylık Maaş</option>
                      <option value="weekly">Haftalık Maaş</option>
                    </select>
                  </div>

                  {[
                    { label: "Sigorta", name: "insurance" },
                    { label: "Yan Haklar (Yemek vb.)", name: "benefits" },
                    { label: "Yol Ücreti", name: "transport" },
                    { label: "Sabit Mesai", name: "overtime" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {field.label}
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          ₺
                        </span>

                        <input
                          type="number"
                          name={field.name}
                          value={formData.financials[field.name]}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  {editingUser ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
