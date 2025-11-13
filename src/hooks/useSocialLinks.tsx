import { useState, useEffect } from "react";

interface SocialLinks {
  discord: string;
  twitter: string;
  telegram: string;
  dlive: string;
  youtube: string;
  instagram?: string;
  joinCommunity: string;
}

const defaultLinks: SocialLinks = {
  discord: "https://discord.gg/tWEr7z8NM9",
  twitter: "https://x.com/intent/user?screen_name=JUNI_CLIP",
  telegram: "",
  dlive: "https://dlive.tv/Junikeit",
  youtube: "https://www.youtube.com/@junikeit",
  joinCommunity: "https://discord.gg/tWEr7z8NM9",
};

export const useSocialLinks = () => {
  const [links, setLinks] = useState<SocialLinks>(defaultLinks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const res = await fetch("/api/social-links");
        const data = await res.json();
        if (data.links) {
          const loadedLinks = { ...defaultLinks, ...data.links };
          // Si joinCommunity n'est pas défini, utiliser discord
          if (!loadedLinks.joinCommunity && loadedLinks.discord) {
            loadedLinks.joinCommunity = loadedLinks.discord;
          }
          setLinks(loadedLinks);
        }
      } catch (e) {
        console.error("Erreur chargement liens sociaux:", e);
      } finally {
        setLoading(false);
      }
    };
    loadLinks();
  }, []);

  return { links, loading };
};

