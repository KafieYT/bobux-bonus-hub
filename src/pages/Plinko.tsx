import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PlinkoGame } from "@/components/games/PlinkoGame";
import { useLanguage } from "@/contexts/LanguageContext";
import { gamesCopy } from "@/data/gamesCopy";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Plinko = () => {
  const { language } = useLanguage();
  const content = gamesCopy[language];
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-20 flex items-center justify-center">
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
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
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
    <div className="min-h-screen">
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto max-w-6xl px-4 space-y-8">
          <PlinkoGame copy={content.plinko} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Plinko;

