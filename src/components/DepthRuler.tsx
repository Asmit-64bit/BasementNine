import React from 'react';
import { levels } from '../levels';
import { useGame } from '../context/GameContext';

export const DepthRuler: React.FC = () => {
  const { getDeepestUnlockedLevel } = useGame();
  const deepestUnlocked = getDeepestUnlockedLevel();
  
  // Calculate max progress height based on levels array (roughly mapping ID to percentage)
  const progressPercentage = (deepestUnlocked / levels.length) * 100;

  return (
    <div className="absolute left-8 top-32 bottom-32 w-16 hidden lg:flex flex-col items-end z-10">
      {/* The main vertical line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-muted/30">
        <div 
          className="w-full bg-green transition-all duration-1000 ease-in-out"
          style={{ height: `${progressPercentage}%` }}
        />
      </div>

      {/* Tick marks and labels */}
      <div className="w-full h-full flex flex-col justify-between py-6">
        {levels.map((level) => {
          const isUnlocked = level.id <= deepestUnlocked;
          return (
            <div key={level.id} className="relative flex items-center justify-end w-full group">
              <span 
                className={`text-[10px] mr-4 transition-colors ${
                  isUnlocked ? 'text-green' : 'text-muted'
                }`}
              >
                {level.depth}
              </span>
              <div 
                className={`w-3 h-px absolute right-0 transition-colors ${
                  isUnlocked ? 'bg-green' : 'bg-muted'
                }`} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
