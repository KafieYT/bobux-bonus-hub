import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Coins, Mail, Clock, MapPin, Shield, User, ExternalLink } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";
import { Link } from "react-router-dom";

interface LoginHistory {
  ip: string;
  date: string;
}

interface UserProfile {
  id: string;
  username: string;
  global_name?: string;
  email: string;
  avatar?: string;
  points: number;
  roles: string[];
  loginHistory: LoginHistory[];
  createdAt: string;
  updatedAt: string;
}

interface UserProfileMenuProps {
  user: {
    id: string;
    username: string;
    global_name?: string;
    avatar?: string;
  };
}

const UserProfileMenu = ({ user }: UserProfileMenuProps) => {
  const { points } = usePoints();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showIps, setShowIps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const blurEmail = (email: string) => {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    const visibleChars = Math.max(1, Math.floor(local.length * 0.3));
    const blurred = local.slice(0, visibleChars) + "•".repeat(local.length - visibleChars);
    return `${blurred}@${domain}`;
  };

  const blurIp = (ip: string) => {
    if (!ip) return "";
    const parts = ip.split(".");
    if (parts.length !== 4) return ip;
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  };

  const toggleShowIp = (index: number) => {
    setShowIps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Erreur lors du chargement du profil</p>
      </div>
    );
  }

  return (
    <div className="w-80 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/50">
        <Avatar>
          <AvatarImage
            src={profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined}
          />
          <AvatarFallback>
            {profile.username?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-bold text-foreground">{profile.global_name || profile.username}</p>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      {/* Link to Profile Page */}
      <Link to="/profile" className="block">
        <Button variant="outline" className="w-full justify-start gap-2 mb-4">
          <ExternalLink className="w-4 h-4" />
          Voir mon profil complet
        </Button>
      </Link>

      {/* Points */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="w-4 h-4" />
          <span>Points</span>
        </div>
        <p className="text-2xl font-bold text-primary">
          {points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </div>
          <button
            onClick={() => setShowEmail(!showEmail)}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {showEmail ? (
              <div className="flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                <span>Masquer</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Afficher</span>
              </div>
            )}
          </button>
        </div>
        <p className="text-sm font-mono text-foreground">
          {showEmail ? profile.email : blurEmail(profile.email)}
        </p>
      </div>

      {/* Rôles */}
      {profile.roles && profile.roles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Rôles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.roles.map(role => (
              <Badge
                key={role}
                variant={role === "ADMIN" ? "destructive" : "secondary"}
                className={
                  role === "ADMIN"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                }
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Dernières connexions */}
      {profile.loginHistory && profile.loginHistory.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Dernières connexions</span>
          </div>
          <div className="space-y-2">
            {profile.loginHistory.slice(-2).reverse().map((login, index) => {
              const originalIndex = profile.loginHistory.length - 1 - index;
              const isVisible = showIps[originalIndex];
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="font-mono">{isVisible ? login.ip : blurIp(login.ip)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(login.date).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleShowIp(originalIndex)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors p-1"
                    title={isVisible ? "Masquer l'IP" : "Afficher l'IP"}
                  >
                    {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date de création */}
      <div className="pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Membre depuis le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  );
};

export default UserProfileMenu;

