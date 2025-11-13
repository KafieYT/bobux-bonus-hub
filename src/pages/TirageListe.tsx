import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface Participant {
  pseudoGamba: string;
  pseudoDiscord: string;
  date: string;
}

const TirageListe = () => {
  const { t } = useLanguage();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      const res = await fetch("/api/liste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "KafieLEPlusBo" }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setParticipants(data.participants || []);
      }
    } catch (e) {
      setError(t.tirage.errors.connection);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl">
          <Card className="gradient-card border-2 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold">
                  {t.tirage.liste.title}
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/tirage"}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.tirage.back}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.tirage.loading}
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  {error}
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.tirage.liste.noParticipants}
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-foreground">
                          {i + 1}. {p.pseudoGamba}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {p.pseudoDiscord}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(p.date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TirageListe;












