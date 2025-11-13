import { useState, useEffect } from "react";

interface BrandText {
  brandName: string;
  brandShort: string;
  creatorName: string;
  creatorShort: string;
}

const defaultText: BrandText = {
  brandName: "BOBUXBONUS.COM",
  brandShort: "BOBUX",
  creatorName: "TheBibux",
  creatorShort: "Bobux",
};

export const useBrandText = () => {
  const [text, setText] = useState<BrandText>(defaultText);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadText = async () => {
      try {
        const res = await fetch("/api/brand-text");
        const data = await res.json();
        if (data.text) {
          setText({ ...defaultText, ...data.text });
        }
      } catch (e) {
        console.error("Erreur chargement textes de marque:", e);
      } finally {
        setLoading(false);
      }
    };
    loadText();
  }, []);

  return { text, loading };
};

