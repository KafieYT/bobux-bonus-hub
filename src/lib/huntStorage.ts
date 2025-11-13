import { Hunt } from '@/types/hunt';

const STORAGE_KEY = 'bonus_hunts';

export const huntStorage = {
  getAll: (): Hunt[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Hunt | null => {
    const hunts = huntStorage.getAll();
    return hunts.find(h => h.id === id) || null;
  },

  save: (hunt: Hunt): void => {
    const hunts = huntStorage.getAll();
    const index = hunts.findIndex(h => h.id === hunt.id);
    
    if (index >= 0) {
      hunts[index] = hunt;
    } else {
      hunts.push(hunt);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hunts));
  },

  delete: (id: string): void => {
    const hunts = huntStorage.getAll().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hunts));
  }
};
