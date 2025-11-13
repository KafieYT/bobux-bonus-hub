import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.fr;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fonction pour remplacer les noms dans les traductions
const replaceNamesInTranslations = (trans: any, creatorName: string, creatorShort: string, brandName: string): any => {
  // Si creatorShort n'est pas défini, utiliser creatorName
  const shortName = creatorShort || creatorName;
  
  if (typeof trans === "string") {
    return trans
      // Remplacements pour Kafie en PRIORITÉ (avant les autres pour éviter les conflits)
      // Kafie doit être remplacé par le nom du créateur (creatorName)
      .replace(/\bKafie\b/g, creatorName)
      .replace(/\bkafie\b/g, creatorName.toLowerCase())
      .replace(/KAFIE\b/g, creatorName.toUpperCase())
      // Remplacements pour TheKafie
      .replace(/TheKafie/g, creatorName)
      .replace(/thekafie/gi, creatorName.toLowerCase())
      // Remplacements pour Kaftiere (remplacé par le nom du créateur)
      .replace(/\bKaftiere\b/g, creatorName)
      .replace(/\bkaftiere\b/g, creatorName.toLowerCase())
      // Remplacements pour TheBibux / Bobux (pour compatibilité)
      .replace(/TheBibux/g, creatorName)
      .replace(/Bobux/g, shortName)
      .replace(/thebibux/gi, creatorName.toLowerCase())
      .replace(/bobux/gi, shortName.toLowerCase())
      // Remplacements pour Bobuxbonus.com / Kaftierebonus.com / KAFIEBONUS.COM / kafiebonus.com
      .replace(/Bobuxbonus\.com/gi, brandName)
      .replace(/bobuxbonus\.com/gi, brandName.toLowerCase())
      .replace(/BOBUXBONUS\.COM/gi, brandName.toUpperCase())
      .replace(/Kaftierebonus\.com/gi, brandName)
      .replace(/kaftierebonus\.com/gi, brandName.toLowerCase())
      .replace(/KAFIEBONUS\.COM/gi, brandName.toUpperCase())
      .replace(/Kafiebonus\.com/gi, brandName)
      .replace(/kafiebonus\.com/gi, brandName.toLowerCase())
      .replace(/{brandName}/g, brandName);
  }
  if (Array.isArray(trans)) {
    return trans.map(item => replaceNamesInTranslations(item, creatorName, shortName, brandName));
  }
  if (trans && typeof trans === "object") {
    const result: any = {};
    for (const key in trans) {
      result[key] = replaceNamesInTranslations(trans[key], creatorName, shortName, brandName);
    }
    return result;
  }
  return trans;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Récupérer la langue depuis localStorage ou utiliser 'fr' par défaut
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      return (saved && (saved === "fr" || saved === "en")) ? saved : "fr";
    }
    return "fr";
  });

  const [brandText, setBrandText] = useState({
    creatorName: "TheBibux",
    creatorShort: "Bobux",
    brandName: "BOBUXBONUS.COM",
  });

  useEffect(() => {
    const loadBrandText = async () => {
      try {
        const res = await fetch("/api/brand-text");
        const data = await res.json();
        if (data.text) {
          setBrandText({
            creatorName: data.text.creatorName || "TheBibux",
            creatorShort: data.text.creatorShort || "Bobux",
            brandName: data.text.brandName || "BOBUXBONUS.COM",
          });
        }
      } catch (e) {
        console.error("Erreur chargement textes de marque:", e);
      }
    };
    loadBrandText();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  // S'assurer que la langue est sauvegardée dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  }, [language]);

  // Remplacer les noms dans les traductions
  const translatedText = replaceNamesInTranslations(
    translations[language],
    brandText.creatorName,
    brandText.creatorShort,
    brandText.brandName
  );

  const value = {
    language,
    setLanguage,
    t: translatedText,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

