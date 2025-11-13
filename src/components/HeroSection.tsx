import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { useBrandText } from "@/hooks/useBrandText";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { t } = useLanguage();
  const { links } = useSocialLinks();
  const { text } = useBrandText();
  const navigate = useNavigate();
  
  // Diviser le nom de la marque en deux parties (JUNI et BONUS)
  const brandName = text?.brandName || "JUNIBONUS";
  const brandParts = brandName.split(/(?=[A-Z])/);
  const brandFirst = brandParts[0] || "JUNI";
  const brandSecond = brandParts.slice(1).join("") || "BONUS";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[200px] opacity-50" />
      </div>
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Stream Status Badge - Top Left */}
          <div className="absolute top-8 left-4 md:left-8">
            <div className="px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-sm text-muted-foreground">Stream Hors Ligne</span>
              </div>
            </div>
          </div>
          
          {/* Main Content - Centered */}
          <div className="text-center space-y-6 pt-20">
            {/* Brand Title */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-foreground">{brandFirst}</span>
              <span className="text-primary ml-2">{brandSecond}</span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Participe au streams, gagne des points puis ouvres des boosters ou offre toi les meilleurs items de la boutique !
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => window.open(links.joinCommunity || links.discord || "#", "_blank")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-base rounded-lg shadow-lg"
              >
                Rejoindre la communauté
              </Button>
              <Button
                onClick={() => navigate("/bonuslist")}
                variant="outline"
                className="bg-muted hover:bg-muted/80 text-foreground font-bold px-8 py-6 text-base rounded-lg border-border/50"
              >
                Découvrir les bonus
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Scroll Indicator - Bottom Center */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
