import { useState, useEffect, useCallback } from "react";

interface UsePointsReturn {
  points: number;
  loading: boolean;
  error: string | null;
  addPoints: (amount: number, reason?: string) => Promise<boolean>;
  subtractPoints: (amount: number, reason?: string) => Promise<boolean>;
  setPoints: (amount: number) => Promise<boolean>;
  refreshPoints: () => Promise<void>;
}

export const usePoints = (): UsePointsReturn => {
  const [points, setPointsState] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/points", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Utilisateur non connecté
          setPointsState(0);
          setLoading(false);
          return;
        }
        throw new Error("Erreur lors de la récupération des points");
      }

      const data = await response.json();
      setPointsState(Math.round((data.points || 0) * 100) / 100); // Arrondir à 2 décimales
    } catch (err) {
      console.error("Error fetching points:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const addPoints = useCallback(
    async (amount: number, reason?: string): Promise<boolean> => {
      try {
        setError(null);
        const response = await fetch("/api/points/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ amount, reason }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'ajout de points");
        }

        const data = await response.json();
        setPointsState(Math.round((data.points || 0) * 100) / 100); // Arrondir à 2 décimales
        return true;
      } catch (err) {
        console.error("Error adding points:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    []
  );

  const subtractPoints = useCallback(
    async (amount: number, reason?: string): Promise<boolean> => {
      try {
        setError(null);
        const response = await fetch("/api/points/subtract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ amount, reason }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la soustraction de points");
        }

        const data = await response.json();
        setPointsState(Math.round((data.points || 0) * 100) / 100); // Arrondir à 2 décimales
        return true;
      } catch (err) {
        console.error("Error subtracting points:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    []
  );

  const setPoints = useCallback(
    async (amount: number): Promise<boolean> => {
      try {
        setError(null);
        const response = await fetch("/api/points/set", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la définition des points");
        }

        const data = await response.json();
        setPointsState(Math.round((data.points || 0) * 100) / 100); // Arrondir à 2 décimales
        return true;
      } catch (err) {
        console.error("Error setting points:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    []
  );

  return {
    points,
    loading,
    error,
    addPoints,
    subtractPoints,
    setPoints,
    refreshPoints: fetchPoints,
  };
};

