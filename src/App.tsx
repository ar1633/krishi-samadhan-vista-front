
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { QuestionsProvider } from "@/hooks/use-questions";
import { WarehousesProvider } from "@/hooks/use-warehouses";

// Layout Components
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

// Farmer Pages
import FarmerDashboard from "@/pages/farmer/FarmerDashboard";
import FarmerQuestions from "@/pages/farmer/FarmerQuestions";
import AskQuestion from "@/pages/farmer/AskQuestion";

// Expert Pages
import ExpertDashboard from "@/pages/expert/ExpertDashboard";
import ExpertQuestions from "@/pages/expert/ExpertQuestions";

// Vendor Pages
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import VendorWarehouses from "@/pages/vendor/VendorWarehouses";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={`/dashboard/${user?.role}`} replace />;
  }
  
  return <>{children}</>;
};

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      
      {/* Farmer Routes */}
      <Route 
        path="/dashboard/farmer" 
        element={
          <Layout>
            <ProtectedRoute requiredRole="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          </Layout>
        } 
      />
      <Route 
        path="/farmer/questions" 
        element={
          <Layout>
            <ProtectedRoute requiredRole="farmer">
              <FarmerQuestions />
            </ProtectedRoute>
          </Layout>
        } 
      />
      <Route 
        path="/farmer/questions/new" 
        element={
          <Layout>
            <ProtectedRoute requiredRole="farmer">
              <AskQuestion />
            </ProtectedRoute>
          </Layout>
        } 
      />
      
      {/* Expert Routes */}
      <Route 
        path="/dashboard/expert" 
        element={
          <Layout>
            <ProtectedRoute requiredRole="expert">
              <ExpertDashboard />
            </ProtectedRoute>
          </Layout>
        } 
      />
      <Route 
        path="/expert/questions" 
        element={
          <Layout>
            <ProtectedRoute requiredRole="expert">
              <ExpertQuestions />
            </ProtectedRoute>
          </Layout>
        } 
      />
      
      {/* Vendor Routes */}
      <Route 
        path="/dashboard/vendor" 
        element={
          <Layout>
            <ProtectedRoute requiredRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          </Layout>
        } 
      />
      <Route 
        path="/vendor/warehouses" 
        element={
          <Layout>
            <ProtectedRoute requiredRole="vendor">
              <VendorWarehouses />
            </ProtectedRoute>
          </Layout>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <QuestionsProvider>
            <WarehousesProvider>
              <AppRoutes />
            </WarehousesProvider>
          </QuestionsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
