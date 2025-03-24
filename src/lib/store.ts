import { create } from 'zustand';
import { User, Note, PracticePage } from '@prisma/client';

interface UserWithSubscription extends User {
  subscription?: {
    planType: string;
    isActive: boolean;
  } | null;
}

interface AppState {
  user: UserWithSubscription | null;
  notes: Note[];
  practicePages: PracticePage[];
  isGeneratingNote: boolean;
  isGeneratingPracticePage: boolean;
  currentNote: Note | null;
  currentPracticePage: PracticePage | null;
  currentPractice: any | null;
  practices: any[];
  
  // Auth actions
  setUser: (user: UserWithSubscription | null) => void;
  
  // Note actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  setCurrentNote: (note: Note | null) => void;
  setIsGeneratingNote: (isGenerating: boolean) => void;
  
  // Practice page actions
  setPracticePages: (practicePages: PracticePage[]) => void;
  addPracticePage: (practicePage: PracticePage) => void;
  setCurrentPracticePage: (practicePage: PracticePage | null) => void;
  setIsGeneratingPracticePage: (isGenerating: boolean) => void;
  
  // Practice actions
  setCurrentPractice: (practice: any) => void;
  addPractice: (practice: any) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  notes: [],
  practicePages: [],
  isGeneratingNote: false,
  isGeneratingPracticePage: false,
  currentNote: null,
  currentPracticePage: null,
  currentPractice: null,
  practices: [],
  
  // Auth actions
  setUser: (user) => set({ user }),
  
  // Note actions
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  setCurrentNote: (note) => set({ currentNote: note }),
  setIsGeneratingNote: (isGenerating) => set({ isGeneratingNote: isGenerating }),
  
  // Practice page actions
  setPracticePages: (practicePages) => set({ practicePages }),
  addPracticePage: (practicePage) => set((state) => ({ 
    practicePages: [...state.practicePages, practicePage] 
  })),
  setCurrentPracticePage: (practicePage) => set({ currentPracticePage: practicePage }),
  setIsGeneratingPracticePage: (isGenerating) => set({ isGeneratingPracticePage: isGenerating }),
  
  // Practice actions
  setCurrentPractice: (practice) => set({ currentPractice: practice }),
  addPractice: (practice) => set((state) => ({ practices: [...state.practices, practice] })),
})); 