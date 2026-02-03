import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../libs/axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/users/forgot-password", { email });

      toast.success("Doğrulama kodu gönderildi!");

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/users/verify-otp", { email, otp });

      toast.success("Kod doğrulandı!");

      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Geçersiz kod.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Şifreler eşleşmiyor.");

      return;
    }

    setLoading(true);

    try {
      await api.post("/users/reset-password", {
        email,
        newPassword: passwords.newPassword,
      });

      toast.success(
        "Şifreniz başarıyla değiştirildi! Girişe yönlendiriliyorsunuz...",
      );

      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Şifre değiştirilemedi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-slate-100 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            {step === 1 && <Mail className="h-6 w-6 text-indigo-600" />}
            {step === 2 && <KeyRound className="h-6 w-6 text-indigo-600" />}
            {step === 3 && <Lock className="h-6 w-6 text-indigo-600" />}
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {step === 1 && "Şifrenizi mi Unuttunuz?"}
            {step === 2 && "Doğrulama Kodu"}
            {step === 3 && "Yeni Şifre Belirleyin"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {step === 1 && "Hesabınıza ait e-posta adresini girin."}
            {step === 2 &&
              `Lütfen ${email} adresine gönderilen 6 haneli kodu girin.`}
            {step === 3 && "Hesabınız için yeni ve güçlü bir şifre oluşturun."}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-posta Adresi
              </label>

              <input
                type="email"
                required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="ornek@kurum.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Kod Gönder"
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                6 Haneli Kod
              </label>

              <input
                type="text"
                maxLength="6"
                required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Doğrula"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                E-posta adresini değiştir
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Yeni Şifre
              </label>

              <input
                type={showPass ? "text" : "password"}
                required
                className="block w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Yeni Şifre Tekrar
              </label>

              <input
                type={showConfirmPass ? "text" : "password"}
                required
                className="block w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="••••••••"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Şifreyi Değiştir"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/signin"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
