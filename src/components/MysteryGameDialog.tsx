import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface Game {
  id: string;
  name: string;
  provider: {
    name: string;
  };
  thumbnailUrl: string;
}

interface MysteryGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CAROUSEL_SIZE = 20; // Nombre de cartes visibles dans le carrousel
const SPIN_DURATION = 4000; // 4 secondes
const RADIUS = 450; // Rayon du cercle en pixels

// Component to handle image loading with fallback
const GameImage = ({ game, imageMapping }: { game: Game; imageMapping: Record<string, string> }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useLocalImage, setUseLocalImage] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Utiliser l'image locale si disponible, sinon l'URL distante
  const hasLocalImage = imageMapping[game.id] && useLocalImage;
  const imageUrl = hasLocalImage
    ? `/${imageMapping[game.id]}` // Chemin depuis public/ (Vite sert public/ à la racine)
    : game.thumbnailUrl;
  
  useEffect(() => {
    if (!imageUrl) return;
    
    // Reset states when image URL changes
    setImageError(false);
    setImageLoaded(false);
    setUseLocalImage(true);
    
    // Force image load check
    const checkImage = () => {
      if (imgRef.current) {
        const img = imgRef.current;
        if (img.complete && img.naturalWidth > 0) {
          setImageLoaded(true);
        }
      }
    };
    
    // Check immediately and after a short delay
    checkImage();
    const timeout = setTimeout(checkImage, 100);
    
    return () => clearTimeout(timeout);
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2f47] to-[#0f1e2e]">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎰</div>
          <div className="text-white text-xs font-semibold px-2">{game.name}</div>
        </div>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2f47] to-[#0f1e2e]">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎰</div>
          <div className="text-white text-xs font-semibold px-2">{game.name}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2f47] to-[#0f1e2e] z-10">
          <div className="text-center">
            <div className="text-2xl mb-2 animate-pulse">🎰</div>
          </div>
        </div>
      )}
      <img
        ref={imgRef}
        src={imageUrl}
        alt={game.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          zIndex: imageLoaded ? 20 : 0
        }}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          if (img.complete && img.naturalWidth > 0) {
            setImageLoaded(true);
          }
        }}
        onError={(e) => {
          // Si l'image locale échoue, essayer l'URL distante
          if (hasLocalImage && useLocalImage) {
            console.warn(`⚠️ Image locale échouée pour ${game.name}: ${imageUrl}, utilisation de l'URL distante`);
            setUseLocalImage(false);
            setImageError(false);
            setImageLoaded(false);
          } else {
            console.error(`❌ Image error: ${game.name}`, imageUrl, e);
            setImageError(true);
          }
        }}
      />
    </div>
  );
};

const MysteryGameDialog = ({ open, onOpenChange }: MysteryGameDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("slots");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [carouselGames, setCarouselGames] = useState<Game[]>([]);
  const [rotation, setRotation] = useState(0);
  const [imageMapping, setImageMapping] = useState<Record<string, string>>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Load games data and image mapping only when dialog opens
  useEffect(() => {
    if (!open) {
      setAllGames([]);
      setLoading(false);
      setCarouselGames([]);
      setRotation(0);
      return;
    }
    
    const loadGames = async () => {
      setLoading(true);
      try {
        // Charger les jeux
        const response = await fetch("/data/slots_by_provider.json");
        if (!response.ok) {
          throw new Error("Failed to load games data");
        }
        const slotsDataRaw = await response.json();
        const games: Game[] = Object.values(slotsDataRaw as Record<string, Game[]>).flat();
        
        // Charger le mapping des images locales
        try {
          const mappingResponse = await fetch("/data/image-mapping.json");
          if (mappingResponse.ok) {
            const mapping = await mappingResponse.json();
            setImageMapping(mapping);
            console.log(`📸 ${Object.keys(mapping).length} images locales disponibles`);
            // Test si une image est accessible
            const firstGameId = Object.keys(mapping)[0];
            if (firstGameId) {
              const testImg = new Image();
              testImg.onload = () => console.log(`✅ Test image chargée: /${mapping[firstGameId]}`);
              testImg.onerror = () => console.error(`❌ Test image échouée: /${mapping[firstGameId]}`);
              testImg.src = `/${mapping[firstGameId]}`;
            }
          } else {
            console.warn("Image mapping response not ok:", mappingResponse.status);
          }
        } catch (error) {
          console.warn("Image mapping not found, using remote URLs", error);
        }
        
        console.log(`Loaded ${games.length} games`);
        if (games.length > 0) {
          console.log("Sample game:", games[0]);
          console.log("Sample thumbnail URL:", games[0].thumbnailUrl);
        }
        
        setAllGames(games);
      } catch (error) {
        console.error("Error loading games data:", error);
        setAllGames([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadGames();
  }, [open]);

  // Get unique providers
  const providers = Array.from(
    new Set(allGames.map((game) => game.provider.name))
  ).sort();

  // Filter games based on category and provider (memoized to prevent infinite loops)
  const filteredGames = useMemo(() => {
    return allGames.filter((game) => {
      if (selectedProvider && game.provider.name !== selectedProvider) {
        return false;
      }
      return selectedCategory === "slots" || !selectedCategory;
    });
  }, [allGames, selectedProvider, selectedCategory]);

  // Track mapping keys count to detect when mapping is loaded
  const mappingKeysCount = useMemo(() => Object.keys(imageMapping).length, [imageMapping]);

  // Initialize carousel with 30 random games (only when games are ready)
  useEffect(() => {
    if (filteredGames.length === 0) {
      setCarouselGames([]);
      return;
    }

    // Select 30 random games
    const shuffled = [...filteredGames].sort(() => Math.random() - 0.5);
    const randomGames = shuffled.slice(0, 30);
    
    // Duplicate games to create seamless loop for carousel
    const duplicated = [];
    for (let i = 0; i < 3; i++) {
      duplicated.push(...randomGames);
    }
    const newCarouselGames = duplicated.slice(0, CAROUSEL_SIZE);
    setCarouselGames(newCarouselGames);
    
    // Preload only these 30 random images using local paths if mapping is available
    randomGames.forEach((game) => {
      const imagePath = imageMapping[game.id] 
        ? `/${imageMapping[game.id]}`
        : game.thumbnailUrl;
      
      if (imagePath) {
        const img = new Image();
        img.src = imagePath;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGames.length, mappingKeysCount]);

  const handleSpin = () => {
    if (filteredGames.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedGame(null);

    // Generate new random games (30 random games)
    const shuffled = [...filteredGames].sort(() => Math.random() - 0.5);
    const randomGames = shuffled.slice(0, 30);
    
    // Duplicate games to create seamless loop
    const duplicated = [];
    for (let i = 0; i < 3; i++) {
      duplicated.push(...randomGames);
    }
    const newCarouselGames = duplicated.slice(0, CAROUSEL_SIZE);
    setCarouselGames(newCarouselGames);

    // Preload images for carousel games using local images if available
    newCarouselGames.forEach((game) => {
      const imagePath = imageMapping[game.id] 
        ? `/${imageMapping[game.id]}`
        : game.thumbnailUrl;
      
      if (imagePath) {
        const img = new Image();
        img.src = imagePath;
      }
    });

    // Calculate random end rotation (always add rotations, never subtract)
    // Always rotate clockwise (positive direction)
    const baseRotations = 5; // Nombre de tours complets
    const randomAngle = Math.random() * 360;
    const additionalRotation = baseRotations * 360 + randomAngle;
    const targetRotation = rotation + additionalRotation;
    
    const startRotation = rotation;
    const startTime = Date.now();
    let currentRotation = startRotation;
    const totalRotation = targetRotation - startRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      
      // Constant speed - linear interpolation
      currentRotation = startRotation + totalRotation * progress;
      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Select the center game (at 0 degrees)
        const normalizedRotation = ((currentRotation % 360) + 360) % 360;
        const anglePerCard = 360 / CAROUSEL_SIZE;
        const centerIndex = Math.floor((360 - normalizedRotation) / anglePerCard) % newCarouselGames.length;
        const selected = newCarouselGames[centerIndex];
        setSelectedGame(selected);
        setIsSpinning(false);
        animationRef.current = null;
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleSaveSettings = () => {
    setSettingsOpen(false);
    const shuffled = [...filteredGames].sort(() => Math.random() - 0.5);
    const duplicated = [];
    for (let i = 0; i < 3; i++) {
      duplicated.push(...shuffled);
    }
    setCarouselGames(duplicated.slice(0, CAROUSEL_SIZE));
    setRotation(0);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getCardTransform = (index: number) => {
    const anglePerCard = 360 / CAROUSEL_SIZE;
    const angle = index * anglePerCard;
    const radian = (angle * Math.PI) / 180;
    const x = Math.sin(radian) * RADIUS;
    const z = Math.cos(radian) * RADIUS;
    
    return {
      transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
    };
  };

  const getCardOpacity = (index: number, currentRotation: number) => {
    const anglePerCard = 360 / CAROUSEL_SIZE;
    const cardAngle = index * anglePerCard;
    const normalizedRotation = ((currentRotation % 360) + 360) % 360;
    const relativeAngle = Math.abs(cardAngle - (360 - normalizedRotation));
    const minAngle = Math.min(relativeAngle, 360 - relativeAngle);
    
    // Cards near the front (0 degrees) are more visible
    if (minAngle < 30) return 1;
    if (minAngle < 60) return 0.7;
    if (minAngle < 90) return 0.4;
    return 0.2;
  };

  return (
    <>
      <Dialog open={open && !settingsOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl bg-[#0a1d30] border-[#1b2f46] text-white p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#1b2f46]">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🎲</span>
              Mystery Game
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-6 px-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-400 text-lg">Chargement des jeux...</p>
              </div>
            ) : (
              <>
                {/* 3D Carousel Container */}
                <div className="relative w-full h-[500px] overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-600">
                  {/* Gradient overlays on sides */}
                  <div className="absolute inset-y-0 left-0 z-10 w-1/4 bg-gradient-to-r from-gray-600 via-gray-600/30 to-transparent pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 z-10 w-1/4 bg-gradient-to-l from-gray-600 via-gray-600/30 to-transparent pointer-events-none" />
                  
                  {/* Pointer at top */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 w-8 h-8">
                    <div className="w-full h-full bg-white rounded-full shadow-lg" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-white" />
                  </div>

                  {/* 3D Carousel */}
                  <div
                    className="relative mx-auto h-full w-[150px]"
                    style={{ perspective: "200px" }}
                  >
                    <div
                      ref={carouselRef}
                      className="absolute size-full"
                      style={{
                        transformStyle: "preserve-3d",
                        transition: isSpinning ? "none" : "transform 0.1s",
                        transform: `translateZ(-${RADIUS}px) rotateY(${-rotation}deg)`,
                      }}
                    >
                      {carouselGames.map((game, index) => {
                        const transform = getCardTransform(index);
                        const opacity = getCardOpacity(index, rotation);
                        const isSelected = Math.abs(((index * (360 / CAROUSEL_SIZE)) % 360) - ((360 - (rotation % 360)) % 360)) < 5;
                        
                        return (
                          <div
                            key={`${game.id}-${index}`}
                            className="absolute left-0 top-1/2 w-[150px] -translate-y-1/2 bg-gray-600 px-1"
                            style={{
                              ...transform,
                              opacity,
                            }}
                            data-selected={isSelected}
                          >
                            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden outline outline-0.5 outline-gray-600 transition-all shadow-[inset_0_0_0_0_rgba(255,255,255,0)] bg-gradient-to-br from-[#1a2f47] to-[#0f1e2e]">
                              <GameImage game={game} imageMapping={imageMapping} />
                              
                              {/* Glow effect when selected */}
                              {isSelected && !isSpinning && (
                                <div className="absolute inset-x-1 inset-y-0 rounded-lg border border-white/75 transition-all duration-1000 ease-in-out opacity-100">
                                  <div className="absolute -left-1 -top-1 size-px animate-pulse rounded-full bg-white blur-[0.5px]" style={{ animationDelay: "0.1s" }} />
                                  <div className="absolute -top-2 left-3 size-0.5 animate-pulse rounded-full bg-white blur-[0.5px]" style={{ animationDelay: "0.02s" }} />
                                  <div className="absolute -top-2.5 right-3 size-px animate-pulse rounded-full bg-white blur-[0.5px]" style={{ animationDelay: "0.14s" }} />
                                  <div className="absolute -right-2 top-1.5 size-0.5 animate-pulse rounded-full bg-white blur-[0.5px]" style={{ animationDelay: "0.21s" }} />
                                  <div className="absolute size-full rounded-md bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0)_40%,_rgba(255,255,255,.1)_70%,_rgba(255,255,255,.4)_95%)] mix-blend-lighten" />
                                  <div className="absolute -inset-x-1/2 bottom-1/2 top-[-20%] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.25)_20%,_rgba(255,255,255,0)_50%)] blur-md" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected Game Display */}
                {selectedGame && !isSpinning && (
                  <div className="text-center bg-[#0f2338]/50 rounded-xl p-4 border border-[#1b2f46] w-full max-w-md">
                    <p className="text-xl font-bold text-[#10b981] mb-1 flex items-center justify-center gap-2">
                      <span className="text-2xl">🎉</span>
                      {selectedGame.name}
                    </p>
                    <p className="text-sm text-gray-400 font-medium">
                      {selectedGame.provider.name}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4 w-full max-w-md">
                  <Button
                    onClick={handleSpin}
                    disabled={isSpinning || filteredGames.length === 0 || loading}
                    className="flex-1 bg-[#10b981] hover:bg-[#059669] text-gray-700 font-semibold px-5 py-3 text-base rounded-sm shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? "Spinning..." : "Spin"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSettingsOpen(true)}
                    className="bg-[#0a1d30] hover:bg-[#1b2f46] text-[#10b981] rounded-sm aspect-square w-10 h-10 shadow-lg"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md bg-[#0a1d30] border-[#1b2f46] text-white">
          <DialogHeader>
            <DialogTitle>Mystery Game</DialogTitle>
            <p className="text-sm text-gray-400">
              Select a category or provider for your mystery spin.
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="bg-[#0f2338] border-[#1b2f46] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f2338] border-[#1b2f46]">
                    <SelectItem value="slots">Slots</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center text-gray-500 text-sm">OR</div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger id="provider" className="bg-[#0f2338] border-[#1b2f46] text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f2338] border-[#1b2f46]">
                    <SelectItem value="">All Providers</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MysteryGameDialog;
