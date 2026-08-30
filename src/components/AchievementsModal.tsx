import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const achievements = [
  { id: 1, title: 'First Descent', desc: 'Completed Level 1', unlocked: true },
  { id: 2, title: 'No Hints Used', desc: 'Cleared a room without hints', unlocked: false },
  { id: 3, title: 'Perfect Room', desc: '0 errors on first try', unlocked: false },
  { id: 4, title: 'Taught the Machine', desc: 'Finished the recursion loop', unlocked: false },
  { id: 5, title: 'Full Depth', desc: 'Reached the Core', unlocked: false },
  { id: 6, title: 'Speed Run', desc: 'Cleared any room under 2m', unlocked: false },
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleOutsideClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-panel border border-muted/30 w-full max-w-3xl font-mono text-text-main shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-muted/20">
              <div className="flex items-center gap-3">
                <Trophy className="text-cyan w-5 h-5" />
                <h2 className="text-xl font-bold tracking-widest text-cyan chromatic-shadow uppercase">
                  Achievements
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="text-muted hover:text-red transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6 text-sm text-dim-green tracking-widest">
                PROGRESS: {unlockedCount} / {achievements.length} UNLOCKED
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((ach) => (
                  <div 
                    key={ach.id}
                    className={cn(
                      "border p-4 flex flex-col gap-2 transition-all duration-300",
                      ach.unlocked 
                        ? "border-green/30 bg-green/5" 
                        : "border-muted/10 bg-black/50"
                    )}
                  >
                    {ach.unlocked ? (
                      <>
                        <div className="text-green font-bold tracking-wider">{ach.title}</div>
                        <div className="text-xs text-muted">{ach.desc}</div>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-2 items-center">
                          <div className="h-4 bg-muted/20 w-16" />
                          <div className="h-4 bg-muted/20 w-24" />
                        </div>
                        <div className="h-3 bg-muted/10 w-32 mt-1" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
