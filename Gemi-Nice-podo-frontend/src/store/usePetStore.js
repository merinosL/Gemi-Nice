import { create } from 'zustand';

export const usePetStore = create((set) => ({
  bones: 0,
  petState: 'whatsup', // 'whatsup', 'wink', 'cold', 'anger', 'up-balloon'
  addBone: () => set((state) => ({ bones: state.bones + 1 })),
  setPetState: (newState) => set({ petState: newState }),
}));