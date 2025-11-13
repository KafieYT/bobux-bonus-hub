import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Clock } from "lucide-react";

const Boosters = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
              BOOSTERS 🎴
            </h1>
            <p className="text-xl text-muted-foreground">
              Page en développement - Bientôt disponible
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="gradient-card border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-6 w-6 text-primary" />
                  Fonctionnalité à venir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cette page sera bientôt disponible avec de nouvelles fonctionnalités.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>En cours de développement</span>
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

export default Boosters;

