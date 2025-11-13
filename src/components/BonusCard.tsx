import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface BonusCardProps {
  title: string;
  subtitle: string;
  buttonText: string;
  glowColor: "green" | "cyan";
  href: string;
}

const BonusCard = ({ title, subtitle, buttonText, glowColor, href }: BonusCardProps) => {
  const glowClass = glowColor === "green" ? "glow-green hover:glow-card" : "glow-cyan";
  
  return (
    <Card 
      className={`gradient-card border-2 border-border/50 transition-all duration-500 hover:scale-105 hover:border-primary ${glowClass} group`}
    >
      <CardHeader className="text-center pb-4">
        <h3 className={`text-5xl md:text-6xl font-bold ${glowColor === "green" ? "text-primary" : "text-secondary"}`}>
          {title}
        </h3>
      </CardHeader>
      
      <CardContent className="text-center pb-6">
        <p className="text-lg text-muted-foreground">
          {subtitle}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-center pb-6">
        <Button 
          variant={glowColor === "green" ? "hero" : "bonus"}
          size="lg"
          asChild
          className="w-full max-w-xs"
        >
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            {buttonText}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BonusCard;
