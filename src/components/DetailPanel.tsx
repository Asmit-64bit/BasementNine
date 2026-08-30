import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LevelData } from '../levels';
import { useGame } from '../context/GameContext';
import { cn } from '../lib/utils';

interface DetailPanelProps {
  hoveredLevel: LevelData | null;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ hoveredLevel }) => {
  const { unlockedLevels, completedLevels } = useGame();

  const isUnlocked = hoveredLevel ? unlockedLevels.includes(hoveredLevel.id) : false;
  const isCompleted = hoveredLevel ? completedLevels.includes(hoveredLevel.id) : false;
  
  const getStatus = (level: LevelData) => {
    if (!isUnlocked) return 'LOCKED';
    if (isCompleted) return 'CLEARED';
    return 'IN PROGRESS'; // Or UNEXPLORED based on fragment count, simplifying for now
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 font-mono text-sm tracking-widest">
      {/* Upper Box */}
      <div className="relative w-full h-64 border border-dashed border-muted/30 bg-panel overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!hoveredLevel && (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted/50 text-center"
            >
              AWAITING TARGET SELECTION
            </motion.div>
          )}

          {hoveredLevel && isUnlocked && (
            <motion.div
              key={`unlocked-${hoveredLevel.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <img 
                src={hoveredLevel.still} 
                alt={hoveredLevel.name}
                className="w-full h-full object-cover filter brightness-[0.4]"
                style={{ mixBlendMode: 'luminosity' }}
              />
              <div className="absolute inset-0 bg-green/20 mix-blend-color" />
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)'
                }}
              />
              <div className="absolute bottom-4 left-4 text-green font-bold text-lg uppercase shadow-black drop-shadow-md">
                {hoveredLevel.name}
              </div>
            </motion.div>
          )}

          {hoveredLevel && !isUnlocked && (
            <motion.div
              key={`locked-${hoveredLevel.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black flex items-center justify-center flex-col gap-2"
            >
              {/* Noise effect placeholder */}
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />
              <div className="text-red animate-pulse">SIGNAL LOST</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lower Box */}
      <div className="relative w-full flex-1 border border-muted/30 bg-panel p-6 flex flex-col justify-center min-h-[200px]">
        <AnimatePresence mode="wait">
          {!hoveredLevel && (
            <motion.div
              key="default-lower"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-6"
            >
              {/* SVG Wireframe Cube */}
              <div className="w-24 h-24 relative animate-[spin_10s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-green fill-none stroke-[0.5]">
                  <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" />
                  <line x1="50" y1="10" x2="50" y2="50" />
                  <line x1="90" y1="30" x2="50" y2="50" />
                  <line x1="10" y1="30" x2="50" y2="50" />
                  <line x1="50" y1="50" x2="50" y2="90" />
                  <line x1="10" y1="70" x2="90" y2="70" opacity="0.3" />
                  <line x1="90" y1="30" x2="10" y2="70" opacity="0.3" />
                </svg>
              </div>
              <div className="text-dim-green text-xs">SPECIMEN #04-A // CONTAINED</div>
            </motion.div>
          )}

          {hoveredLevel && isUnlocked && (
            <motion.div
              key={`unlocked-lower-${hoveredLevel.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 text-xs text-muted"
            >
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="text-dim-green">DEPTH</span>
                <span className="text-text-main">{hoveredLevel.depth}</span>
                
                <span className="text-dim-green">FRAGMENTS</span>
                <span className="text-text-main">{hoveredLevel.fragments}</span>
                
                <span className="text-dim-green">CONCEPTS</span>
                <span className="text-text-main">{hoveredLevel.concepts.join(' · ')}</span>
                
                <span className="text-dim-green">STATUS</span>
                <span className={cn(isCompleted ? "text-green" : "text-cyan")}>{getStatus(hoveredLevel)}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-muted/20 italic text-muted/70">
                {`"Data fragments detected at ${hoveredLevel.depth}. Proceed with caution."`}
              </div>
            </motion.div>
          )}

          {hoveredLevel && !isUnlocked && (
            <motion.div
              key={`locked-lower-${hoveredLevel.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red text-center"
            >
              DEPTH {hoveredLevel.depth.replace(/\d/g, '█')} · CLEARANCE INSUFFICIENT
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
