import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Video, Film, Plus, Edit, Trash2, Check, Link2, BarChart3, X, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/hooks/useAdmin";

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  url: string;
}

interface BonusData {
  id: number;
  platform: string;
  title: string;
  description: string;
  category: "casino" | "sport" | "crypto";
  highlight: boolean;
  link: string;
  image?: string;
}

const ContentAdmin = () => {
  const { t } = useLanguage();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [bonuses, setBonuses] = useState<BonusData[]>([]);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [currentStats, setCurrentStats] = useState<{
    type: "bonus" | "video";
    data: any;
    clicks: { count: number; lastClick: string | null };
  } | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [editingBonus, setEditingBonus] = useState<BonusData | null>(null);
  const [socialLinks, setSocialLinks] = useState({
    discord: "",
    twitter: "",
    telegram: "",
    dlive: "",
    youtube: "",
    joinCommunity: "",
  });
  const [brandText, setBrandText] = useState({
    brandName: "",
    brandShort: "",
    creatorName: "",
    creatorShort: "",
  });
  
  // Form states pour vidéos
  const [videoForm, setVideoForm] = useState({
    title: "",
    thumbnail: "",
    category: "",
    url: "",
  });

  // Form states pour bonus
  const [bonusForm, setBonusForm] = useState({
    platform: "",
    title: "",
    description: "",
    category: "casino" as "casino" | "sport" | "crypto",
    highlight: false,
    link: "",
    image: "",
  });

  const post = async (path: string, body: any) => {
    try {
      const res = await fetch(`/api${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Erreur serveur" };
      }
      return data;
    } catch (e) {
      return { error: "Serveur injoignable" };
    }
  };

  const put = async (path: string, body: any) => {
    try {
      const res = await fetch(`/api${path}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Erreur serveur" };
      }
      return data;
    } catch (e) {
      return { error: "Serveur injoignable" };
    }
  };

  const del = async (path: string) => {
    try {
      const res = await fetch(`/api${path}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Erreur serveur" };
      }
      return data;
    } catch (e) {
      return { error: "Serveur injoignable" };
    }
  };

  const loadVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (e) {
      console.error("Erreur chargement vidéos:", e);
    }
  };

  const loadBonuses = async () => {
    try {
      const res = await fetch("/api/bonus");
      const data = await res.json();
      setBonuses(data.bonuses || []);
    } catch (e) {
      console.error("Erreur chargement bonus:", e);
    }
  };

  const loadSocialLinks = async () => {
    try {
      const res = await fetch("/api/social-links");
      const data = await res.json();
      if (data.links) {
        setSocialLinks(data.links);
      }
    } catch (e) {
      console.error("Erreur chargement liens sociaux:", e);
    }
  };

  const loadBrandText = async () => {
    try {
      const res = await fetch("/api/brand-text");
      const data = await res.json();
      if (data.text) {
        setBrandText(data.text);
      }
    } catch (e) {
      console.error("Erreur chargement textes de marque:", e);
    }
  };

  const loadItemStats = async (type: "bonus" | "video", id: string | number) => {
    if (!isAdmin) {
      alert("Vous devez être administrateur pour voir les statistiques");
      return;
    }
    
    try {
      console.log(`Chargement des statistiques pour ${type} avec ID:`, id);
      
      const res = await fetch("/api/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Erreur inconnue" }));
        console.error("Erreur API stats:", errorData);
        alert(errorData.error || "Erreur lors du chargement des statistiques");
        return;
      }
      
      const data = await res.json();
      console.log("Données reçues de /api/stats:", data);
      
      if (!data.success) {
        console.error("API stats retourne success: false", data);
        alert(data.error || "Erreur lors du chargement des statistiques");
        return;
      }
      
      // Vérifier que les données existent
      if (!data.bonuses || !data.videos) {
        console.error("Données manquantes dans la réponse", data);
        alert("Les données de statistiques sont incomplètes");
        return;
      }
      
      if (type === "bonus") {
        // Chercher le bonus avec correspondance flexible (Number ou String)
        const bonusId = typeof id === "string" ? parseInt(id, 10) : id;
        console.log(`Recherche du bonus avec ID: ${bonusId} (type: ${typeof bonusId})`);
        console.log("Bonuses disponibles:", data.bonuses.map((b: any) => ({ id: b.id, type: typeof b.id })));
        
        const bonus = data.bonuses.find((b: any) => {
          // Comparaison flexible : Number vs Number, ou String vs String
          return Number(b.id) === Number(bonusId) || String(b.id) === String(bonusId);
        });
        
        if (!bonus) {
          console.error("Bonus non trouvé", {
            idCherche: bonusId,
            typeId: typeof bonusId,
            bonusesDisponibles: data.bonuses.map((b: any) => ({ id: b.id, type: typeof b.id })),
            totalBonuses: data.bonuses.length
          });
          alert(`Bonus avec l'ID ${id} non trouvé dans les statistiques`);
          return;
        }
        
        console.log("Bonus trouvé:", bonus);
        setCurrentStats({
          type: "bonus",
          data: bonus,
          clicks: bonus.clicks || { count: 0, lastClick: null },
        });
        setStatsDialogOpen(true);
      } else {
        // Chercher la vidéo avec correspondance flexible (String ou Number)
        const videoId = String(id);
        console.log(`Recherche de la vidéo avec ID: ${videoId} (type: ${typeof videoId})`);
        console.log("Vidéos disponibles:", data.videos.map((v: any) => ({ id: v.id, type: typeof v.id })));
        
        const video = data.videos.find((v: any) => {
          // Comparaison flexible : String vs String, ou Number vs Number
          return String(v.id) === videoId || Number(v.id) === Number(videoId);
        });
        
        if (!video) {
          console.error("Vidéo non trouvée", {
            idCherche: videoId,
            typeId: typeof videoId,
            videosDisponibles: data.videos.map((v: any) => ({ id: v.id, type: typeof v.id })),
            totalVideos: data.videos.length
          });
          alert(`Vidéo avec l'ID ${id} non trouvée dans les statistiques`);
          return;
        }
        
        console.log("Vidéo trouvée:", video);
        setCurrentStats({
          type: "video",
          data: video,
          clicks: video.clicks || { count: 0, lastClick: null },
        });
        setStatsDialogOpen(true);
      }
    } catch (e) {
      console.error("Erreur chargement statistiques:", e);
      alert("Erreur lors du chargement des statistiques: " + (e instanceof Error ? e.message : "Erreur inconnue"));
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadVideos();
      loadBonuses();
      loadSocialLinks();
      loadBrandText();
    }
  }, [isAdmin]);

  const openVideoDialog = (video?: VideoData) => {
    if (video) {
      setEditingVideo(video);
      setVideoForm({
        title: video.title,
        thumbnail: video.thumbnail,
        category: video.category,
        url: video.url,
      });
    } else {
      setEditingVideo(null);
      setVideoForm({ title: "", thumbnail: "", category: "", url: "" });
    }
    setVideoDialogOpen(true);
  };

  const openBonusDialog = (bonus?: BonusData) => {
    if (bonus) {
      setEditingBonus(bonus);
      setBonusForm({
        platform: bonus.platform,
        title: bonus.title,
        description: bonus.description,
        category: bonus.category,
        highlight: bonus.highlight,
        link: bonus.link,
        image: bonus.image || "",
      });
    } else {
      setEditingBonus(null);
      setBonusForm({
        platform: "",
        title: "",
        description: "",
        category: "casino",
        highlight: false,
        link: "",
        image: "",
      });
    }
    setBonusDialogOpen(true);
  };

  const saveVideo = async () => {
    if (!videoForm.title || !videoForm.thumbnail || !videoForm.category || !videoForm.url) {
      alert("Tous les champs sont requis");
      return;
    }

    if (!isAdmin) {
      alert("Vous devez être administrateur pour modifier les vidéos");
      return;
    }

    let result;
    if (editingVideo) {
      result = await put(`/videos/${editingVideo.id}`, videoForm);
    } else {
      result = await post("/videos", videoForm);
    }

    if (result.error) {
      alert(`Erreur: ${result.error}`);
      return;
    }

    if (result.success || result.video) {
      alert(editingVideo ? "Vidéo modifiée avec succès ✅" : "Vidéo ajoutée avec succès ✅");
      setVideoDialogOpen(false);
      loadVideos();
    } else {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const saveBonus = async () => {
    if (!bonusForm.platform || !bonusForm.title || !bonusForm.description || !bonusForm.link) {
      alert("Tous les champs sont requis");
      return;
    }

    if (!isAdmin) {
      alert("Vous devez être administrateur pour modifier les bonus");
      return;
    }

    let result;
    if (editingBonus) {
      result = await put(`/bonus/${editingBonus.id}`, bonusForm);
    } else {
      result = await post("/bonus", bonusForm);
    }

    if (result.error) {
      alert(`Erreur: ${result.error}`);
      return;
    }

    if (result.success) {
      alert(editingBonus ? "Bonus modifié avec succès ✅" : "Bonus ajouté avec succès ✅");
      setBonusDialogOpen(false);
      loadBonuses();
    } else {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Supprimer cette vidéo ?")) return;
    const result = await del(`/videos/${id}`);
    if (result.error) {
      alert(result.error);
      return;
    }
    loadVideos();
  };

  const deleteBonus = async (id: number) => {
    if (!confirm("Supprimer ce bonus ?")) return;
    const result = await del(`/bonus/${id}`);
    if (result.error) {
      alert(result.error);
      return;
    }
    loadBonuses();
  };

  const saveSocialLinks = async () => {
    if (!isAdmin) {
      alert("Vous devez être administrateur pour modifier les liens sociaux");
      return;
    }

    const result = await put("/social-links", socialLinks);
    if (result.error) {
      alert(`Erreur: ${result.error}`);
      return;
    }

    if (result.success) {
      alert("Liens sociaux modifiés avec succès ✅");
      loadSocialLinks();
    } else {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const saveBrandText = async () => {
    if (!isAdmin) {
      alert("Vous devez être administrateur pour modifier les textes de marque");
      return;
    }

    if (!brandText.brandName || !brandText.creatorName) {
      alert("Le nom de la marque et le nom du créateur sont requis");
      return;
    }

    // Générer automatiquement les versions courtes si elles ne sont pas définies
    const textToSave = {
      brandName: brandText.brandName,
      brandShort: brandText.brandShort || brandText.brandName.split('.')[0] || brandText.brandName,
      creatorName: brandText.creatorName,
      creatorShort: brandText.creatorShort || brandText.creatorName,
    };

    const result = await put("/brand-text", textToSave);
    if (result.error) {
      alert(`Erreur: ${result.error}`);
      return;
    }

    if (result.success) {
      alert("Textes de marque modifiés avec succès ✅\nVeuillez rafraîchir la page pour voir les changements.");
      loadBrandText();
    } else {
      alert("Erreur lors de la sauvegarde");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          <Card className="gradient-card border-2 border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                🎬 Gestion du Contenu
              </CardTitle>
              <p className="text-muted-foreground">Gère les vidéos et bonus disponibles sur le site</p>
            </CardHeader>
            <CardContent>
              {adminLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Vérification des droits d'administrateur...
                </div>
              ) : !isAdmin ? (
                <div className="text-center py-8 space-y-4">
                  <Shield className="w-12 h-12 text-destructive mx-auto" />
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
                <Tabs defaultValue="videos" className="w-full">
                <TabsList className="grid w-full max-w-4xl grid-cols-4">
                  <TabsTrigger value="videos">
                    <Video className="h-4 w-4 mr-2" />
                    Vidéos
                  </TabsTrigger>
                  <TabsTrigger value="bonus">
                    <Film className="h-4 w-4 mr-2" />
                    Bonus
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    <Link2 className="h-4 w-4 mr-2" />
                    Liens Sociaux
                  </TabsTrigger>
                  <TabsTrigger value="brand">
                    <Link2 className="h-4 w-4 mr-2" />
                    Marque
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="videos" className="mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Gestion des Vidéos</h3>
                    <Button onClick={() => openVideoDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une vidéo
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <Card key={video.id} className="border-border/50">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/640x360";
                              }}
                            />
                          </div>
                          <h4 className="font-bold mb-1 line-clamp-2">{video.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {video.category} • {video.url}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadItemStats("video", video.id)}
                              title="Voir les statistiques"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openVideoDialog(video)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteVideo(video.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="bonus" className="mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Gestion des Bonus</h3>
                    <Button onClick={() => openBonusDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un bonus
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bonuses.map((bonus) => (
                      <Card
                        key={bonus.id}
                        className={`border-2 ${
                          bonus.highlight ? "border-primary" : "border-border/50"
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold">{bonus.platform}</h4>
                            {bonus.highlight && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                🔥 Exclusif
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {bonus.image && (
                            <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                              <img
                                src={bonus.image}
                                alt={bonus.platform}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          )}
                          <p className="text-2xl font-bold text-primary mb-2">{bonus.title}</p>
                          <p className="text-sm text-muted-foreground mb-2">{bonus.description}</p>
                          <p className="text-xs text-muted-foreground mb-4">
                            {bonus.category} • {bonus.link}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadItemStats("bonus", bonus.id)}
                              title="Voir les statistiques"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openBonusDialog(bonus)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteBonus(bonus.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="social" className="mt-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-4">Gestion des Liens Sociaux</h3>
                    <p className="text-muted-foreground mb-6">
                      Modifiez les liens vers vos réseaux sociaux et le bouton "Rejoindre la communauté"
                    </p>
                  </div>

                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <Label htmlFor="social-discord">Discord</Label>
                      <Input
                        id="social-discord"
                        value={socialLinks.discord}
                        onChange={(e) => {
                          const newDiscord = e.target.value;
                          const updatedLinks = { ...socialLinks, discord: newDiscord };
                          // Synchroniser automatiquement joinCommunity avec discord si joinCommunity est vide ou identique à l'ancien discord
                          if (!socialLinks.joinCommunity || socialLinks.joinCommunity === socialLinks.discord) {
                            updatedLinks.joinCommunity = newDiscord;
                          }
                          setSocialLinks(updatedLinks);
                        }}
                        placeholder="https://discord.gg/..."
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Ce lien sera automatiquement synchronisé avec le bouton "Rejoindre la communauté" si celui-ci est vide
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="social-twitter">Twitter / X</Label>
                      <Input
                        id="social-twitter"
                        value={socialLinks.twitter}
                        onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                        placeholder="https://x.com/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="social-telegram">Telegram</Label>
                      <Input
                        id="social-telegram"
                        value={socialLinks.telegram}
                        onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                        placeholder="https://t.me/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="social-dlive">Dlive</Label>
                      <Input
                        id="social-dlive"
                        value={socialLinks.dlive}
                        onChange={(e) => setSocialLinks({ ...socialLinks, dlive: e.target.value })}
                        placeholder="https://dlive.tv/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="social-youtube">YouTube</Label>
                      <Input
                        id="social-youtube"
                        value={socialLinks.youtube}
                        onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                        placeholder="https://www.youtube.com/@..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="social-join">Bouton "Rejoindre la communauté"</Label>
                      <Input
                        id="social-join"
                        value={socialLinks.joinCommunity}
                        onChange={(e) => setSocialLinks({ ...socialLinks, joinCommunity: e.target.value })}
                        placeholder="https://discord.gg/... (lien du bouton principal)"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Ce lien est utilisé pour le bouton principal "Rejoindre la communauté" sur la page d'accueil
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <Button onClick={saveSocialLinks}>
                        <Check className="h-4 w-4 mr-2" />
                        Enregistrer les liens
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="brand" className="mt-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-4">Gestion de la Marque</h3>
                    <p className="text-muted-foreground mb-6">
                      Modifiez le nom de la marque et le nom du créateur qui apparaissent partout sur le site
                    </p>
                  </div>

                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <Label htmlFor="brand-name">Nom complet de la marque *</Label>
                      <Input
                        id="brand-name"
                        value={brandText.brandName}
                        onChange={(e) => setBrandText({ ...brandText, brandName: e.target.value })}
                        placeholder="BOBUXBONUS.COM"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Ce nom apparaît dans le header, sur la page d'accueil et dans le footer
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="creator-name">Nom du créateur *</Label>
                      <Input
                        id="creator-name"
                        value={brandText.creatorName}
                        onChange={(e) => setBrandText({ ...brandText, creatorName: e.target.value })}
                        placeholder="TheBibux"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Ce nom remplacera "TheBibux" et "Bobux" partout dans les traductions (description, titres, etc.)
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <Button onClick={saveBrandText}>
                        <Check className="h-4 w-4 mr-2" />
                        Enregistrer les textes
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Dialog pour vidéo */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? "Modifier la vidéo" : "Ajouter une vidéo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-title">Titre *</Label>
              <Input
                id="video-title"
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                placeholder="Titre de la vidéo"
              />
            </div>
            <div>
              <Label htmlFor="video-thumbnail">URL de la miniature *</Label>
              <Input
                id="video-thumbnail"
                value={videoForm.thumbnail}
                onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
              />
            </div>
            <div>
              <Label htmlFor="video-category">Catégorie *</Label>
              <Input
                id="video-category"
                value={videoForm.category}
                onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                placeholder="Casino, Bonus, Tutoriel, etc."
              />
            </div>
            <div>
              <Label htmlFor="video-url">URL de la vidéo *</Label>
              <Input
                id="video-url"
                value={videoForm.url}
                onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={saveVideo}>
                <Check className="h-4 w-4 mr-2" />
                {editingVideo ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour bonus */}
      <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBonus ? "Modifier le bonus" : "Ajouter un bonus"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bonus-platform">Plateforme *</Label>
              <Input
                id="bonus-platform"
                value={bonusForm.platform}
                onChange={(e) => setBonusForm({ ...bonusForm, platform: e.target.value })}
                placeholder="Stake, BC.Game, etc."
              />
            </div>
            <div>
              <Label htmlFor="bonus-title">Titre *</Label>
              <Input
                id="bonus-title"
                value={bonusForm.title}
                onChange={(e) => setBonusForm({ ...bonusForm, title: e.target.value })}
                placeholder="30€ OFFERTS"
              />
            </div>
            <div>
              <Label htmlFor="bonus-description">Description *</Label>
              <Textarea
                id="bonus-description"
                value={bonusForm.description}
                onChange={(e) => setBonusForm({ ...bonusForm, description: e.target.value })}
                placeholder="Dépôt minimum: 20€"
              />
            </div>
            <div>
              <Label htmlFor="bonus-category">Catégorie *</Label>
              <Select
                value={bonusForm.category}
                onValueChange={(value: "casino" | "sport" | "crypto") =>
                  setBonusForm({ ...bonusForm, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casino">Casino</SelectItem>
                  <SelectItem value="sport">Sport</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bonus-link">Lien *</Label>
              <Input
                id="bonus-link"
                value={bonusForm.link}
                onChange={(e) => setBonusForm({ ...bonusForm, link: e.target.value })}
                placeholder="https://t.me/+pXb2z1iLR3g5YWY8"
              />
            </div>
            <div>
              <Label htmlFor="bonus-image">URL de l'image (optionnel)</Label>
              <Input
                id="bonus-image"
                value={bonusForm.image}
                onChange={(e) => setBonusForm({ ...bonusForm, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="bonus-highlight"
                checked={bonusForm.highlight}
                onCheckedChange={(checked) => setBonusForm({ ...bonusForm, highlight: checked })}
              />
              <Label htmlFor="bonus-highlight">Mettre en avant (Exclusif)</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBonusDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={saveBonus}>
                <Check className="h-4 w-4 mr-2" />
                {editingBonus ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour statistiques */}
      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Statistiques de {currentStats?.type === "bonus" ? "Bonus" : "Vidéo"}
            </DialogTitle>
          </DialogHeader>
          {currentStats && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="mb-3">
                  <h4 className="font-bold text-lg">
                    {currentStats.type === "bonus" 
                      ? currentStats.data.platform 
                      : currentStats.data.title}
                  </h4>
                  {currentStats.type === "bonus" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStats.data.title}
                    </p>
                  )}
                  {currentStats.type === "video" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStats.data.category}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      {currentStats.type === "bonus" ? (
                        <Film className="h-5 w-5 text-primary" />
                      ) : (
                        <Video className="h-5 w-5 text-primary" />
                      )}
                      <span className="font-medium">Clics totaux</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {currentStats.clicks.count || 0}
                    </span>
                  </div>
                  
                  {currentStats.clicks.lastClick && (
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">Dernier clic</p>
                      <p className="text-sm font-medium">
                        {new Date(currentStats.clicks.lastClick).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                  
                  {!currentStats.clicks.lastClick && (
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        Aucun clic enregistré pour le moment
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setStatsDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentAdmin;



