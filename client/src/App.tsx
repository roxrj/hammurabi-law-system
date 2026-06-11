import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";

// صفحات النظام (Lazy Loading)
import Dashboard from "./pages/Dashboard";
import ClientsList from "./pages/ClientsList";
import ClientForm from "./pages/ClientForm";
import ClientProfile from "./pages/ClientProfile";
import CasesManagement from "./pages/CasesManagement";
import DocumentsManagement from "./pages/DocumentsManagement";
import CaseAnalysis from "./pages/CaseAnalysis";
import Analytics from "./pages/Analytics";
import LegalLibrary from "./pages/LegalLibrary";
import ContractTemplates from "./pages/ContractTemplates";
import AdminPanel from "./pages/AdminPanel";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return <Home />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={() => (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )} />
      <Route path="/clients" component={() => (
        <ProtectedRoute>
          <ClientsList />
        </ProtectedRoute>
      )} />
      <Route path="/clients/new" component={() => (
        <ProtectedRoute>
          <ClientForm />
        </ProtectedRoute>
      )} />
      <Route path="/clients/:id" component={() => (
        <ProtectedRoute>
          <ClientProfile />
        </ProtectedRoute>
      )} />
      <Route path="/clients/:id/edit" component={() => (
        <ProtectedRoute>
          <ClientForm />
        </ProtectedRoute>
      )} />
      <Route path="/cases" component={() => (
        <ProtectedRoute>
          <CasesManagement />
        </ProtectedRoute>
      )} />
      <Route path="/cases/:id/analysis" component={() => (
        <ProtectedRoute>
          <CaseAnalysis />
        </ProtectedRoute>
      )} />
      <Route path="/documents" component={() => (
        <ProtectedRoute>
          <DocumentsManagement />
        </ProtectedRoute>
      )} />
      <Route path="/analytics" component={() => (
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      )} />
      <Route path="/library" component={() => (
        <ProtectedRoute>
          <LegalLibrary />
        </ProtectedRoute>
      )} />
      <Route path="/contracts" component={() => (
        <ProtectedRoute>
          <ContractTemplates />
        </ProtectedRoute>
      )} />
      <Route path="/admin" component={() => (
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      )} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
