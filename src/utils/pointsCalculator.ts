/**
 * Calcule les points à attribuer en fonction du multiplicateur du call
 * @param multiplier Le multiplicateur du call
 * @returns Le nombre de points à attribuer
 */
export function calculatePointsFromMultiplier(multiplier: number | undefined): number {
  if (!multiplier || multiplier === 0) {
    return 0;
  }
  
  if (multiplier >= 1000) {
    return 100;
  }
  
  if (multiplier >= 500) {
    return 50;
  }
  
  if (multiplier >= 100) {
    return 20;
  }
  
  if (multiplier >= 50) {
    return 10;
  }
  
  if (multiplier >= 10) {
    return 5;
  }
  
  return 0;
}

/**
 * Récupère les informations de points pour chaque niveau de multiplicateur
 */
export function getPointsTable() {
  return [
    { multiplier: 0, label: "X0", points: 0 },
    { multiplier: 10, label: "X10", points: 5 },
    { multiplier: 50, label: "X50", points: 10 },
    { multiplier: 100, label: "X100", points: 20 },
    { multiplier: 500, label: "X500", points: 50 },
    { multiplier: 1000, label: "X1000+", points: 100 },
  ];
}

