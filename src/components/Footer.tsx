import { useLanguage } from "@/contexts/LanguageContext";
import { useBrandText } from "@/hooks/useBrandText";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { Link } from "react-router-dom";
import { MessageCircle, Youtube, Instagram, Twitter, Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Footer = () => {
  const { t } = useLanguage();
  const { text } = useBrandText();
  const { links } = useSocialLinks();
  
  const currentYear = new Date().getFullYear();
  
  // Diviser le nom de la marque en deux parties (JUNI et BONUS)
  const brandName = text?.brandName || "JUNIBONUS";
  const brandParts = brandName.split(/(?=[A-Z])/);
  const brandFirst = brandParts[0] || "JUNI";
  const brandSecond = brandParts.slice(1).join("") || "BONUS";
  
  return (
    <footer className="bg-card/50 border-t border-border/50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Main Footer Content - 3 Columns */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Brand and Social */}
          <div className="space-y-4">
            {/* Brand Name */}
            <div>
              <h2 className="text-2xl font-bold">
                <span className="text-foreground">{brandFirst}</span>
                <span className="text-primary">{brandSecond}</span>
              </h2>
            </div>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              Participe au streams, gagne des points puis ouvres des boosters ou offre toi les meilleurs items de la boutique !
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              {links.discord && (
                <a
                  href={links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border border-border/50 hover:border-primary/50"
                  title="Discord"
                >
                  <MessageCircle className="w-5 h-5 text-foreground" />
                </a>
              )}
              {links.youtube && (
                <a
                  href={links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border border-border/50 hover:border-primary/50"
                  title="YouTube"
                >
                  <Youtube className="w-5 h-5 text-foreground" />
                </a>
              )}
              {(links as any).instagram && (
                <a
                  href={(links as any).instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border border-border/50 hover:border-primary/50"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5 text-foreground" />
                </a>
              )}
              {links.twitter && (
                <a
                  href={links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border border-border/50 hover:border-primary/50"
                  title="Twitter/X"
                >
                  <Twitter className="w-5 h-5 text-foreground" />
                </a>
              )}
              {links.dlive && (
                <a
                  href={links.dlive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border border-border/50 hover:border-primary/50"
                  title="DLive"
                >
                  <Send className="w-5 h-5 text-foreground" />
                </a>
              )}
              {/* Canada Flag */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border border-border/50 hover:border-primary/50 cursor-default overflow-hidden">
                      <img 
                        src="/Flag_of_Canada.png" 
                        alt="Drapeau du Canada" 
                        className="w-7 h-7 object-contain pointer-events-none select-none"
                        draggable="false"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Français (Canada)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Middle Column - Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Navigation</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Accueil
              </Link>
              <Link to="/videos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Vidéos
              </Link>
              <Link to="/bonuslist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Bonus
              </Link>
              <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          
          {/* Right Column - Other */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Autres</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/responsible-gaming" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Jeu responsable
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Bottom Section - Copyright and Disclaimer */}
        <div className="border-t border-border/50 pt-6 space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            © {currentYear} {brandName}. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
            Les jeux présentés sur ce site sont fictifs et ne contiennent pas d'argent réel. Ce site est destiné uniquement à des fins de divertissement et d'information.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
