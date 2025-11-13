export interface Slot {
  id: string;
  name: string;
  provider: string;
  bet: number;
  gain: number;
  status: 'waiting' | 'collected';
  player?: string;
  bounty?: boolean;
}

export interface Hunt {
  id: string;
  title: string;
  startAmount: number;
  currency: 'EUR' | 'USD' | 'GBP';
  slots: Slot[];
  createdAt: string;
  creator?: string;
  creatorId?: string; // Discord user ID
}

export interface HuntStats {
  totalGain: number;
  profit: number;
  breakEvenFixed: number;
  breakEvenEvolutive: number;
  breakEvenPerSlot: number;
  remainingBet: number;
  breakEvenInitial: number;
  averageMultiplier: number;
  waitingSlots: number;
  collectedSlots: number;
  providers: string[];
  remarkableSlots: Slot[];
}
