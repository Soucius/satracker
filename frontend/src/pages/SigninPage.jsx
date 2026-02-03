import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../libs/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, CircleAlert } from "lucide-react";

const SigninPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Lütfen e-posta ve şifrenizi girin.");

      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/signin", formData);

      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.message ||
        "Giriş yapılamadı. Bilgilerinizi kontrol edin.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);

      setFormData({
        email: "",
        password: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            Tekrar Hoş Geldiniz
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Hesabınıza erişmek için bilgilerinizi girin.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
              <CircleAlert className="size-5" />

              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                E-posta Adresi
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out sm:text-sm"
                placeholder="ornek@kurum.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Şifre
                </label>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Şifrenizi mi unuttunuz?
                  </Link>
                </div>
              </div>

              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30"
              } transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />

                  <span>Giriş Yapılıyor...</span>
                </div>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-slate-500">Hesabınız yok mu? </span>

            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Hemen Kayıt Olun
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SigninPage;
