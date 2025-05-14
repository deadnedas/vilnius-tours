// Update your App.jsx
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import ErrorFallback from "./components/ErrorFallback";
import TourList from "./components/TourList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/NavBar";
import MyTours from "./pages/MyTours";
import AdminDashboard from "./components/AdminDashboard";
import AdminTourRegistrations from "./components/AdminTourRegistrations";
import EditTourPage from "./components/EditTourPage";
function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Navbar />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<h1>Loading...</h1>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-tours" element={<MyTours />} />
            <Route
              path="/individual-tours"
              element={<TourList group={"individual"} />}
            />
            <Route path="/group-tours" element={<TourList group={"group"} />} />
            <Route path="/" element={<TourList />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tours/edit/:id" element={<EditTourPage />} />
            <Route
              path="/admin/registrations/tour/:tourId"
              element={<AdminTourRegistrations />}
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
