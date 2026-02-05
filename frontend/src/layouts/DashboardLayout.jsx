import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Truck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Building2,
  Bell,
  X,
  Receipt,
  ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("LocalStorage user parse error:", error);

      return null;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Çıkış yapıldı.");
    navigate("/signin");
  };

  const menuItems = [
    { name: "Genel Bakış", path: "/dashboard", icon: LayoutDashboard },
    { name: "Personel Yönetimi", path: "/dashboard/users", icon: Users },
    { name: "Müşteri Yönetimi", path: "/dashboard/customers", icon: UserRound },
    { name: "Tedarikçi Yönetimi", path: "/dashboard/suppliers", icon: Truck },
    { name: "Gider Yönetimi", path: "/dashboard/expenses", icon: Receipt },
    {
      name: "Sipariş Yönetimi",
      path: "/dashboard/orders",
      icon: ClipboardList,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`
          fixed md:relative z-30 h-full bg-white border-r border-slate-200 
          transition-all duration-300 ease-in-out flex flex-col
          ${
            isSidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64 md:translate-x-0 md:w-20"
          }
        `}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-indigo-600 text-xl overflow-hidden whitespace-nowrap px-4">
            <div className="min-w-[32px] h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} />
            </div>

            <span
              className={`transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}
            >
              SATRACKER
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-500 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          {isSidebarOpen ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={22}
                  className={`min-w-[22px] ${isActive ? "text-indigo-600" : "group-hover:text-indigo-600"}`}
                />

                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}
                >
                  {item.name}
                </span>

                {!isSidebarOpen && (
                  <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap ml-2">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div
            className={`flex items-center gap-3 ${!isSidebarOpen && "justify-center"}`}
          >
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm min-w-[40px]">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}
            >
              <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                {user?.username || "Kullanıcı"}
              </p>

              <button
                onClick={handleLogout}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-0.5"
              >
                <LogOut size={12} /> Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">
              {menuItems.find((i) => i.path === location.pathname)?.name ||
                "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
              <Bell size={20} />

              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
