import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import SupportChatbot from "@/components/SupportChatbot";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PlantGuide from "./pages/PlantGuide";
import PlantIdentificationPage from "./pages/PlantIdentificationPage";
import PlantCalendar from "./pages/PlantCalendar";
import MyGarden from "./pages/MyGarden";
import PlantMatchmaker from "./pages/PlantMatchmaker";
import GrowingPrograms from "./pages/GrowingPrograms";
import PlantDoctor from "./pages/PlantDoctor";
import CommunityMarketplace from "./pages/CommunityMarketplace";
import ARGarden from "./pages/ARGarden";
import Achievements from "./pages/Achievements";
import ShoppingAssistant from "./pages/ShoppingAssistant";
import RegionalIntelligence from "./pages/RegionalIntelligence";
import SustainabilityFeatures from "./pages/SustainabilityFeatures";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import PlantWishlist from "./pages/PlantWishlist";
import TransformationGallery from "./pages/TransformationGallery";
import PropagationGuides from "./pages/PropagationGuides";
import SeasonalPlanting from "./pages/SeasonalPlanting";
import AffiliateStore from "./pages/AffiliateStore";
import VirtualWorkshops from "./pages/VirtualWorkshops";
import PlantCareKits from "./pages/PlantCareKits";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-14 border-b flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <h1 className="font-semibold">Plant Care Platform</h1>
                  </div>
                  <GlobalSearch />
                </header>
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/plant-guide" element={<PlantGuide />} />
                    <Route path="/plant-identification" element={<PlantIdentificationPage />} />
                    <Route path="/plant-calendar" element={<PlantCalendar />} />
                    <Route path="/my-garden" element={<MyGarden />} />
                    <Route path="/plant-matchmaker" element={<PlantMatchmaker />} />
                    <Route path="/growing-programs" element={<GrowingPrograms />} />
                    <Route path="/plant-doctor" element={<PlantDoctor />} />
                    <Route path="/community-marketplace" element={<CommunityMarketplace />} />
                    <Route path="/ar-garden" element={<ARGarden />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/shopping-assistant" element={<ShoppingAssistant />} />
                    <Route path="/regional-intelligence" element={<RegionalIntelligence />} />
                    <Route path="/sustainability-features" element={<SustainabilityFeatures />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                    <Route path="/plant-wishlist" element={<PlantWishlist />} />
                    <Route path="/transformation-gallery" element={<TransformationGallery />} />
                    <Route path="/propagation-guides" element={<PropagationGuides />} />
                    <Route path="/seasonal-planting" element={<SeasonalPlanting />} />
                    <Route path="/affiliate-store" element={<AffiliateStore />} />
                    <Route path="/virtual-workshops" element={<VirtualWorkshops />} />
                    <Route path="/plant-care-kits" element={<PlantCareKits />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
            <SupportChatbot />
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
