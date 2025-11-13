import { Button } from "@/components/ui/button";
import { Home, Gift, Trophy, Grid3x3, Box, Video, Wrench, Menu, X, ChevronDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBrandText } from "@/hooks/useBrandText";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DiscordLoginButton from "@/components/DiscordLoginButton";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { links } = useSocialLinks();
  const { text } = useBrandText();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Accueil", icon: Home, hasDropdown: false },
    { to: "/bonuslist", label: "Bonus", icon: Gift, hasDropdown: false },
    { to: "/recompenses", label: "Récompenses", icon: Trophy, hasDropdown: true },
    { to: "/games", label: "Jeux", icon: Grid3x3, hasDropdown: true },
    { to: "/boosters", label: "Boosters", icon: Box, hasDropdown: false },
    { to: "/stream", label: "Stream", icon: Video, hasDropdown: true },
    { to: "/outils", label: "Outils", icon: Wrench, hasDropdown: true },
  ];

  const gamesLinks = [
    { to: "/games/blackjack", label: t.nav.gamesBlackjack },
    { to: "/games/plinko", label: t.nav.gamesPlinko },
    { to: "/games/wager-race", label: "Wager Race" },
  ];

  const streamLinks = [
    { to: "/bonus-hunt", label: "Bonus Hunt" },
    { to: "/call", label: "CALL" },
  ];

  const recompensesLinks = [
    { to: "/boutique", label: "Boutique" },
    { to: "/giveaways", label: "Giveaways" },
  ];

  const outilsLinks = [
    { to: "/tirage", label: "Tirage" },
    { to: "/blackjack-tableau", label: "Tableau BlackJack" },
  ];

  const isGamesActive =
    location.pathname.startsWith("/games");

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="hover:no-underline flex-shrink-0 group">
            <div className="relative inline-block">
              {/* Glow effect behind */}
              <div className="absolute inset-0 blur-xl opacity-60 -z-10">
                <span className="text-white text-2xl md:text-3xl font-extrabold tracking-tighter">JUNI</span>
                <span className="text-[#00D9FF] text-2xl md:text-3xl font-extrabold tracking-tighter">BONUS</span>
              </div>
              {/* Main text with glow */}
              <div className="relative">
                <span 
                  className="text-white text-2xl md:text-3xl font-extrabold tracking-tighter transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  style={{
                    textShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.4)'
                  }}
                >
                  JUNI
                </span>
                <span 
                  className="text-[#00D9FF] text-2xl md:text-3xl font-extrabold tracking-tighter transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(0,217,255,0.9)]"
                  style={{
                    textShadow: '0 0 10px rgba(0,217,255,0.7), 0 0 20px rgba(0,217,255,0.5), 0 0 30px rgba(0,217,255,0.3)'
                  }}
                >
                  BONUS
                </span>
              </div>
            </div>
          </NavLink>
          
          {/* Desktop Navigation - Centré */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isGamesActiveLink = link.to === "/games" && isGamesActive;
              const isStreamActiveLink = link.to === "/stream" && (location.pathname === "/bonus-hunt" || location.pathname === "/call");
              const isRecompensesActiveLink = link.to === "/recompenses" && (location.pathname === "/boutique" || location.pathname === "/giveaways");
              const isOutilsActiveLink = link.to === "/outils" && (location.pathname === "/tirage" || location.pathname === "/blackjack-tableau");
              const isActive = location.pathname === link.to || isGamesActiveLink || isStreamActiveLink || isRecompensesActiveLink || isOutilsActiveLink;
              
              return link.hasDropdown ? (
                <DropdownMenu key={link.to}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? "text-foreground bg-accent" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{link.label}</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover/95 border border-border/50 backdrop-blur-sm">
                    {(link.to === "/games" 
                      ? gamesLinks 
                      : link.to === "/stream" 
                      ? streamLinks 
                      : link.to === "/recompenses"
                      ? recompensesLinks
                      : outilsLinks).map((item) => (
                      <DropdownMenuItem
                        key={item.to}
                        onSelect={(event) => {
                          event.preventDefault();
                          navigate(item.to);
                        }}
                        className="cursor-pointer text-sm"
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "text-foreground bg-accent" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right side - Discord Login Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <DiscordLoginButton />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border/50 pt-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return link.hasDropdown ? (
                  <div key={link.to} className="px-2 py-2 rounded-md bg-accent/20 border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" />
                      <p className="text-sm font-semibold text-primary">{link.label}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {(link.to === "/games" 
                        ? gamesLinks 
                        : link.to === "/stream" 
                        ? streamLinks 
                        : link.to === "/recompenses"
                        ? recompensesLinks
                        : outilsLinks).map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
                          activeClassName="text-primary bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2 rounded-md hover:bg-accent"
                    activeClassName="text-primary bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
