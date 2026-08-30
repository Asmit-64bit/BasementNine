import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import { levels, type LevelData } from '../levels';
import { useGame } from '../context/GameContext';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { DepthRuler } from '../components/DepthRuler';
import { LevelCard } from '../components/LevelCard';
import { DetailPanel } from '../components/DetailPanel';
import { AchievementsModal } from '../components/AchievementsModal';
import { cn } from '../lib/utils';

export const LevelSelect: React.FC = () => {
  const navigate = useNavigate();
  const { unlockedLevels, completedLevels } = useGame();
  const [hoveredLevelId, setHoveredLevelId] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const unlockedCount = levels.filter(l => unlockedLevels.includes(l.id)).length;
  const hoveredLevel = levels.find(l => l.id === hoveredLevelId) || null;

  // Keyboard navigation
  useEffect(() => {
    if (isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, unlockedCount - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        const selectedId = levels[focusedIndex].id;
        if (unlockedLevels.includes(selectedId)) {
          navigate(`/story/${selectedId}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, unlockedCount, unlockedLevels, navigate, isModalOpen]);

  // Sync focus to hover state so Detail Panel updates
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < levels.length) {
      setHoveredLevelId(levels[focusedIndex].id);
      cardsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Prefetch GLB for hovered level
  useEffect(() => {
    if (hoveredLevelId) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/models/level-${hoveredLevelId}.glb`; // mock path
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [hoveredLevelId]);

  return (
    <div className="min-h-screen bg-bg-base text-text-main font-mono overflow-hidden relative selection:bg-green/30">
      <AnimatedBackground />
      <DepthRuler />
      <AchievementsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Top Bar */}
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-8 z-20">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted hover:text-text-main transition-colors text-xs tracking-widest uppercase group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Main Terminal
        </button>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-muted">
            Select a descent point
          </span>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="border border-muted/30 px-4 py-1.5 text-xs tracking-widest uppercase hover:bg-muted/10 transition-colors flex items-center gap-2 text-dim-green hover:text-green"
        >
          <Trophy className="w-3 h-3" />
          Achievements ({completedLevels.length}/6)
        </button>
      </header>

      {/* Main Layout */}
      <main className="pt-24 pb-24 px-8 lg:px-24 h-screen flex flex-col">
        
        {/* Title */}
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[0.3em] text-cyan text-glow-cyan chromatic-shadow mb-12 ml-4 lg:ml-16 animate-glitch"
        >
          Basement Nine
        </motion.h1>

        <div className="flex-1 flex flex-col lg:flex-row gap-12 lg:ml-16 overflow-hidden">
          
          {/* Left Column - Level Cards */}
          <div className="w-full lg:w-[40%] flex flex-col gap-4 overflow-y-auto pr-4 scrollbar-hide pb-20">
            {levels.map((level, i) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -50, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                ref={(el) => (cardsRef.current[i] = el)}
                className="outline-none"
              >
                <LevelCard 
                  level={level}
                  isFocused={focusedIndex === i}
                  onHover={(id) => {
                    setHoveredLevelId(id);
                    setFocusedIndex(i);
                  }}
                  onLeave={() => setHoveredLevelId(null)}
                />
              </motion.div>
            ))}
          </div>

          {/* Right Column - Detail Panel */}
          <div className="hidden lg:flex w-[55%] flex-col gap-4 pb-20">
            <DetailPanel hoveredLevel={hoveredLevel} />
          </div>

        </div>
      </main>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 w-full h-24 pointer-events-none opacity-30 z-0">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 100">
          <motion.path 
            d="M0,50 C320,100 420,0 720,50 C1020,100 1120,0 1440,50 L1440,100 L0,100 Z" 
            fill="var(--color-dim-green)"
            animate={{ d: [
              "M0,50 C320,100 420,0 720,50 C1020,100 1120,0 1440,50 L1440,100 L0,100 Z",
              "M0,50 C320,0 420,100 720,50 C1020,0 1120,100 1440,50 L1440,100 L0,100 Z",
              "M0,50 C320,100 420,0 720,50 C1020,100 1120,0 1440,50 L1440,100 L0,100 Z"
            ]}}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Bottom Right BGM Control */}
      <div className="absolute bottom-8 right-8 flex items-center gap-3 z-20">
        <div className="flex items-end gap-0.5 h-3">
          {[1,2,3,4].map((i) => (
            <motion.div 
              key={i}
              className="w-1 bg-dim-green"
              animate={{ height: ["20%", "100%", "40%"] }}
              transition={{ duration: 0.8 + i*0.2, repeat: Infinity, repeatType: "mirror" }}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted tracking-widest uppercase">
          ♫ BGM 35%
        </span>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default LevelSelect;
