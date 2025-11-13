import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, CreditCard, TrendingUp, ShoppingBag, Box } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { MessageCircle, Youtube, Instagram, Twitter, Send } from "lucide-react";

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

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  url: string;
}

const Home = () => {
  const { t } = useLanguage();
  const { links } = useSocialLinks();
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const features = [
    {
      id: 1,
      name: "Blackjack",
      icon: CreditCard,
      path: "/games/blackjack",
      description: "Jouez au Blackjack et testez votre chance",
    },
    {
      id: 2,
      name: "Plinko",
      icon: TrendingUp,
      path: "/games/plinko",
      description: "Lancez la bille et gagnez des points",
    },
    {
      id: 3,
      name: "Boutique",
      icon: ShoppingBag,
      path: "/boutique",
      description: "Échangez vos points contre des récompenses",
    },
    {
      id: 4,
      name: "Bonus Hunt",
      icon: Box,
      path: "/bonus-hunt",
      description: "Créez et partagez vos Bonus Hunts",
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load bonuses
        const bonusesRes = await fetch("/api/bonus");
        const bonusesData = await bonusesRes.json();
        setBonuses((bonusesData.bonuses || []).slice(0, 3)); // Top 3 bonuses
        
        // Load videos
        const videosRes = await fetch("/api/videos");
        const videosData = await videosRes.json();
        setVideos((videosData.videos || []).slice(0, 3)); // Top 3 videos
      } catch (e) {
        console.error("Erreur chargement données:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        
        {/* Bonus Selection Section */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">NOTRE SELECTION DE </span>
                <span className="text-primary">BONUS CASINO</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Découvrez nos partenaires exclusifs et leurs offres spéciales.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Chargement...
              </div>
            ) : bonuses.length > 0 ? (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {bonuses.map((bonus) => (
                    <Card key={bonus.id} className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all">
                      <CardHeader>
                        <h3 className="text-xl font-bold text-foreground">{bonus.platform}</h3>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-primary mb-2">100%</div>
                          <div className="text-lg text-primary font-semibold">
                            JUSQU'A {bonus.title.toUpperCase().includes("€") ? bonus.title : "5000€"}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-primary">20%</div>
                            <div className="text-xs text-muted-foreground">DE CASHBACK</div>
                          </div>
                          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-primary">50FS</div>
                            <div className="text-xs text-muted-foreground">FREE SPINS</div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg"
                          asChild
                        >
                          <a href={bonus.link} target="_blank" rel="noopener noreferrer">
                            Récupérer le bonus
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => window.location.href = "/bonuslist"}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-lg"
                  >
                    Voir tous les bonus
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {/* Exclusive Features Section */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">DIVERSES FONCTIONNALITÉS </span>
                <span className="text-primary">EXCLUSIVES</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Explorez nos jeux originaux, boosters et fonctionnalités uniques.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.id}
                    to={feature.path}
                    className="block"
                  >
                    <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all overflow-hidden group aspect-square cursor-pointer">
                      <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
                        <div className="mb-4">
                          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-12 h-12 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Latest Videos Section */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">LES DERNIERES </span>
                <span className="text-primary">VIDÉOS</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Découvrez les dernières vidéos quotidiennes et ne manquez rien de l'action.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Chargement...
              </div>
            ) : videos.length > 0 ? (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {videos.map((video) => (
                    <a
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all overflow-hidden group">
                        <div className="aspect-video relative bg-muted overflow-hidden">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center">
                              <Play className="h-8 w-8 text-foreground fill-foreground ml-1" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                            {video.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => window.location.href = "/videos"}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-lg"
                  >
                    Voir toutes les vidéos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {/* Social Media Section */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">SUIVEZ-MOI SUR LES </span>
                <span className="text-primary">RÉSEAUX SOCIAUX</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Rejoignez la communauté et restez connecté sur tous les réseaux.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
              {links.dlive && (
                <a
                  href={links.dlive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-[140px]"
                >
                  <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer group h-full">
                    <CardContent className="p-6 text-center">
                      <Send className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-foreground font-semibold">DLive</p>
                    </CardContent>
                  </Card>
                </a>
              )}
              {links.youtube && (
                <a
                  href={links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-[140px]"
                >
                  <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer group h-full">
                    <CardContent className="p-6 text-center">
                      <Youtube className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-foreground font-semibold">YouTube</p>
                    </CardContent>
                  </Card>
                </a>
              )}
              {(links as any).instagram && (
                <a
                  href={(links as any).instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-[140px]"
                >
                  <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer group h-full">
                    <CardContent className="p-6 text-center">
                      <Instagram className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-foreground font-semibold">Instagram</p>
                    </CardContent>
                  </Card>
                </a>
              )}
              {links.twitter && (
                <a
                  href={links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-[140px]"
                >
                  <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer group h-full">
                    <CardContent className="p-6 text-center">
                      <Twitter className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-foreground font-semibold">X</p>
                    </CardContent>
                  </Card>
                </a>
              )}
              {links.discord && (
                <a
                  href={links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-[140px]"
                >
                  <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer group h-full">
                    <CardContent className="p-6 text-center">
                      <MessageCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-foreground font-semibold">Discord</p>
                    </CardContent>
                  </Card>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
