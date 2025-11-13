import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { useState, useEffect } from "react";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  url: string;
}

const Videos = () => {
  const { t } = useLanguage();
  const { links } = useSocialLinks();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (e) {
        console.error("Erreur chargement vidéos:", e);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
              {t.videos.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t.videos.description}
            </p>
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t.tirage.loading}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune vidéo disponible
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                onClick={async () => {
                  // Enregistrer le clic de manière asynchrone (ne pas bloquer la navigation)
                  try {
                    await fetch(`/api/videos/${video.id}/click`, { method: "POST" });
                  } catch (e) {
                    // Ignorer les erreurs silencieusement
                  }
                }}
              >
                <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center glow-green">
                        <Play className="h-8 w-8 text-foreground fill-foreground ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-card/90 text-foreground border border-primary/20">
                      {video.category}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                  </CardContent>
                </Card>
              </a>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center glass-blur border border-border/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {t.videos.moreContent}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t.videos.subscribe}
            </p>
            <a
              href={links.youtube || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all hover:scale-105 glow-cyan">
                {t.videos.subscribeButton}
              </button>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
