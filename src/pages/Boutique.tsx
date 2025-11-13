import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ShoppingCart, Headphones, Crown, Gift, Shirt, Package, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface RewardItem {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  image?: string;
  icon?: string;
  color?: string;
}

const Boutique = () => {
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (item: RewardItem) => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Veuillez vous connecter avec Discord pour effectuer un achat",
        variant: "destructive",
      });
      window.location.href = "/api/auth/discord";
      return;
    }

    if (!item.inStock) {
      toast({
        title: "Article indisponible",
        description: "Cet article n'est plus en stock",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          itemId: item.id,
          itemName: item.name,
          itemCategory: item.category,
          price: item.price,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Commande créée !",
          description: `Votre commande pour "${item.name}" a été créée. Un admin va la traiter prochainement.`,
        });
        // Les points seront mis à jour automatiquement via le hook useAuth
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de créer la commande",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "Tout", icon: ShoppingCart },
    { id: "song-request", label: "Song Request", icon: Headphones },
    { id: "tips-casino", label: "Tips Casino", icon: Crown },
    { id: "carte-cadeau", label: "Carte cadeau", icon: Gift },
    { id: "merch", label: "Merch", icon: Shirt },
    { id: "objets-physiques", label: "Objets Physiques", icon: Package },
  ];

  // Données d'exemple - à remplacer par des données réelles
  const rewards: RewardItem[] = [
    {
      id: "1",
      name: "Song Request",
      category: "song-request",
      price: 50,
      inStock: true,
      icon: "music",
      color: "red",
    },
    {
      id: "2",
      name: "Carte cadeau Gamba 20€",
      category: "carte-cadeau",
      price: 200,
      inStock: true,
      icon: "gift",
      color: "green",
    },
    {
      id: "3",
      name: "Carte cadeau WINNINGZ 20€",
      category: "carte-cadeau",
      price: 200,
      inStock: true,
      icon: "gift",
      color: "green",
    },
  ];

  const filteredRewards = selectedCategory === "all" 
    ? rewards 
    : rewards.filter(item => item.category === selectedCategory);

  const stats = {
    categories: categories.length - 1, // Exclure "Tout"
    articles: rewards.length,
    inStock: rewards.filter(r => r.inStock).length,
    minPrice: rewards.length > 0 ? Math.min(...rewards.map(r => r.price)) : 0,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 px-4 min-h-screen flex items-center justify-center">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 px-4 min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full gradient-card border-2 border-border/50 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground text-center mb-8">
                Connexion
              </h2>
              <Button
                onClick={() => window.location.href = "/api/auth/discord"}
                className="w-full h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white text-base font-semibold rounded-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Se connecter avec Discord</span>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Banner */}
          <div className="relative mb-8 rounded-lg overflow-hidden">
            <div 
              className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, rgba(158, 74%, 54%, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(190, 100%, 50%, 0.3) 0%, transparent 50%)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-start px-8 md:px-12">
                <div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                    <span className="text-white">TRANSFORMEZ VOS </span>
                    <span className="text-[#FFE500]">POINTS</span>
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                    Découvrez notre sélection d'articles exclusifs et de services personnalisés
                  </p>
                </div>
              </div>
              {/* Decorative element - 25€ badge */}
              <div className="absolute top-4 right-4 md:top-8 md:right-8">
                <div className="bg-[#FFE500] text-black px-4 py-2 rounded-lg font-bold text-lg">
                  25€
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="gradient-card border-2 border-border/50 bg-muted/50">
              <CardContent className="p-6 text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#FFE500] mb-2">
                  {stats.categories}
                </div>
                <div className="text-sm text-muted-foreground">Catégories</div>
              </CardContent>
            </Card>
            <Card className="gradient-card border-2 border-border/50 bg-muted/50">
              <CardContent className="p-6 text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#FFE500] mb-2">
                  {stats.articles}
                </div>
                <div className="text-sm text-muted-foreground">Articles</div>
              </CardContent>
            </Card>
            <Card className="gradient-card border-2 border-border/50 bg-muted/50">
              <CardContent className="p-6 text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#FFE500] mb-2">
                  {stats.inStock}
                </div>
                <div className="text-sm text-muted-foreground">En stock</div>
              </CardContent>
            </Card>
            <Card className="gradient-card border-2 border-border/50 bg-muted/50">
              <CardContent className="p-6 text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#FFE500] mb-2">
                  {stats.minPrice}
                </div>
                <div className="text-sm text-muted-foreground">Prix min.</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={isActive ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    isActive
                      ? "bg-[#FFE500] hover:bg-[#FFD700] text-black border-[#FFE500]"
                      : "bg-muted/50 hover:bg-muted border-border/50 text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Aucun article disponible dans cette catégorie
              </div>
            ) : (
              filteredRewards.map((item) => (
                <Card
                  key={item.id}
                  className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all hover:scale-105 overflow-hidden group"
                >
                  <CardContent className="p-0">
                    {/* Item Image/Icon Area */}
                    <div 
                      className={`relative h-48 ${
                        item.color === "red" 
                          ? "bg-gradient-to-br from-red-500/20 to-red-600/30"
                          : item.color === "green"
                          ? "bg-gradient-to-br from-green-500/20 to-green-600/30"
                          : "bg-gradient-to-br from-primary/20 to-secondary/20"
                      }`}
                      style={{
                        backgroundImage: item.color === "red" || item.color === "green"
                          ? "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)"
                          : undefined,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {item.icon === "music" && (
                          <div className="relative">
                            <Music className="h-24 w-24 text-red-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-16 w-16 bg-red-500/20 rounded-full blur-xl"></div>
                            </div>
                          </div>
                        )}
                        {item.icon === "gift" && (
                          <div className="relative">
                            <div className="bg-green-600/80 backdrop-blur-sm rounded-lg p-6 border-2 border-green-400/50">
                              <div className="text-white font-bold text-xl mb-2">
                                {item.name.includes("Gamba") ? "Gamba" : "WINNINGZ"}
                              </div>
                              <div className="text-white text-2xl font-bold">20€</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-foreground mb-2">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-[#FFE500]">
                          {item.price} pts
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={!item.inStock || loading || !user}
                          onClick={() => handlePurchase(item)}
                        >
                          {loading ? "Traitement..." : item.inStock ? "Échanger" : "Rupture"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Boutique;
