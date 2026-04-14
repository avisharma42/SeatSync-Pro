import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer />
        </>
    );
};

export default App;
