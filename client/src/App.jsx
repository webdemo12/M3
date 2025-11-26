import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import "./styles.css";

import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import Home from "./pages/Home";
import PreviousResults from "./pages/PreviousResults";
import ContactUs from "./pages/ContactUs";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const pageConfig = {
  "/": { title: "M3 Matka", component: Home },
  "/previous-results": { title: "Previous Results", component: PreviousResults },
  "/contact": { title: "Contact Us", component: ContactUs },
  "/admin": { title: "Admin Panel", component: Admin, requiresAuth: true },
};

function ProtectedRoute({ component: Component, requiresAuth, isAdmin }) {
  if (requiresAuth && !isAdmin) {
    return <Login />;
  }
  return <Component />;
}

function PageHeader({ title, onMenuClick }) {
  return (
    <header className="main-header">
      <div style={{ display: "flex", alignItems: "center" }}>
        <button 
          className="mobile-menu-toggle" 
          onClick={onMenuClick}
          data-testid="button-mobile-menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2>{title}</h2>
      </div>
      <ThemeToggle />
    </header>
  );
}

function Router({ isAdmin }) {
  return (
    <Switch>
      {Object.entries(pageConfig).map(([path, config]) => (
        <Route key={path} path={path}>
          <ProtectedRoute 
            component={config.component}
            requiresAuth={config.requiresAuth}
            isAdmin={isAdmin}
          />
        </Route>
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}

function CurrentPageHeader({ onMenuClick }) {
  return (
    <Switch>
      {Object.entries(pageConfig).map(([path, { title }]) => (
        <Route key={path} path={path}>
          <PageHeader title={title} onMenuClick={onMenuClick} />
        </Route>
      ))}
      <Route>
        <PageHeader title="Not Found" onMenuClick={onMenuClick} />
      </Route>
    </Switch>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authRefresh, setAuthRefresh] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check");
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (err) {
        console.error("Error checking auth:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [authRefresh]);

  useEffect(() => {
    // Check for login success via window object
    if (window.__loginSuccess) {
      setAuthRefresh(prev => prev + 1);
      window.__loginSuccess = false;
    }
  }, []);

  if (loading) return <div></div>;

  return (
    <div className="app-layout">
      <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div 
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <CurrentPageHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-body">
          <Router isAdmin={isAdmin} />
        </div>
      </main>
    </div>
  );
}
