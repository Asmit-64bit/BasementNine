import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const ShapeTypes = ['circle', 'square', 'diamond'] as const;

export const AnimatedBackground: React.FC = () => {
  // Generate particles only once
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      type: ShapeTypes[Math.floor(Math.random() * ShapeTypes.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      duration: Math.random() * 40 + 30, // Slow drift
      delay: Math.random() * -40,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-bg-base">
      {/* Faint dark-red radial gradient centered right-of-middle */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 50%, rgba(20, 5, 5, 1) 0%, rgba(5, 7, 5, 1) 60%)'
        }}
      />

      {/* Drifting geometric particles */}
      <div className="absolute inset-0 opacity-[0.09]">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={cn(
              "absolute border border-text-main",
              p.type === 'circle' && "rounded-full",
              p.type === 'diamond' && "rotate-45"
            )}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: ["0%", "-100%"],
              rotate: p.type === 'circle' ? 0 : 360,
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Faint diagonal scanlines */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
        }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </div>
  );
};
