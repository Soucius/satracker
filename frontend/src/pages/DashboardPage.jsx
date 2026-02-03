const DashboardPage = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">
            Toplam Personel
          </h3>

          <p className="text-3xl font-bold text-slate-800 mt-2">124</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Aktif Görevler</h3>

          <p className="text-3xl font-bold text-indigo-600 mt-2">12</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Bekleyen İşler</h3>

          <p className="text-3xl font-bold text-amber-500 mt-2">5</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 h-96 flex items-center justify-center text-slate-400">
        Grafik Alanı Gelecek
      </div>
    </div>
  );
};
export default DashboardPage;
