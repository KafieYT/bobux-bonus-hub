import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertTriangle, Shield, Phone, Heart, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const ResponsibleGaming = () => {
  const { t } = useLanguage();
  
  const resources = [
    {
      icon: Phone,
      title: "Joueurs Info Service",
      description: "Service d'aide aux joueurs",
      contact: "09 74 75 13 13",
      url: "https://www.joueurs-info-service.fr/",
    },
    {
      icon: Heart,
      title: "SOS Joueurs",
      description: "Association d'aide aux joueurs pathologiques",
      contact: "support@sos-joueurs.fr",
      url: "https://www.sos-joueurs.fr/",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t.responsibleGaming.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t.responsibleGaming.subtitle}
            </p>
          </div>

          {/* Warning Box */}
          <Card className="mb-12 border-2 border-destructive/30 bg-destructive/5">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {t.responsibleGaming.warning.title}
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p className="text-lg">
                      {t.responsibleGaming.warning.addictive}
                    </p>
                    <p className="text-lg">
                      {t.responsibleGaming.warning.ageRestriction}
                    </p>
                    <p className="text-lg">
                      {t.responsibleGaming.warning.neverBeyond}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
              <Info className="h-8 w-8 text-primary" />
              {t.responsibleGaming.guidelines.title}
            </h2>
            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {t.responsibleGaming.guidelines.items.map((guideline, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-primary font-bold flex-shrink-0">✓</span>
                      <span className="text-muted-foreground">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Resources Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              {t.responsibleGaming.help.title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t.responsibleGaming.help.description}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Card key={index} className="gradient-card border-2 border-primary/30 hover:border-primary/50 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2 text-foreground">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                          <p className="text-primary font-bold mb-2">{resource.contact}</p>
                          <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80 underline"
                          >
                            {t.responsibleGaming.help.visit}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Self-Exclusion Info */}
          <Card className="glass-blur border-2 border-border/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                {t.responsibleGaming.selfExclusion.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t.responsibleGaming.selfExclusion.description}
              </p>
              <a 
                href="https://www.anj.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
              >
                {t.responsibleGaming.selfExclusion.learnMore}
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResponsibleGaming;
