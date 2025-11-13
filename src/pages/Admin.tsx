import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Trophy, FileText, Box, Settings, Shield, BarChart3, Phone, ShoppingBag, Coins, TrendingUp, Gift, Users, Ticket } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };
    checkAuth();
  }, []);

  const adminFeatures = [
    {
      title: "Tirage",
      description: "Gérer les inscriptions et le tirage Bonus Hunt",
      icon: Trophy,
      path: "/admin/tirage",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Contenu",
      description: "Gérer les vidéos, bonus et contenu du site",
      icon: FileText,
      path: "/admin/content",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Bonus Hunts",
      description: "Gérer et supprimer les Bonus Hunts des joueurs",
      icon: Box,
      path: "/admin/hunts",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Calls",
      description: "Valider les calls et attribuer des points",
      icon: Phone,
      path: "/admin/calls",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Boutique",
      description: "Gérer les commandes et attribuer les lots",
      icon: ShoppingBag,
      path: "/admin/orders",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Statistiques",
      description: "Voir les statistiques et analyses du site",
      icon: BarChart3,
      path: "/admin/stats",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Wager Race",
      description: "Suivre les mises et valider les récompenses mensuelles",
      icon: TrendingUp,
      path: "/admin/wager-race",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Giveaways",
      description: "Créer et gérer les giveaways, sélectionner les gagnants",
      icon: Gift,
      path: "/admin/giveaways",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "INFORMATION joueurs",
      description: "Voir les informations, ajouter des points et gérer les rôles",
      icon: Users,
      path: "/admin/roles",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Coupons Bonus",
      description: "Créer et gérer les coupons pour distribuer des points",
      icon: Ticket,
      path: "/admin/coupons",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  if (adminLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center py-16">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Shield className="w-12 h-12 text-destructive mx-auto" />
                  <h2 className="text-2xl font-bold">Accès refusé</h2>
                  <p className="text-muted-foreground">
                    Vous devez être administrateur pour accéder à cette page.
                  </p>
                  {!user && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Veuillez vous connecter avec un compte Discord administrateur.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Administration
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Gestion de toutes les fonctionnalités du site
            </p>
            {user && (
              <p className="text-sm text-muted-foreground mt-2">
                Connecté en tant que <span className="font-semibold text-foreground">{user.global_name || user.username}</span>
              </p>
            )}
          </div>

          {/* Admin Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {adminFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.path}
                  className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                  onClick={() => navigate(feature.path)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-primary text-sm font-medium group-hover:underline">
                      Accéder →
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="gradient-card border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Utilisez les cartes ci-dessus pour accéder aux différentes sections d'administration.</p>
                  <p>• Toutes les actions effectuées sont enregistrées et peuvent être consultées dans l'historique.</p>
                  <p>• Assurez-vous d'être connecté avec un compte Discord administrateur pour accéder à ces fonctionnalités.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;

