import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AddSlotDialog } from '@/components/AddSlotDialog';
import { EditSlotDialog } from '@/components/EditSlotDialog';
import { ReportMissingSlotDialog } from '@/components/ReportMissingSlotDialog';
import { huntStorage } from '@/lib/huntStorage';
import { calculateHuntStats } from '@/lib/huntCalculations';
import { Hunt, Slot } from '@/types/hunt';
import { Plus, Share2, ArrowLeft, Trash2, TrendingUp, TrendingDown, Pencil, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';

const HuntDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [gainInputs, setGainInputs] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: 'bet' | 'gain' | 'multiplier'; direction: 'asc' | 'desc' } | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [missingSlotDialogOpen, setMissingSlotDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { isAdmin: isUserAdmin } = useAdmin();

  useEffect(() => {
    if (id) {
      const loadedHunt = huntStorage.getById(id);
      if (loadedHunt) {
        setHunt(loadedHunt);
      } else {
        navigate('/bonus-hunt');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    // Vérifier l'utilisateur connecté
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setCurrentUserId(data.user.id);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!hunt) return;

    // Si l'utilisateur est admin, déverrouiller automatiquement
    if (isUserAdmin) {
      setIsUnlocked(true);
      return;
    }

    // Rétrocompatibilité : si le hunt a un creatorPassword (ancien système), 
    // il reste verrouillé jusqu'à ce qu'un utilisateur le migre
    if ((hunt as any).creatorPassword) {
      setIsUnlocked(false);
      return;
    }

    // Nouveau système : vérifier si l'utilisateur est le créateur
    if (!currentUserId) {
      setIsUnlocked(false);
      return;
    }

    if (hunt.creatorId === currentUserId) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
    }
  }, [hunt, currentUserId, isUserAdmin]);

  const sortedSlots = useMemo(() => {
    if (!hunt) return [];
    if (!sortConfig) return hunt.slots;

    const sorted = [...hunt.slots];
    sorted.sort((a, b) => {
      let aVal = 0;
      let bVal = 0;
      switch (sortConfig.key) {
        case 'bet':
          aVal = a.bet;
          bVal = b.bet;
          break;
        case 'gain':
          aVal = a.gain;
          bVal = b.gain;
          break;
        case 'multiplier':
          aVal = a.bet > 0 ? a.gain / a.bet : 0;
          bVal = b.bet > 0 ? b.gain / b.bet : 0;
          break;
      }
      if (aVal === bVal) return 0;
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [hunt, sortConfig]);

  if (!hunt) return null;

  const stats = calculateHuntStats(hunt);
  const toggleSort = (key: 'bet' | 'gain' | 'multiplier') => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const renderSortIcon = (key: 'bet' | 'gain' | 'multiplier') => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-3 w-3 opacity-60" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  const currencySymbol = hunt.currency === 'EUR' ? '€' : hunt.currency === 'USD' ? '$' : '£';

  const handleAddSlot = (slot: Slot) => {
    if (!isUnlocked) {
      toast({ title: "Hunt verrouillé", description: "Déverrouille le hunt pour modifier." });
      return;
    }
    const updatedHunt = { ...hunt, slots: [...hunt.slots, slot] };
    huntStorage.save(updatedHunt);
    setHunt(updatedHunt);
    toast({ title: 'Slot ajouté avec succès!' });
  };

  const handleUpdateSlot = (updatedSlot: Slot) => {
    if (!isUnlocked) {
      toast({ title: "Hunt verrouillé", description: "Déverrouille le hunt pour modifier." });
      return;
    }
    const updatedHunt = { 
      ...hunt, 
      slots: hunt.slots.map(s => s.id === updatedSlot.id ? updatedSlot : s) 
    };
    huntStorage.save(updatedHunt);
    setHunt(updatedHunt);
    // Réinitialiser l'input local pour cette slot
    setGainInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[updatedSlot.id];
      return newInputs;
    });
    toast({ title: 'Slot modifié avec succès!' });
  };

  const handleGainChange = (slotId: string, newGain: string) => {
    // Mettre à jour l'état local pour l'affichage immédiat
    setGainInputs(prev => ({ ...prev, [slotId]: newGain }));
  };

  const handleGainBlur = (slotId: string, newGain: string) => {
    const gainValue = parseFloat(newGain) || 0;
    const updatedSlots = hunt.slots.map(s => {
      if (s.id === slotId) {
        // Si le gain > 0, passer automatiquement le statut à "collecté"
        const newStatus = gainValue > 0 ? 'collected' : (gainValue === 0 ? 'waiting' : s.status);
        return {
          ...s,
          gain: gainValue,
          status: newStatus
        };
      }
      return s;
    });
    const updatedHunt = { ...hunt, slots: updatedSlots };
    huntStorage.save(updatedHunt);
    setHunt(updatedHunt);
    // Réinitialiser l'input local après sauvegarde
    setGainInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[slotId];
      return newInputs;
    });
  };

  const handleEditSlot = (slot: Slot) => {
    if (!isUnlocked) {
      toast({ title: "Hunt verrouillé", description: "Déverrouille le hunt pour modifier." });
      return;
    }
    setSelectedSlot(slot);
    setEditDialogOpen(true);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (!isUnlocked) {
      toast({ title: "Hunt verrouillé", description: "Déverrouille le hunt pour modifier." });
      return;
    }
    const updatedHunt = { ...hunt, slots: hunt.slots.filter(s => s.id !== slotId) };
    huntStorage.save(updatedHunt);
    setHunt(updatedHunt);
    toast({ title: 'Slot supprimé' });
  };

  const handleDeleteHunt = () => {
    if (!isUnlocked && !isUserAdmin) {
      toast({ title: "Hunt verrouillé", description: "Déverrouille le hunt pour modifier." });
      return;
    }
    const message = isUserAdmin 
      ? `Êtes-vous sûr de vouloir supprimer ce hunt créé par ${hunt.creator || 'un utilisateur'} ? (Action admin)`
      : 'Êtes-vous sûr de vouloir supprimer ce hunt ?';
    if (confirm(message)) {
      huntStorage.delete(hunt.id);
      navigate('/bonus-hunt');
      toast({ title: 'Hunt supprimé' });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({ title: 'Lien copié dans le presse-papiers!' });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/bonus-hunt')}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">{hunt.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    {new Date(hunt.createdAt).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  {hunt.creator && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Créé par {hunt.creator}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!isUnlocked && !isUserAdmin && (
                  <span className="text-xs text-muted-foreground flex items-center">
                    Mode lecture seule
                  </span>
                )}
                {isUserAdmin && (
                  <span className="text-xs text-primary font-semibold flex items-center px-2 py-1 rounded bg-primary/10">
                    Mode Admin
                  </span>
                )}
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
                <Button variant="destructive" onClick={handleDeleteHunt} disabled={!isUnlocked && !isUserAdmin}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>

            {/* Stats Cards - Première rangée */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Montant de départ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {hunt.startAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencySymbol}
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card border-2 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total gagné
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalGain.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencySymbol}
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card border-2 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profit / Perte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${
                    stats.profit >= 0 ? 'text-primary' : 'text-destructive'
                  }`}>
                    {stats.profit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {stats.profit >= 0 ? '+' : ''}{stats.profit.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencySymbol}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deuxième rangée */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Break Even Fixe */}
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Break Even Fixe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {stats.breakEvenInitial > 0 ? `x${stats.breakEvenInitial.toFixed(2)}` : "-"}
                  </div>
                </CardContent>
              </Card>

              {/* Break Even Évolutif */}
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Break Even Évolutif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {stats.waitingSlots > 0 && stats.breakEvenEvolutive > 0 ? `x${stats.breakEvenEvolutive.toFixed(2)}` : '-'}
                  </div>
                </CardContent>
              </Card>

              {/* Multiplicateur moyen */}
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Multiplicateur moyen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {stats.averageMultiplier > 0 ? `x${stats.averageMultiplier.toFixed(2)}` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Moyenne des multiplicateurs collectés
                  </p>
                </CardContent>
              </Card>

              {/* Slots Card */}
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.collectedSlots}/{hunt.slots.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.waitingSlots} en attente
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Slots Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Détails des slots</h2>
              <div className="flex flex-wrap items-center gap-2">
                  {!isUnlocked && (
                    <span className="text-xs text-muted-foreground">Hunt verrouillé - Seul le créateur peut modifier</span>
                  )}
                  <Button variant="outline" onClick={() => setMissingSlotDialogOpen(true)} disabled={!isUnlocked}>
                    Signaler une slot manquante
                  </Button>
                  <Button onClick={() => setDialogOpen(true)} disabled={!isUnlocked}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une slot
                  </Button>
                </div>
              </div>
              
              <Card className="gradient-card border-2 border-border/50">
              <CardContent>
                {hunt.slots.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>🎰 Nom du slot</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Pseudo</TableHead>
                        <TableHead className="text-center">Bounty</TableHead>
                        <TableHead className="text-right">
                          <button
                            type="button"
                            onClick={() => toggleSort('bet')}
                            className="flex items-center gap-1 ml-auto text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Mise {renderSortIcon('bet')}
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            type="button"
                            onClick={() => toggleSort('gain')}
                            className="flex items-center gap-1 ml-auto text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Gain {renderSortIcon('gain')}
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            type="button"
                            onClick={() => toggleSort('multiplier')}
                            className="flex items-center gap-1 ml-auto text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Mult. {renderSortIcon('multiplier')}
                          </button>
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell className="font-medium">{slot.name}</TableCell>
                          <TableCell>{slot.provider || '-'}</TableCell>
                          <TableCell>{slot.player || '-'}</TableCell>
                          <TableCell className="text-center">
                            {slot.bounty ? (
                              <Badge className="bg-primary/80 text-primary-foreground border border-primary/40">Oui</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground border border-secondary/30">
                                Non
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {slot.bet.toFixed(2)} {currencySymbol}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                value={gainInputs[slot.id] !== undefined ? gainInputs[slot.id] : slot.gain.toFixed(2)}
                                onChange={(e) => handleGainChange(slot.id, e.target.value)}
                                onBlur={(e) => handleGainBlur(slot.id, e.target.value)}
                                className="w-24 h-8 text-right text-sm"
                                placeholder="0.00"
                              />
                              <span className="text-sm text-muted-foreground">{currencySymbol}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {slot.bet > 0 ? (() => {
                              const currentGain = gainInputs[slot.id] !== undefined 
                                ? parseFloat(gainInputs[slot.id]) || 0 
                                : slot.gain;
                              return `${(currentGain / slot.bet).toFixed(2)}x`;
                            })() : '-'}
                          </TableCell>
                          <TableCell>
                            {slot.status === 'collected' ? (
                              <Badge className="bg-emerald-500/80 text-emerald-950 border border-emerald-400/40">
                                Collecté
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-400/80 text-amber-950 border border-amber-300/50">
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isUnlocked ? (
                              <div className="flex gap-1 justify-end">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditSlot(slot)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Verrouillé</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune slot ajoutée. Cliquez sur "Ajouter une slot" pour commencer.
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <AddSlotDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onAdd={handleAddSlot}
      />

      <EditSlotDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        slot={selectedSlot}
        onUpdate={handleUpdateSlot}
      />

      <ReportMissingSlotDialog
        open={missingSlotDialogOpen}
        onOpenChange={setMissingSlotDialogOpen}
        hunt={hunt}
      />
    </div>
  );
};

export default HuntDetails;
