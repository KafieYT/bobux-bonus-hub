import { Hunt, HuntStats, Slot } from '@/types/hunt';

export const calculateHuntStats = (hunt: Hunt): HuntStats => {
  const totalGain = hunt.slots.reduce((sum, slot) => sum + slot.gain, 0);
  const totalInitialBet = hunt.slots.reduce((sum, slot) => sum + slot.bet, 0);
  const profit = totalGain - hunt.startAmount;
  
  const waitingSlots = hunt.slots.filter(s => s.status === 'waiting').length;
  const collectedSlots = hunt.slots.filter(s => s.status === 'collected').length;
  const waitingSlotsList = hunt.slots.filter(s => s.status === 'waiting');
  const remainingBet = waitingSlotsList.reduce((sum, slot) => sum + slot.bet, 0);
  const collectedSlotsList = hunt.slots.filter(s => s.status === 'collected' && s.bet > 0);
  const totalCollectedMultiplier = collectedSlotsList.reduce((sum, slot) => sum + slot.gain / slot.bet, 0);
  const averageMultiplier = collectedSlotsList.length > 0 ? totalCollectedMultiplier / collectedSlotsList.length : 0;
  
  // Break even fixe : combien il faut gagner au total pour atteindre le montant de départ
  const breakEvenFixed = Math.max(0, hunt.startAmount - totalGain);
  
  // Break even évolutif : multiplicateur moyen que les slots restants doivent payer
  const breakEvenEvolutive = remainingBet > 0 ? breakEvenFixed / remainingBet : 0;

  // Montant moyen à obtenir par slot restant
  const breakEvenPerSlot = waitingSlots > 0 ? breakEvenFixed / waitingSlots : 0;

  // Break even initial (avant ouverture des bonus)
  const breakEvenInitial = totalInitialBet > 0 ? hunt.startAmount / totalInitialBet : 0;
  
  // Providers uniques
  const providers = [...new Set(hunt.slots.map(s => s.provider))].filter(Boolean);
  
  // Slots remarquables (gains > 100x la mise)
  const remarkableSlots = hunt.slots.filter(s => s.bet > 0 && s.gain / s.bet >= 100);
  
  return {
    totalGain,
    profit,
    breakEvenFixed,
    breakEvenEvolutive,
    breakEvenPerSlot,
    remainingBet,
    breakEvenInitial,
    averageMultiplier,
    waitingSlots,
    collectedSlots,
    providers,
    remarkableSlots
  };
};
