import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import SupportChatbot from "@/components/SupportChatbot";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PlantGuide from "./pages/PlantGuide";
import PlantCalendar from "./pages/PlantCalendar";
import MyGarden from "./pages/MyGarden";
import PlantMatchmaker from "./pages/PlantMatchmaker";
import GrowingPrograms from "./pages/GrowingPrograms";
import PlantDoctor from "./pages/PlantDoctor";
import CommunityMarketplace from "./pages/CommunityMarketplace";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/plant-guide" element={<PlantGuide />} />
            <Route path="/plant-calendar" element={<PlantCalendar />} />
            <Route path="/my-garden" element={<MyGarden />} />
            <Route path="/plant-matchmaker" element={<PlantMatchmaker />} />
            <Route path="/growing-programs" element={<GrowingPrograms />} />
            <Route path="/plant-doctor" element={<PlantDoctor />} />
            <Route path="/community-marketplace" element={<CommunityMarketplace />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/account" element={<Account />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SupportChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
