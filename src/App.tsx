import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/dashboard";
import {
  ListPage as RumahQuranListPage,
  CreatePage as RumahQuranCreatePage,
  EditPage as RumahQuranEditPage,
} from "./pages/rumah-quran";
import {
  ListPage as WorkProgramListPage,
  CreatePage as WorkProgramCreatePage,
  EditPage as WorkProgramEditPage,
  ViewPage as WorkProgramViewPage,
} from "./pages/work-program";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppRoutes() {
  const { userEmail, userName } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard userEmail={userEmail} userName={userName} />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="rumah-quran" element={<RumahQuranListPage />} />
        <Route path="rumah-quran/create" element={<RumahQuranCreatePage />} />
        <Route path="rumah-quran/edit/:id" element={<RumahQuranEditPage />} />
        <Route path="work-program" element={<WorkProgramListPage />} />
        <Route path="work-program/create" element={<WorkProgramCreatePage />} />
        <Route path="work-program/view/:id" element={<WorkProgramViewPage />} />
        <Route path="work-program/edit/:id" element={<WorkProgramEditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
