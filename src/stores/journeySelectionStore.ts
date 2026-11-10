import { create } from 'zustand';

export type ParetoCriteria = 'fastest' | 'transfers' | 'walking';

interface JourneySelectionState {
  selectedCriteria: ParetoCriteria;
  selectedItineraryId: string | null;
  setSelectedCriteria: (criteria: ParetoCriteria) => void;
  setSelectedItineraryId: (id: string | null) => void;
  resetSelection: () => void;
}

export const useJourneySelectionStore = create<JourneySelectionState>((set) => ({
  selectedCriteria: 'fastest',
  selectedItineraryId: null,
  setSelectedCriteria: (selectedCriteria) => set({ selectedCriteria }),
  setSelectedItineraryId: (selectedItineraryId) => set({ selectedItineraryId }),
  resetSelection: () => set({ selectedCriteria: 'fastest', selectedItineraryId: null }),
}));
