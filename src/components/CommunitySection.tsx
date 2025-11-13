import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Youtube, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";

type CommunitySectionProps = {
  showTitle?: boolean;
};

const CommunitySection = ({ showTitle = true }: CommunitySectionProps) => {
  const { t } = useLanguage();
  const { links } = useSocialLinks();
  
  return (
    <section className="py-20 px-4 bg-card/30">
      <div className="container mx-auto max-w-4xl text-center">
        {showTitle && (
          <>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t.community.section.title}
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t.community.section.description}
            </p>
          </>
        )}
        
        <div className={`grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto ${showTitle ? "" : "mt-4"}`}>
          <Button 
            variant="social" 
            size="lg"
            asChild
            className="w-full justify-start"
          >
            <a 
              href={links.discord || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Discord Community</span>
            </a>
          </Button>
          
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
    </section>
  );
};

export default CommunitySection;
