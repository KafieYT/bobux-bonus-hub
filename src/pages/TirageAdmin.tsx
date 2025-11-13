import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Trophy, Target, FileDown, Trash2, RotateCcw, History, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdmin } from "@/hooks/useAdmin";

interface Participant {
  pseudoGamba: string;
  pseudoDiscord: string;
  date: string;
  ip?: string;
}

interface Winner {
  gagnant: Participant;
  multiplicateur: number;
  date: string;
}

interface RankingItem {
  rang: number;
  medaille: string;
  pseudo: string;
  multiplicateur: number;
}

const TirageAdmin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [multiplier, setMultiplier] = useState("");
  const [rouletteVisible, setRouletteVisible] = useState(false);
  const [rouletteRunning, setRouletteRunning] = useState(false);
  const [ipDoublesVisible, setIpDoublesVisible] = useState(false);
  const [ipDoubles, setIpDoubles] = useState<{ ip: string; original: Participant; others: Participant[] }[]>([]);

  const post = async (path: string, body: any) => {
    try {
      const res = await fetch(`/api${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (e) {
      return { error: "Serveur injoignable" };
    }
  };

  const loadParticipants = async () => {
    const data = await post("/liste", {});
    if (data.error) {
      alert(data.error);
      return;
    }
    setParticipants(data.participants || []);
  };

  const loadRanking = async () => {
    const data = await post("/winners/ranking", {});
    if (data.error) {
      return;
    }
    setRanking(data.ranking || []);
  };

  useEffect(() => {
    if (isAdmin) {
      loadRanking();
      loadParticipants();
    }
  }, [isAdmin]);

  const startRoulette = async () => {
    if (rouletteRunning) {
      return;
    }
    
    if (!isAdmin) {
      alert("Accès non autorisé. Vous devez être administrateur.");
      return;
    }

    try {
      // 1) Récupère la liste
      const listData = await post("/liste", {});
      if (listData.error) {
        alert(listData.error);
        return;
      }
      const people = (listData.participants || []).map((p: Participant) => p.pseudoGamba);
      if (!people.length) {
        alert("Aucun participant");
        return;
      }

      // 2) Appel serveur pour obtenir le vrai gagnant
      const tirageData = await post("/tirage", {});
      if (tirageData.error) {
        alert(tirageData.error);
        return;
      }
      const winner = tirageData.gagnant;

      // 3) Animation de la roulette
      setRouletteVisible(true);
      setRouletteRunning(true);

      // Attendre que le Dialog soit monté dans le DOM
      await new Promise((resolve) => setTimeout(resolve, 100));

      const rouletteStrip = document.getElementById("rouletteStrip");
      if (!rouletteStrip) {
        console.error("Roulette strip element not found");
        setRouletteVisible(false);
        setRouletteRunning(false);
        return;
      }

      rouletteStrip.innerHTML = "";
      // Réduire le nombre de répétitions pour un meilleur rendu
      const repeat = Math.max(3, Math.ceil(150 / Math.max(people.length, 1)));
      let items: string[] = [];
      for (let i = 0; i < repeat; i++) items = items.concat(people);
      // Buffer plus petit à la fin
      items = items.concat(people.slice(0, Math.min(people.length, 5)));

      items.forEach((name) => {
        const div = document.createElement("div");
        div.className = "roulette-item";
        div.textContent = name;
        div.style.cssText = `
          padding: 12px 24px !important;
          border-radius: 999px !important;
          background: linear-gradient(135deg, rgba(63,208,255,.35), rgba(0,225,160,.35)) !important;
          border: 2px solid rgba(63,208,255,.6) !important;
          box-shadow: 0 4px 25px rgba(0,200,255,.3), inset 0 1px 0 rgba(255,255,255,.15) !important;
          font-weight: 700 !important;
          font-size: 18px !important;
          letter-spacing: 0.5px !important;
          white-space: nowrap !important;
          color: #ffffff !important;
          text-shadow: 0 0 15px rgba(63,208,255,.7), 0 2px 4px rgba(0,0,0,.5) !important;
          flex-shrink: 0 !important;
          min-width: fit-content !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: inline-block !important;
          position: relative !important;
          z-index: 15 !important;
        `;
        rouletteStrip.appendChild(div);
      });

      const winEl = document.createElement("div");
      winEl.className = "roulette-item";
      winEl.textContent = winner.pseudoGamba;
      winEl.style.cssText = `
        padding: 12px 24px !important;
        border-radius: 999px !important;
        background: linear-gradient(135deg, rgba(63,208,255,.5), rgba(0,225,160,.5)) !important;
        border: 2px solid rgba(63,208,255,.9) !important;
        box-shadow: 0 6px 30px rgba(0,200,255,.6), inset 0 1px 0 rgba(255,255,255,.2) !important;
        font-weight: 700 !important;
        font-size: 18px !important;
        letter-spacing: 0.5px !important;
        white-space: nowrap !important;
        color: #ffffff !important;
        text-shadow: 0 0 15px rgba(63,208,255,.7), 0 2px 4px rgba(0,0,0,.5) !important;
        flex-shrink: 0 !important;
        min-width: fit-content !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: inline-block !important;
        position: relative !important;
        z-index: 25 !important;
      `;
      rouletteStrip.appendChild(winEl);

      // Forcer le rendu et vérifier que les éléments sont bien visibles
      rouletteStrip.style.display = "flex";
      rouletteStrip.style.alignItems = "center";
      rouletteStrip.style.height = "100%";
      
      // Attendre que les éléments soient rendus
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 100)); // Attendre plus longtemps
      
      // Vérifier que les éléments sont bien présents
      const itemEls = [...rouletteStrip.children];
      if (itemEls.length === 0) {
        console.error("No items in roulette");
        setRouletteVisible(false);
        setRouletteRunning(false);
        return;
      }

      // S'assurer que tous les éléments sont visibles
      itemEls.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.setProperty("display", "inline-block", "important");
        htmlEl.style.setProperty("opacity", "1", "important");
        htmlEl.style.setProperty("visibility", "visible", "important");
        htmlEl.style.setProperty("position", "relative", "important");
        htmlEl.style.setProperty("z-index", "25", "important");
        htmlEl.style.setProperty("color", "#ffffff", "important");
      });

      const container = document.getElementById('rouletteContainer');
      if (!container) {
        console.error("Container not found");
        setRouletteVisible(false);
        setRouletteRunning(false);
        return;
      }

      // Calculer la position pour centrer le gagnant
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      
      const stripRect = rouletteStrip.getBoundingClientRect();
      const winElRect = winEl.getBoundingClientRect();
      
      // Position du gagnant dans la strip
      const winElLeftInStrip = winElRect.left - stripRect.left;
      const winElCenterInStrip = winElLeftInStrip + winElRect.width / 2;
      
      // Calculer le décalage nécessaire
      const stripLeft = stripRect.left - containerRect.left;
      const targetX = centerX - (stripLeft + winElCenterInStrip);

      const total = Math.max(4200, 5200 + Math.random() * 600);
      const start = performance.now();

      function easeOutCubic(x: number) {
        return 1 - Math.pow(1 - x, 3);
      }

      function tick(now: number) {
        const tnorm = Math.min(1, (now - start) / total);
        const eased = easeOutCubic(tnorm);
        const x = -targetX * eased;
        rouletteStrip.style.transform = `translateX(${x}px)`;
        // S'assurer que tous les éléments restent visibles
        [...rouletteStrip.children].forEach((el) => {
          (el as HTMLElement).style.opacity = "1";
          (el as HTMLElement).style.visibility = "visible";
        });
        if (tnorm < 1) {
          requestAnimationFrame(tick);
        } else {
          setRouletteRunning(false);
          setRouletteVisible(false);
          setCurrentWinner(winner);
        }
      }

      requestAnimationFrame(tick);
    } catch (error) {
      console.error("Erreur lors du tirage:", error);
      alert("Une erreur est survenue lors du tirage");
      setRouletteVisible(false);
      setRouletteRunning(false);
    }
  };

  const saveMultiplier = async () => {
    if (!multiplier || Number(multiplier) <= 0) {
      alert("Multiplicateur invalide");
      return;
    }

    const data = await post("/fin-bonus", { multiplicateur: multiplier });
    if (data.error) {
      alert(data.error);
      return;
    }

    alert("Multiplicateur enregistré ✅");
    setCurrentWinner(null);
    setMultiplier("");
    loadRanking();
  };

  const exportCSV = async () => {
    const data = await post("/liste", {});
    if (data.error) {
      alert(data.error);
      return;
    }
    const arr = data.participants || [];
    const csv = [
      "PseudoGamba;PseudoDiscord;Date",
      ...arr.map((p: Participant) => `${p.pseudoGamba};${p.pseudoDiscord};${p.date}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "participants.csv";
    a.click();
  };

  const resetDB = async () => {
    if (!confirm("Réinitialiser la base ?")) return;
    await post("/delete-all", {});
    alert("Base réinitialisée");
    setParticipants([]);
    loadRanking();
  };

  const resetIPs = async () => {
    await post("/ips/reset", {});
    alert("IPs réinitialisées");
  };

  const showWinners = async () => {
    const data = await post("/winners", {});
    if (data.error) {
      alert(data.error);
      return;
    }
    const winners = (data.winners || []) as Winner[];
    alert(
      winners
        .map((x, i) => `${i + 1}. ${x.gagnant.pseudoGamba} (${x.multiplicateur || 0}x)`)
        .join("\n") || "Aucun tirage"
    );
  };

  const showIpDoubles = async () => {
    const data = await post("/liste", {});
    if (data.error) {
      alert(data.error);
      return;
    }
    const arr = (data.participants || []) as Participant[];

    const byIp: { [key: string]: Participant[] } = {};
    arr.forEach((p) => {
      if (!p.ip) return;
      if (!byIp[p.ip]) byIp[p.ip] = [];
      byIp[p.ip].push(p);
    });

    const doubles = Object.keys(byIp)
      .filter((ip) => byIp[ip].length > 1)
      .map((ip) => {
        const list = [...byIp[ip]].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return {
          ip,
          original: list[0],
          others: list.slice(1),
        };
      });

    setIpDoubles(doubles);
    setIpDoublesVisible(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl">
          <Card className="gradient-card border-2 border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                🎰 Gamba • Panneau Admin
              </CardTitle>
              <p className="text-muted-foreground">Gère les inscriptions et le tirage Bonus Hunt</p>
            </CardHeader>
            <CardContent>
              {adminLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Vérification des droits d'administrateur...
                </div>
              ) : !isAdmin ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-destructive font-semibold">
                    Accès non autorisé
                  </p>
                  <p className="text-muted-foreground">
                    Vous devez être administrateur pour accéder à cette page.
                  </p>
                  <Button onClick={() => window.location.href = "/api/auth/discord"}>
                    Se connecter avec Discord
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" onClick={exportCSV}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button variant="outline" onClick={showIpDoubles}>
                        <Eye className="h-4 w-4 mr-2" />
                        IP Doubles
                      </Button>
                      <Button variant="destructive" onClick={resetDB}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset DB
                      </Button>
                      <Button variant="destructive" onClick={resetIPs}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset IPs
                      </Button>
                      <Button variant="outline" onClick={showWinners}>
                        <History className="h-4 w-4 mr-2" />
                        Historique
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                    <Button variant="default" onClick={loadParticipants}>
                      <Users className="h-4 w-4 mr-2" />
                      Voir la liste
                    </Button>
                    <Button variant="default" onClick={startRoulette} disabled={rouletteRunning}>
                      <Target className="h-4 w-4 mr-2" />
                      Tirer un gagnant
                    </Button>
                    <Button variant="outline" onClick={loadRanking}>
                      <Trophy className="h-4 w-4 mr-2" />
                      Classement
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/admin/content")}
                    >
                      🎬 Gérer Contenu
                    </Button>
                  </div>

                  {/* Participants */}
                  {participants.length > 0 && (
                    <Card className="mb-6 border-border/50">
                      <CardHeader>
                        <CardTitle className="text-xl">Participants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {participants.map((p, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center p-3 rounded-lg border border-border/50"
                            >
                              <div>
                                <div className="font-bold">
                                  {i + 1}. {p.pseudoGamba}
                                </div>
                                <div className="text-sm text-muted-foreground">{p.pseudoDiscord}</div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(p.date).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gagnant actuel */}
                  {currentWinner && (
                    <Card className="mb-6 border-primary/50 bg-primary/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <div className="text-lg font-bold text-primary">
                              🎯 <span className="text-foreground">{currentWinner.pseudoGamba}</span>{" "}
                              <span className="text-muted-foreground">({currentWinner.pseudoDiscord})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="x..."
                              min="1"
                              step="0.01"
                              value={multiplier}
                              onChange={(e) => setMultiplier(e.target.value)}
                              className="w-24"
                            />
                            <Button onClick={saveMultiplier}>💾 Valider</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Classement */}
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-xl">🏅 Classement Multiplicateur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ranking.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Aucun résultat</div>
                      ) : (
                        <div className="space-y-2">
                          {ranking.map((item) => (
                            <div
                              key={item.rang}
                              className="flex justify-between items-center p-3 rounded-lg border border-border/50"
                            >
                              <div className="font-bold">
                                {item.medaille} {item.pseudo}
                              </div>
                              <div className="font-bold text-primary">{item.multiplicateur}x</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Roulette Overlay */}
      {rouletteVisible && (
        <Dialog 
          open={rouletteVisible} 
          onOpenChange={() => {}}
        >
          <DialogContent className="max-w-5xl p-6 bg-background border-2 border-primary/50">
            <div className="mb-6 text-center">
              <DialogTitle className="text-2xl font-bold">🎯 Tirage en cours…</DialogTitle>
            </div>
            <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-b from-card/80 to-card/40 shadow-2xl">
              {/* Container avec masque pour cacher les éléments qui sortent */}
              <div className="relative h-40 overflow-hidden" id="rouletteContainer">
                {/* Zone de la roulette avec gradient aux bords */}
                <div className="absolute inset-0 flex items-center">
                  {/* Strip de la roulette - contenu visible - DOIT ÊTRE EN PREMIER */}
                  <div
                    id="rouletteStrip"
                    className="flex gap-4 items-center h-full will-change-transform"
                    style={{ 
                      position: "relative",
                      zIndex: 25,
                      width: "100%",
                      justifyContent: "center",
                      minHeight: "100%"
                    } as React.CSSProperties}
                  />
                  
                  {/* Gradient à gauche - masque les éléments qui sortent */}
                  <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-card via-card/90 to-transparent z-20 pointer-events-none" />
                  {/* Gradient à droite - masque les éléments qui sortent */}
                  <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-card via-card/90 to-transparent z-20 pointer-events-none" />
                  
                  {/* Ligne centrale indicateur - bien visible */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-gradient-to-b from-transparent via-primary to-transparent transform -translate-x-1/2 shadow-[0_0_40px_rgba(63,208,255,1)] z-30 pointer-events-none" />
                  
                  {/* Glow effect au centre */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-primary/30 blur-3xl z-10 pointer-events-none" />
                </div>
              </div>
            </div>
            <style>{`
              #rouletteStrip .roulette-item {
                padding: 12px 24px !important;
                border-radius: 999px !important;
                background: linear-gradient(135deg, rgba(63,208,255,.35), rgba(0,225,160,.35)) !important;
                border: 2px solid rgba(63,208,255,.6) !important;
                box-shadow: 0 4px 25px rgba(0,200,255,.3), inset 0 1px 0 rgba(255,255,255,.15) !important;
                font-weight: 700 !important;
                font-size: 18px !important;
                letter-spacing: 0.5px !important;
                white-space: nowrap !important;
                color: #ffffff !important;
                text-shadow: 0 0 15px rgba(63,208,255,.7), 0 2px 4px rgba(0,0,0,.5) !important;
                flex-shrink: 0 !important;
                min-width: fit-content !important;
                opacity: 1 !important;
                visibility: visible !important;
                display: inline-block !important;
                position: relative !important;
                z-index: 25 !important;
              }
            `}</style>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal IP Doubles */}
      <Dialog open={ipDoublesVisible} onOpenChange={setIpDoublesVisible}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>👀 IP double compte</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            {ipDoubles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun doublon détecté</div>
            ) : (
              <div className="space-y-4">
                {ipDoubles.map((item, i) => (
                  <div key={i} className="p-4 border border-border/50 rounded-lg">
                    <div className="font-bold mb-2">{item.ip}</div>
                    <div className="text-sm text-muted-foreground mb-1">
                      <span>Pseudo original:</span> <span className="text-foreground font-bold">{item.original.pseudoGamba}</span>{" "}
                      <span className="text-muted-foreground">({item.original.pseudoDiscord})</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>Autres pseudos:</span>{" "}
                      {item.others.map((x, idx) => (
                        <span key={idx}>
                          <span className="text-destructive font-bold">{x.pseudoGamba}</span>{" "}
                          <span className="text-muted-foreground">({x.pseudoDiscord})</span>
                          {idx < item.others.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TirageAdmin;

