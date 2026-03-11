import { Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./lib/api";
import Layout from "./components/Layout";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import DocumentsPage from "./pages/Documents";
import PipelinePage from "./pages/Pipeline";
import WorkflowsPage from "./pages/Workflows";
import SessionsPage from "./pages/Sessions";
import SearchPage from "./pages/Search";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>
    </Routes>
  );
}
