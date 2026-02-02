import { Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import PublicRoute from "./components/PublicRoute";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <div className="h-screen w-full bg-gray-100 font-montserrat">
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
