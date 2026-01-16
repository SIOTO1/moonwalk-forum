import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConductAgreementGate } from "@/components/moderation/ConductAgreementGate";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Moderation from "./pages/Moderation";
import Search from "./pages/Search";
import Thread from "./pages/Thread";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConductAgreementGate />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/thread/:slug" element={<Thread />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/moderation" element={<Moderation />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;