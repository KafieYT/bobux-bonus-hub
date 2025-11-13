import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Target, BarChart3, Download, Crown, HelpCircle, Spade } from "lucide-react";

const BlackjackTableau = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen">
        <div className="container mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="text-center mb-8 space-y-6">
            {/* Badge */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary bg-card/50">
                <Spade className="h-4 w-4 text-primary" />
                <span className="text-primary font-bold text-sm uppercase">BLACKJACK</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-primary">GUIDE </span>
              <span className="text-foreground">BLACKJACK</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground">
              Apprenez les règles, stratégies et tableaux de décision du blackjack
            </p>

            {/* Download Button */}
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              Télécharger l'extension Chrome
            </Button>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="regles" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 mb-8">
              <TabsTrigger 
                value="regles" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookOpen className="w-4 h-4" />
                Règles
              </TabsTrigger>
              <TabsTrigger 
                value="strategie"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Target className="w-4 h-4" />
                Stratégie
              </TabsTrigger>
              <TabsTrigger 
                value="tableau"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart3 className="w-4 h-4" />
                Tableau
              </TabsTrigger>
            </TabsList>

            {/* Règles Tab */}
            <TabsContent value="regles" className="space-y-6">
              {/* Objectif du jeu */}
              <Card className="gradient-card border-2 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Objectif du jeu</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Le but du blackjack est d'obtenir une main dont la valeur totale est la plus proche de 21 sans la dépasser. Vous jouez contre le croupier, et celui qui a la main la plus proche de 21 gagne. Si vous dépassez 21, vous "crevez" et perdez automatiquement.
                  </p>
                </CardContent>
              </Card>

              {/* Valeurs des cartes */}
              <Card className="gradient-card border-2 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <HelpCircle className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Valeurs des cartes</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* As */}
                    <Card className="bg-card/50 border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Spade className="w-5 h-5 text-foreground" />
                          <h3 className="font-bold text-foreground">As</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">1 ou 11 (votre choix)</p>
                      </CardContent>
                    </Card>

                    {/* Cartes numérotées */}
                    <Card className="bg-card/50 border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Spade className="w-5 h-5 text-foreground" />
                          <h3 className="font-bold text-foreground">Cartes numérotées</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Valeur nominale (2-10)</p>
                      </CardContent>
                    </Card>

                    {/* Figures */}
                    <Card className="bg-card/50 border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Spade className="w-5 h-5 text-foreground" />
                          <h3 className="font-bold text-foreground">Figures (Roi, Dame, Valet)</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">10 points</p>
                      </CardContent>
                    </Card>

                    {/* Blackjack naturel */}
                    <Card className="bg-card/50 border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Spade className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-foreground">Blackjack naturel</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">As + 10 = 21 (paiement 3:2)</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Actions possibles */}
              <Card className="gradient-card border-2 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Actions possibles</h2>
                  </div>
                  <Accordion type="single" collapsible className="w-full space-y-2">
                    <AccordionItem value="hit" className="border border-border/50 rounded-lg bg-card/50">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">Hit (Tirer)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-muted-foreground">
                          Demander une carte supplémentaire. Vous pouvez continuer à tirer jusqu'à ce que vous décidiez de rester ou que vous creviez (dépassiez 21).
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="stand" className="border border-border/50 rounded-lg bg-card/50">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">Stand (Rester)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-muted-foreground">
                          Garder votre main actuelle et laisser le croupier jouer. Le croupier doit tirer jusqu'à 17 ou plus.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="double" className="border border-border/50 rounded-lg bg-card/50">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">Double (Doubler)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-muted-foreground">
                          Doubler votre mise et recevoir une seule carte supplémentaire. Disponible uniquement sur les deux premières cartes.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="split" className="border border-border/50 rounded-lg bg-card/50">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">Split (Diviser)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-muted-foreground">
                          Diviser une paire en deux mains séparées. Chaque main reçoit une nouvelle carte et vous jouez chaque main individuellement.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="surrender" className="border border-border/50 rounded-lg bg-card/50">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">Surrender (Abandonner)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-muted-foreground">
                          Abandonner votre main et récupérer la moitié de votre mise. Disponible uniquement sur les deux premières cartes.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Paiements */}
              <Card className="gradient-card border-2 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Crown className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Paiements</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Victoire normale */}
                    <Card className="bg-card/50 border border-primary/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">1:1</div>
                        <h3 className="font-bold text-foreground mb-1">Victoire normale</h3>
                        <p className="text-sm text-muted-foreground">Votre main bat celle du croupier</p>
                      </CardContent>
                    </Card>

                    {/* Blackjack naturel */}
                    <Card className="bg-card/50 border border-primary/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">3:2</div>
                        <h3 className="font-bold text-foreground mb-1">Blackjack naturel</h3>
                        <p className="text-sm text-muted-foreground">As + 10 dès le départ</p>
                      </CardContent>
                    </Card>

                    {/* Insurance */}
                    <Card className="bg-card/50 border border-primary/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">2:1</div>
                        <h3 className="font-bold text-foreground mb-1">Insurance</h3>
                        <p className="text-sm text-muted-foreground">Si le croupier a un blackjack</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stratégie Tab */}
            <TabsContent value="strategie" className="space-y-6">
              {/* Stratégie de base */}
              <Card className="gradient-card border-2 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Stratégie de base</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    La stratégie de base du blackjack est un ensemble de règles mathématiques qui vous indiquent la meilleure action à prendre dans chaque situation. Elle réduit l'avantage de la maison à environ 0.5%.
                  </p>

                  {/* Règles générales */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">Règles générales</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Toujours rester sur 17 ou plus</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Toujours tirer sur 12-16 contre 7 ou plus</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Toujours doubler sur 11</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Toujours rester sur 12-16 contre 4-6</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Toujours rester sur 13-16 contre 2-3</span>
                      </li>
                    </ul>
                  </div>

                  {/* Conseils avancés */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Conseils avancés</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Ne prenez jamais l'assurance</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Divisez toujours les 8 et les As</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Ne divisez jamais les 5 et les 10</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Abandonnez 15 contre 10, 16 contre 9-10</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground">Gérez votre bankroll intelligemment</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Gestion de bankroll */}
              <Card className="gradient-card border-2 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Gestion de bankroll</h2>
                  </div>

                  {/* Règles d'or */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">Règles d'or</h3>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1 min-w-[24px]">1.</span>
                        <span className="text-muted-foreground">Ne jouez jamais avec de l'argent que vous ne pouvez pas vous permettre de perdre</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1 min-w-[24px]">2.</span>
                        <span className="text-muted-foreground">Fixez une limite de perte avant de commencer</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1 min-w-[24px]">3.</span>
                        <span className="text-muted-foreground">Ne dépassez jamais cette limite, peu importe les circonstances</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1 min-w-[24px]">4.</span>
                        <span className="text-muted-foreground">Utilisez la règle du 1% : ne misez jamais plus de 1% de votre bankroll</span>
                      </li>
                    </ol>
                  </div>

                  {/* Calcul de mise */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Calcul de mise</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-card/50 border border-primary/50">
                        <CardContent className="p-4">
                          <div className="text-foreground font-semibold mb-2">Bankroll : 1000€</div>
                          <div className="text-sm text-muted-foreground">Mise recommandée : 10€ (1%)</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card/50 border border-primary/50">
                        <CardContent className="p-4">
                          <div className="text-foreground font-semibold mb-2">Bankroll : 500€</div>
                          <div className="text-sm text-muted-foreground">Mise recommandée : 5€ (1%)</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card/50 border border-primary/50">
                        <CardContent className="p-4">
                          <div className="text-foreground font-semibold mb-2">Bankroll : 200€</div>
                          <div className="text-sm text-muted-foreground">Mise recommandée : 2€ (1%)</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tableau Tab */}
            <TabsContent value="tableau" className="space-y-6">
              {/* Strategy Table */}
              <Card className="gradient-card border-2 border-primary/50">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-background border-2 border-primary">
                      <thead>
                        <tr>
                          <th className="border border-primary/50 bg-primary/10 p-3 text-primary font-bold text-sm" rowSpan={2}>
                            VOTRE MAIN
                          </th>
                          <th className="border border-primary/50 bg-primary/10 p-3 text-primary font-bold text-sm" colSpan={10}>
                            MAIN DE LA BANQUE
                          </th>
                        </tr>
                        <tr>
                          {["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"].map((dealer) => (
                            <th key={dealer} className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">
                              {dealer}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* 17+ */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">17+</td>
                          {Array(10).fill("R").map((action, idx) => (
                            <td key={idx} className="border border-primary/50 p-3 text-center font-bold text-lg bg-destructive/20 text-destructive">
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 16 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">16</td>
                          {["R", "R", "R", "R", "R", "T", "T", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "R" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 15 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">15</td>
                          {["R", "R", "R", "R", "R", "T", "T", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "R" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 14 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">14</td>
                          {["R", "R", "R", "R", "R", "T", "T", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "R" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 13 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">13</td>
                          {["R", "R", "R", "R", "R", "T", "T", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "R" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 12 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">12</td>
                          {["T", "T", "R", "R", "R", "T", "T", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "R" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 11 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">11</td>
                          {Array(10).fill("D").map((action, idx) => (
                            <td key={idx} className="border border-primary/50 p-3 text-center font-bold text-lg bg-primary/20 text-primary">
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 10 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">10</td>
                          {["D", "D", "D", "D", "D", "D", "D", "D", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "D" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 9 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">9</td>
                          {["T", "D", "D", "D", "D", "T", "T", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "D" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* 5>8 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">5&gt;8</td>
                          {Array(10).fill("T").map((action, idx) => (
                            <td key={idx} className="border border-primary/50 p-3 text-center font-bold text-lg bg-primary/20 text-primary">
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* A-8>A-10 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">A-8&gt;A-10</td>
                          {Array(10).fill("R").map((action, idx) => (
                            <td key={idx} className="border border-primary/50 p-3 text-center font-bold text-lg bg-destructive/20 text-destructive">
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* A-7 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">A-7</td>
                          {["R", "D", "D", "D", "D", "R", "R", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "R" ? "bg-destructive/20 text-destructive" : action === "D" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* A-6 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">A-6</td>
                          {["T", "D", "D", "D", "D", "T", "T", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "D" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                        {/* A-5 */}
                        <tr>
                          <td className="border border-primary/50 bg-primary/10 p-2 text-primary font-bold text-xs">A-5</td>
                          {["T", "T", "D", "D", "D", "T", "T", "T", "T", "T"].map((action, idx) => (
                            <td key={idx} className={`border border-primary/50 p-3 text-center font-bold text-lg ${
                              action === "D" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary"
                            }`}>
                              {action}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* How to use the table */}
              <Card className="gradient-card border-2 border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Comment utiliser ce tableau</h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Étapes */}
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-4">Étapes :</h3>
                      <ol className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1 min-w-[24px]">1.</span>
                          <span className="text-muted-foreground">Calculez la valeur de votre main</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1 min-w-[24px]">2.</span>
                          <span className="text-muted-foreground">Identifiez la carte visible du croupier</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1 min-w-[24px]">3.</span>
                          <span className="text-muted-foreground">Croisez les deux informations dans le tableau</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1 min-w-[24px]">4.</span>
                          <span className="text-muted-foreground">Suivez l'action recommandée</span>
                        </li>
                      </ol>
                    </div>

                    {/* Exemple */}
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-4">Exemple :</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1">•</span>
                          <span className="text-muted-foreground">Votre main : 7 + 8 = 15</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1">•</span>
                          <span className="text-muted-foreground">Carte du croupier : 10</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1">•</span>
                          <span className="text-muted-foreground">
                            Action recommandée : <span className="text-destructive font-bold">Hit</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlackjackTableau;
