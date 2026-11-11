import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { logout } from "./service/auth.service";

function isAuthorizedAdminSession(): boolean {
  const token = localStorage.getItem("admin_token");
  const rawUser = localStorage.getItem("admin_user");
  if (!token || !rawUser) return false;

  try {
    const user = JSON.parse(rawUser) as { role?: string };
    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

function App() {
  const navigate = useNavigate();

  if (!isAuthorizedAdminSession()) {
    logout();
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-background text-on-background font-body-md h-screen w-screen flex overflow-hidden antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* Header */}
        <Header
          onSettingsClick={() => navigate("/configuracoes")}
          onLogoutClick={handleLogout}
        />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
