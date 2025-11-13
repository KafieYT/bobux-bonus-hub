import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Filter, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Bonus {
  id: number;
  platform: string;
  title: string;
  description: string;
  category: "casino" | "sport" | "crypto";
  highlight: boolean;
  link: string;
  image?: string;
}

const Bonuslist = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBonuses = async () => {
      try {
        const res = await fetch("/api/bonus");
        const data = await res.json();
        setBonuses(data.bonuses || []);
      } catch (e) {
        console.error("Erreur chargement bonus:", e);
      } finally {
        setLoading(false);
      }
    };
    loadBonuses();
  }, []);

  const categories = [
    { value: "all", label: t.bonuslist.categories.all },
    { value: "casino", label: t.bonuslist.categories.casino },
    { value: "sport", label: t.bonuslist.categories.sport },
    { value: "crypto", label: t.bonuslist.categories.crypto },
  ];

  const filteredBonuses = selectedCategory === "all" 
    ? bonuses 
    : bonuses.filter(bonus => bonus.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12 space-y-6">
            {/* Badge BONUS EXCLUSIFS */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-card/50 border border-border/50">
                <Gift className="h-6 w-6 text-primary" />
                <span className="text-primary font-bold text-sm uppercase tracking-wide">
                  BONUS EXCLUSIFS
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight whitespace-nowrap">
              <span className="text-foreground">PROFITEZ DES MEILLEURS </span>
              <span className="text-primary">BONUS CASINOS</span>
            </h1>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-5 w-5" />
              <span className="text-sm font-medium">{t.bonuslist.filter}</span>
            </div>
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="hover:scale-105 transition-transform"
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Bonus Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t.tirage.loading}
            </div>
          ) : filteredBonuses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun bonus disponible
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBonuses.map((bonus) => (
              <Card 
                key={bonus.id} 
                className={`gradient-card border-2 transition-all duration-300 hover:scale-105 group ${
                  bonus.highlight 
                    ? "border-primary glow-green" 
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                <CardHeader>
                  {bonus.highlight && (
                    <Badge className="w-fit mb-2 bg-primary text-primary-foreground">
                      {t.bonuslist.exclusive}
                    </Badge>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-foreground">{bonus.platform}</h3>
                    <Badge variant="outline" className="uppercase text-xs">
                      {bonus.category}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {bonus.image && (
                    <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                      <img
                        src={bonus.image}
                        alt={bonus.platform}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  )}
                  <p className={`text-3xl font-bold mb-2 ${bonus.highlight ? "text-primary" : "text-secondary"}`}>
                    {bonus.title}
                  </p>
                  <p className="text-muted-foreground">{bonus.description}</p>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    variant={bonus.highlight ? "hero" : "secondary"}
                    className="w-full"
                    asChild
                  >
                    <a 
                      href={bonus.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                      onClick={async () => {
                        // Enregistrer le clic de manière asynchrone (ne pas bloquer la navigation)
                        try {
                          await fetch(`/api/bonus/${bonus.id}/click`, { method: "POST" });
                        } catch (e) {
                          // Ignorer les erreurs silencieusement
                        }
                      }}
                    >
                      {t.bonuslist.getBonus}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bonuslist;
