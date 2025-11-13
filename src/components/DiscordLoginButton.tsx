import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { RefreshCw, Shield } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserProfileMenu from "./UserProfileMenu";

interface DiscordUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  discriminator: string;
  points?: number;
}

const DiscordLoginButton = () => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(false);
  const { points, refreshPoints, loading: pointsLoading } = usePoints();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Important pour envoyer les cookies
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser({ ...data.user, points }); // Utiliser les points du hook
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const handleRefreshPoints = async () => {
    await refreshPoints();
    // Mettre à jour les points de l'utilisateur après actualisation
    if (user) {
      setUser({ ...user, points });
    }
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    checkAuth();
    
    // Vérifier si on revient d'une authentification Discord
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("discord_auth") === "success") {
      checkAuth();
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Synchroniser les points quand ils changent
  useEffect(() => {
    if (user) {
      setUser((prevUser) => prevUser ? { ...prevUser, points } : null);
    }
  }, [points]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = () => {
    setLoading(true);
    // Rediriger vers l'endpoint OAuth Discord
    window.location.href = "/api/auth/discord";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
              {user.avatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt={user.username}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
              )}
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-foreground leading-tight whitespace-nowrap">
                  {user.username}
                </span>
                <span className="text-xs text-primary font-bold">
                  {pointsLoading ? "..." : `${points || 0} pts`}
                </span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <UserProfileMenu user={user} />
          </PopoverContent>
        </Popover>
        <Button
          onClick={handleRefreshPoints}
          size="sm"
          variant="outline"
          className="text-xs px-2"
          disabled={pointsLoading}
          title="Actualiser les points"
        >
          <RefreshCw className={`w-3 h-3 ${pointsLoading ? 'animate-spin' : ''}`} />
        </Button>
        {isAdmin && (
          <Button
            onClick={() => navigate("/admin")}
            size="icon"
            className="bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-sm w-8 h-8"
            title="Panel Administrateur"
          >
            <Shield className="w-4 h-4" />
          </Button>
        )}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Déconnexion
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      className="bg-[#FFE500] hover:bg-[#FFD700] text-black font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
      {loading ? "Connexion..." : "Connexion"}
    </Button>
  );
};

export default DiscordLoginButton;

