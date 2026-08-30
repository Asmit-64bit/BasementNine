import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { type LevelData } from '../levels';
import { cn } from '../lib/utils';
import { useGame } from '../context/GameContext';

interface LevelCardProps {
  level: LevelData;
  isFocused: boolean;
  onHover: (levelId: number) => void;
  onLeave: () => void;
}

const ShapeIcon: React.FC<{ shape: string }> = ({ shape }) => {
  switch (shape) {
    case 'circle': return <div className="w-4 h-4 rounded-full border border-current" />;
    case 'square': return <div className="w-4 h-4 border border-current" />;
    case 'diamond': return <div className="w-4 h-4 border border-current rotate-45" />;
    case 'triangle': return (
      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-current" />
    );
    case 'hexagon': return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>
    );
    default: return <div className="w-4 h-4 border border-current" />;
  }
};

export const LevelCard: React.FC<LevelCardProps> = ({ level, isFocused, onHover, onLeave }) => {
  const { unlockedLevels, completedLevels, fragmentProgress, getDeepestUnlockedLevel } = useGame();
  const navigate = useNavigate();

  const isUnlocked = unlockedLevels.includes(level.id);
  const isCompleted = completedLevels.includes(level.id);
  const isCurrent = level.id === getDeepestUnlockedLevel();
  const fragmentsSolved = fragmentProgress[level.id] || 0;

  const handleClick = () => {
    if (isUnlocked) {
      // simulate flash then route
      navigate(`/story/${level.id}`);
    }
  };

  const padId = (id: number) => id.toString().padStart(2, '0');

  return (
    <div 
      className={cn(
        "relative w-full max-w-sm group transition-transform duration-200",
        isUnlocked ? "cursor-pointer hover:-translate-y-[2px]" : "cursor-not-allowed",
        isFocused && isUnlocked && "ring-2 ring-green ring-offset-4 ring-offset-bg-base rounded-sm"
      )}
      onMouseEnter={() => onHover(level.id)}
      onMouseLeave={onLeave}
      onClick={handleClick}
      tabIndex={isUnlocked ? 0 : -1}
      role="button"
    >
      {/* Hover glow for unlocked */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-red/0 group-hover:bg-red/5 blur-xl transition-colors duration-300 pointer-events-none" />
      )}

      {/* Hover flicker for locked */}
      {!isUnlocked && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-[50ms]">
          <div className="w-full h-full bg-red" />
        </div>
      )}

      {/* The dashed border for current level */}
      {isCurrent && (
        <div className="absolute -inset-[2px] marching-ants-border z-0" />
      )}

      <div className={cn(
        "relative z-10 w-full bg-panel p-3 clip-notched",
        isCurrent ? "border-none" : isCompleted ? "border border-green/30" : "border border-muted/20"
      )}>
        {/* Top Row: Icon + ID and Depth */}
        <div className="flex justify-between items-center mb-3 text-[10px] font-mono">
          <div className={cn("flex items-center gap-2", isUnlocked ? "text-dim-green" : "text-muted/35")}>
            <ShapeIcon shape={level.shape} />
            <span>{padId(level.id)}</span>
          </div>
          <div className={cn("tracking-widest", isUnlocked ? "text-dim-green" : "text-muted/35")}>
            {level.depth}
          </div>
        </div>

        {/* Level Name / Redacted */}
        <div className="mb-2">
          {isUnlocked ? (
            <h3 className="text-lg font-bold text-text-main uppercase tracking-widest">
              {level.name}
            </h3>
          ) : (
            <div className="flex gap-2 items-center h-7">
              <div className="h-5 bg-muted/20 w-16" />
              <div className="h-5 bg-muted/20 w-24" />
              <div className="h-5 bg-muted/20 w-12" />
            </div>
          )}
        </div>

        {/* Meta Line */}
        <div className="text-[10px] text-muted tracking-widest font-mono flex items-center gap-2 uppercase">
          {isCompleted ? (
            <>
              <Check className="w-3 h-3 text-green" />
              <span className="text-green">CLEARED</span>
            </>
          ) : isCurrent ? (
            <>
              <span className="text-red">CURRENT</span>
              <span>·</span>
              <span>{level.fragments} FRAGMENTS</span>
              <span>·</span>
              <span>{level.concepts.join(' & ')}</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 text-muted/50" />
              <span>LOCKED · {level.fragments} FRAGMENTS</span>
            </>
          )}
        </div>

        {/* Progress Bar (only for unlocked) */}
        {isUnlocked && (
          <div className="mt-3 w-full h-px bg-dim-green/30 relative">
            <motion.div 
              className={cn("absolute left-0 top-0 bottom-0", isCompleted ? "bg-green" : "bg-red")}
              initial={{ width: 0 }}
              animate={{ width: `${(fragmentsSolved / level.fragments) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        )}
      </div>

      {/* Access Denied Tooltip on hover for locked */}
      {!isUnlocked && (
        <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-red text-xs tracking-widest pointer-events-none">
          ◈ ACCESS DENIED
        </div>
      )}
    </div>
  );
};
