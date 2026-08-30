import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { levels } from '../levels';

interface GameContextType {
  unlockedLevels: number[];
  completedLevels: number[];
  fragmentProgress: Record<number, number>;
  getDeepestUnlockedLevel: () => number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [fragmentProgress, setFragmentProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    // Read from localStorage on mount
    const savedUnlocked = localStorage.getItem('unlockedLevels');
    const savedCompleted = localStorage.getItem('completedLevels');
    const savedProgress = localStorage.getItem('fragmentProgress');

    if (savedUnlocked) setUnlockedLevels(JSON.parse(savedUnlocked));
    if (savedCompleted) setCompletedLevels(JSON.parse(savedCompleted));
    if (savedProgress) setFragmentProgress(JSON.parse(savedProgress));
  }, []);

  const getDeepestUnlockedLevel = () => {
    return Math.max(...unlockedLevels, 1);
  };

  return (
    <GameContext.Provider
      value={{
        unlockedLevels,
        completedLevels,
        fragmentProgress,
        getDeepestUnlockedLevel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
