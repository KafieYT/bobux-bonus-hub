import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Home from "./pages/Home";
import Bonuslist from "./pages/Bonuslist";
import Videos from "./pages/Videos";
import Community from "./pages/Community";
import Tirage from "./pages/Tirage";
import TirageListe from "./pages/TirageListe";
import TirageAdmin from "./pages/TirageAdmin";
import Admin from "./pages/Admin";
import AdminStats from "./pages/AdminStats";
import CallAdmin from "./pages/CallAdmin";
import OrdersAdmin from "./pages/OrdersAdmin";
import ContentAdmin from "./pages/ContentAdmin";
import AdminWagerRace from "./pages/AdminWagerRace";
import AdminGiveaways from "./pages/AdminGiveaways";
import AdminRoles from "./pages/AdminRoles";
import AdminCoupons from "./pages/AdminCoupons";
import ResponsibleGaming from "./pages/ResponsibleGaming";
import BonusHunt from "./pages/BonusHunt";
import HuntDetails from "./pages/HuntDetails";
import HuntAdmin from "./pages/HuntAdmin";
import Boosters from "./pages/Boosters";
import Call from "./pages/Call";
import Boutique from "./pages/Boutique";
import Giveaways from "./pages/Giveaways";
import BlackjackTableau from "./pages/BlackjackTableau";
import Games from "./pages/Games";
import Blackjack from "./pages/Blackjack";
import Plinko from "./pages/Plinko";
import CoinFlip from "./pages/CoinFlip";
import Limbo from "./pages/Limbo";
import RockPaperScissors from "./pages/RockPaperScissors";
import War from "./pages/War";
import WagerRace from "./pages/WagerRace";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bonuslist" element={<Bonuslist />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/community" element={<Community />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/blackjack" element={<Blackjack />} />
            <Route path="/games/plinko" element={<Plinko />} />
            <Route path="/games/coinflip" element={<CoinFlip />} />
            <Route path="/games/limbo" element={<Limbo />} />
            <Route path="/games/rockpaperscissors" element={<RockPaperScissors />} />
            <Route path="/games/war" element={<War />} />
            <Route path="/games/wager-race" element={<WagerRace />} />
            <Route path="/tirage" element={<Tirage />} />
            <Route path="/tirage/liste" element={<TirageListe />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/tirage" element={<TirageAdmin />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/admin/calls" element={<CallAdmin />} />
            <Route path="/admin/orders" element={<OrdersAdmin />} />
            <Route path="/admin/content" element={<ContentAdmin />} />
            <Route path="/admin/wager-race" element={<AdminWagerRace />} />
            <Route path="/admin/giveaways" element={<AdminGiveaways />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
            <Route path="/bonus-hunt" element={<BonusHunt />} />
            <Route path="/bonus-hunt/:id" element={<HuntDetails />} />
            <Route path="/boosters" element={<Boosters />} />
            <Route path="/call" element={<Call />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/giveaways" element={<Giveaways />} />
            <Route path="/blackjack-tableau" element={<BlackjackTableau />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/hunts" element={<HuntAdmin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
