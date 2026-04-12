import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConductAgreementGate } from "@/components/moderation/ConductAgreementGate";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes for better code splitting
const Profile = lazy(() => import("./pages/Profile"));
const Moderation = lazy(() => import("./pages/Moderation"));
const Search = lazy(() => import("./pages/Search"));
const Thread = lazy(() => import("./pages/Thread"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const VendorPortal = lazy(() => import("./pages/VendorPortal"));
const CampaignEditor = lazy(() => import("./pages/CampaignEditor"));
const CampaignAnalytics = lazy(() => import("./pages/CampaignAnalytics"));
const AdminAdReview = lazy(() => import("./pages/AdminAdReview"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time of 1 minute - data is considered fresh and won't refetch
      staleTime: 1000 * 60,
      // Keep unused data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Don't refetch on window focus by default (reduces unnecessary requests)
      refetchOnWindowFocus: false,
      // Don't refetch when component remounts if data is fresh
      refetchOnMount: false,
      // Retry failed requests up to 2 times
      retry: 2,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConductAgreementGate />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/thread/:slug" element={<Thread />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/moderation" element={<Moderation />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/vendor" element={<VendorPortal />} />
              <Route path="/vendor/campaigns/:id" element={<CampaignEditor />} />
              <Route path="/vendor/analytics/:id" element={<CampaignAnalytics />} />
              <Route path="/admin/ads" element={<AdminAdReview />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
