import { create } from 'zustand';
import type { Puzzle } from '../data/puzzles';
import { puzzles as defaultPuzzles } from '../data/puzzles';
import { TOTAL_LEVELS } from '../data/levels';
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';
import { playAchievementJingle, playFlashlightToggle } from '../utils/soundEffects';

const PROGRESS_STORAGE_KEY = 'abyss-progress-v1';
const ACHIEVEMENTS_STORAGE_KEY = 'abyss-achievements-v1';
const BEST_TIMES_STORAGE_KEY = 'abyss-best-times-v1';

interface StoredProgress {
  completedLevels: number[];
  unlockedLevel: number;
}

function loadProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return { completedLevels: [], unlockedLevel: 1 };
    const parsed = JSON.parse(raw);
    return {
      completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
      unlockedLevel: typeof parsed.unlockedLevel === 'number' ? parsed.unlockedLevel : 1,
    };
  } catch {
    return { completedLevels: [], unlockedLevel: 1 };
  }
}

function saveProgress(progress: StoredProgress) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore in private mode
  }
}

function loadAchievements(): string[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAchievements(list: string[]) {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function loadBestTimes(): Record<number, number> {
  try {
    const raw = localStorage.getItem(BEST_TIMES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBestTimes(times: Record<number, number>) {
  try {
    localStorage.setItem(BEST_TIMES_STORAGE_KEY, JSON.stringify(times));
  } catch {}
}

const initialProgress = loadProgress();

interface GameState {
  hoveredObject: string | null;
  setHoveredObject: (name: string | null) => void;
  inventory: string[];
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;
  hasItem: (item: string) => boolean;
  message: string | null;
  setMessage: (msg: string | null) => void;
  activePuzzleId: number | null;
  setActivePuzzle: (id: number | null) => void;
  dynamicPuzzles: Record<number, Puzzle>;
  setDynamicPuzzle: (id: number, puzzle: Puzzle) => void;
  puzzleSources: Record<number, 'gemini' | 'curated'>;
  setPuzzleSource: (id: number, source: 'gemini' | 'curated') => void;
  isGeneratingPuzzle: boolean;
  setIsGeneratingPuzzle: (val: boolean) => void;
  escaped: boolean;
  setEscaped: (val: boolean) => void;
  appState: 'LANDING' | 'LEVEL_SELECT' | 'CHAPTER_PROLOGUE' | 'PLAYING';
  setAppState: (state: 'LANDING' | 'LEVEL_SELECT' | 'CHAPTER_PROLOGUE' | 'PLAYING') => void;
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  resetLevel: () => void;
  getPuzzle: (id: number) => Puzzle | undefined;

  // Sanity System State
  sanity: number;
  decreaseSanity: (amount: number) => void;
  restoreSanity: (amount: number) => void;
  resetSanity: () => void;

  // Flashlight State
  flashlightOn: boolean;
  toggleFlashlight: () => void;

  // Speedrun Timer State
  sectorStartTime: number | null;
  bestTimes: Record<number, number>;
  startSectorTimer: () => void;
  recordSectorSolve: (level: number) => { timeMs: number; isNewBest: boolean };

  // Error & Hint telemetry for achievements
  errorsThisSector: number;
  hintsUsedThisSector: number;
  interactedObjects: Set<string>;
  recordError: () => void;
  recordHintUse: () => void;
  recordInteraction: (objName: string) => void;

  // Achievements State
  achievements: string[];
  unlockedAchievementNotification: Achievement | null;
  clearAchievementNotification: () => void;
  unlockAchievement: (id: string) => void;

  completedLevels: number[];
  unlockedLevel: number;
  recentlyCompletedLevel: number | null;
  clearRecentlyCompleted: () => void;
  completeLevel: (level: number) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  hoveredObject: null,
  setHoveredObject: (name) => set({ hoveredObject: name }),
  inventory: [],
  addToInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  removeFromInventory: (item) => set((state) => ({ inventory: state.inventory.filter((i) => i !== item) })),
  hasItem: (item) => get().inventory.includes(item),
  message: null,
  setMessage: (msg) => {
    set({ message: msg });
    if (msg) {
      setTimeout(() => {
        set({ message: null });
      }, 4000);
    }
  },
  activePuzzleId: null,
  setActivePuzzle: (id) => {
    set({ activePuzzleId: id });
    if (id) {
      // Check first breach trigger when puzzle is opened
      get().unlockAchievement('first_breach');
    }
  },
  dynamicPuzzles: {},
  setDynamicPuzzle: (id, puzzle) =>
    set((state) => ({ dynamicPuzzles: { ...state.dynamicPuzzles, [id]: puzzle } })),
  puzzleSources: {},
  setPuzzleSource: (id, source) =>
    set((state) => ({ puzzleSources: { ...state.puzzleSources, [id]: source } })),
  isGeneratingPuzzle: false,
  setIsGeneratingPuzzle: (val) => set({ isGeneratingPuzzle: val }),
  escaped: false,
  setEscaped: (val) => set({ escaped: val }),
  appState: 'LANDING',
  setAppState: (state) => {
    set({ appState: state });
    if (state === 'PLAYING') {
      get().startSectorTimer();
      get().resetSanity();
    }
  },
  currentLevel: 1,
  setCurrentLevel: (level) => {
    set({ currentLevel: level });
    get().startSectorTimer();
    get().resetSanity();
  },
  resetLevel: () =>
    set({
      inventory: [],
      escaped: false,
      activePuzzleId: null,
      hoveredObject: null,
      isGeneratingPuzzle: false,
      errorsThisSector: 0,
      hintsUsedThisSector: 0,
      sanity: 100,
    }),
  getPuzzle: (id: number) => {
    const dynamic = get().dynamicPuzzles[id];
    if (dynamic) return dynamic;
    return defaultPuzzles.find((p) => p.id === id);
  },

  // Sanity Mechanics
  sanity: 100,
  decreaseSanity: (amount: number) => {
    set((state) => ({
      sanity: Math.max(5, Math.min(100, state.sanity - amount)),
    }));
  },
  restoreSanity: (amount: number) => {
    set((state) => ({
      sanity: Math.min(100, state.sanity + amount),
    }));
  },
  resetSanity: () => set({ sanity: 100 }),

  // Flashlight
  flashlightOn: true,
  toggleFlashlight: () => {
    const nextState = !get().flashlightOn;
    playFlashlightToggle(nextState);
    set({ flashlightOn: nextState });
  },

  // Timer & Best Times
  sectorStartTime: Date.now(),
  bestTimes: loadBestTimes(),
  startSectorTimer: () => {
    set({
      sectorStartTime: Date.now(),
      errorsThisSector: 0,
      hintsUsedThisSector: 0,
    });
  },
  recordSectorSolve: (level: number) => {
    const start = get().sectorStartTime || Date.now();
    const timeMs = Math.max(1000, Date.now() - start);
    const existingBest = get().bestTimes[level];
    const isNewBest = !existingBest || timeMs < existingBest;

    const newBestTimes = {
      ...get().bestTimes,
      [level]: isNewBest ? timeMs : existingBest,
    };
    saveBestTimes(newBestTimes);
    set({ bestTimes: newBestTimes });

    // Evaluate Speed Demon (< 90 seconds)
    if (timeMs <= 90000) {
      get().unlockAchievement('speed_demon');
    }

    // Evaluate Zero Leak
    if (get().errorsThisSector === 0 && get().hintsUsedThisSector === 0) {
      get().unlockAchievement('zero_leak');
    }

    return { timeMs, isNewBest };
  },

  // Telemetry
  errorsThisSector: 0,
  hintsUsedThisSector: 0,
  interactedObjects: new Set<string>(),
  recordError: () => set((state) => ({ errorsThisSector: state.errorsThisSector + 1 })),
  recordHintUse: () => set((state) => ({ hintsUsedThisSector: state.hintsUsedThisSector + 1 })),
  recordInteraction: (objName: string) => {
    const setCopy = new Set(get().interactedObjects);
    setCopy.add(objName);
    set({ interactedObjects: setCopy });
    if (setCopy.size >= 6) {
      get().unlockAchievement('paranormal_curator');
    }
  },

  // Achievements
  achievements: loadAchievements(),
  unlockedAchievementNotification: null,
  clearAchievementNotification: () => set({ unlockedAchievementNotification: null }),
  unlockAchievement: (id: string) => {
    const current = get().achievements;
    if (current.includes(id)) return;

    const found = ACHIEVEMENTS.find((a) => a.id === id);
    const updated = [...current, id];
    saveAchievements(updated);
    playAchievementJingle();

    set({
      achievements: updated,
      unlockedAchievementNotification: found || null,
    });

    if (found) {
      setTimeout(() => {
        if (get().unlockedAchievementNotification?.id === id) {
          get().clearAchievementNotification();
        }
      }, 4500);
    }
  },

  completedLevels: initialProgress.completedLevels,
  unlockedLevel: initialProgress.unlockedLevel,
  recentlyCompletedLevel: null,
  clearRecentlyCompleted: () => set({ recentlyCompletedLevel: null }),
  completeLevel: (level) => {
    const state = get();
    get().recordSectorSolve(level);

    const completedLevels = state.completedLevels.includes(level)
      ? state.completedLevels
      : [...state.completedLevels, level];
    const unlockedLevel = Math.min(Math.max(state.unlockedLevel, level + 1), TOTAL_LEVELS);
    saveProgress({ completedLevels, unlockedLevel });
    set({ completedLevels, unlockedLevel, recentlyCompletedLevel: level });

    if (completedLevels.length >= TOTAL_LEVELS) {
      get().unlockAchievement('quantum_sovereign');
    }

    get().resetLevel();
  },
  resetProgress: () => {
    saveProgress({ completedLevels: [], unlockedLevel: 1 });
    saveBestTimes({});
    set({
      completedLevels: [],
      unlockedLevel: 1,
      currentLevel: 1,
      recentlyCompletedLevel: null,
      dynamicPuzzles: {},
      puzzleSources: {},
      bestTimes: {},
      sanity: 100,
    });
    get().resetLevel();
  },
}));
