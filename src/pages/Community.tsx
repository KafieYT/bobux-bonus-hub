import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Zap, Gift, Bell, MessageCircle, Send, Youtube, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";

const Community = () => {
  const { t } = useLanguage();
  const { links } = useSocialLinks();
  
  const benefits = [
    {
      icon: Bell,
      title: t.community.benefits.alerts.title,
      description: t.community.benefits.alerts.description,
    },
    {
      icon: Gift,
      title: t.community.benefits.codes.title,
      description: t.community.benefits.codes.description,
    },
    {
      icon: Users,
      title: t.community.benefits.active.title,
      description: t.community.benefits.active.description,
    },
    {
      icon: Zap,
      title: t.community.benefits.support.title,
      description: t.community.benefits.support.description,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen gradient-hero">
        <div className="container mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
              {t.community.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              {t.community.description}
            </p>
            
            {/* Community Links */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {links.discord && (
                <Button 
                  variant="social" 
                  size="lg"
                  asChild
                  className="w-full justify-start"
                >
                  <a 
                    href={links.discord} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Discord Community</span>
                  </a>
                </Button>
              )}
              
              {links.dlive && (
                <Button 
                  variant="social" 
                  size="lg"
                  asChild
                  className="w-full justify-start"
                >
                  <a 
                    href={links.dlive} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <Send className="h-5 w-5" />
                    <span>Dlive Channel</span>
                  </a>
                </Button>
              )}
              
              {links.youtube && (
                <Button 
                  variant="social" 
                  size="lg"
                  asChild
                  className="w-full justify-start"
                >
                  <a 
                    href={links.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <Youtube className="h-5 w-5" />
                    <span>YouTube Channel</span>
                  </a>
                </Button>
              )}
              
              {links.twitter && (
                <Button 
                  variant="social" 
                  size="lg"
                  asChild
                  className="w-full justify-start"
                >
                  <a 
                    href={links.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <Twitter className="h-5 w-5" />
                    <span>Twitter / X</span>
                  </a>
                </Button>
              )}
              
              {links.telegram && (
                <Button 
                  variant="social" 
                  size="lg"
                  asChild
                  className="w-full justify-start"
                >
                  <a 
                    href={links.telegram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <Send className="h-5 w-5" />
                    <span>Telegram</span>
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all duration-300 group">
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-foreground">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "10K+", label: t.community.stats.members },
              { number: "500+", label: t.community.stats.bonuses },
              { number: "24/7", label: t.community.stats.support },
              { number: "100%", label: t.community.stats.free },
            ].map((stat, index) => (
              <div key={index} className="text-center glass-blur border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-all">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
