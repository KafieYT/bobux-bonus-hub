import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Gift, Users } from "lucide-react";

const Tirage = () => {
  const { t } = useLanguage();
  const [pseudoGamba, setPseudoGamba] = useState("");
  const [pseudoDiscord, setPseudoDiscord] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    if (!pseudoGamba.trim() || !pseudoDiscord.trim()) {
      setMessage(t.tirage.errors.fillAll);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/participer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudoGamba: pseudoGamba.trim(), pseudoDiscord: pseudoDiscord.trim() }),
      });

      const data = await res.json();
      if (data.error) {
        setMessage("⚠️ " + data.error);
      } else {
        setMessage("✅ " + t.tirage.success);
        setPseudoGamba("");
        setPseudoDiscord("");
      }
    } catch (e) {
      setMessage("❌ " + t.tirage.errors.connection);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen gradient-hero">
        <div className="container mx-auto max-w-2xl">
          <Card className="gradient-card border-2 border-border/50 glass-blur">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Gift className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
                {t.tirage.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t.tirage.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder={t.tirage.form.gambaPlaceholder}
                  value={pseudoGamba}
                  onChange={(e) => setPseudoGamba(e.target.value)}
                  className="text-center"
                  disabled={isLoading}
                />
                <Input
                  type="text"
                  placeholder={t.tirage.form.discordPlaceholder}
                  value={pseudoDiscord}
                  onChange={(e) => setPseudoDiscord(e.target.value)}
                  className="text-center"
                  disabled={isLoading}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? t.tirage.loading : t.tirage.participate}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.href = "/tirage/liste"}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-5 w-5" />
                    {t.tirage.viewParticipants}
                  </Button>
                </div>
              </form>

              {message && (
                <div
                  className={`mt-6 text-sm font-medium ${
                    message.startsWith("✅")
                      ? "text-primary"
                      : message.startsWith("⚠️")
                      ? "text-yellow-500"
                      : "text-destructive"
                  }`}
                >
                  {message}
                </div>
              )}

              <footer className="mt-8 text-sm text-muted-foreground">
                {t.tirage.disclaimer}
              </footer>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tirage;







