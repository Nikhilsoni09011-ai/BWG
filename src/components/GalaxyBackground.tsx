import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export const GalaxyBackground = ({ theme = 'midnight' }: { theme?: string }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // vw
      y: Math.random() * 100, // vh
      size: Math.random() * 4 + 1, // 1px to 5px
      duration: Math.random() * 30 + 20, // 20s to 50s
      delay: Math.random() * -50, // random start time
      xMove: Math.random() * 150 - 75,
      yMove: Math.random() * 150 - 75,
      colorIndex: Math.random() > 0.5 ? 0 : 1, // 0 or 1 for the two theme colors
    }));
  }, []);

  const themeColors = useMemo(() => {
    switch (theme) {
      case 'classic':
        return {
          bg: 'bg-[#1a0a05]',
          particles: ['#fbbf24', '#f43f5e'],
          gradient1: 'rgba(251, 191, 36, 0.08)',
          gradient2: 'rgba(244, 63, 94, 0.08)'
        };
      case 'galaxy':
        return {
          bg: 'bg-[#05051a]',
          particles: ['#8b5cf6', '#a78bfa'],
          gradient1: 'rgba(139, 92, 246, 0.08)',
          gradient2: 'rgba(167, 139, 250, 0.08)'
        };
      case 'emerald':
        return {
          bg: 'bg-[#051a1a]',
          particles: ['#2dd4bf', '#14b8a6'],
          gradient1: 'rgba(45, 212, 191, 0.08)',
          gradient2: 'rgba(20, 184, 166, 0.08)'
        };
      case 'frost':
        return {
          bg: 'bg-[#05111a]',
          particles: ['#38bdf8', '#e2e8f0'],
          gradient1: 'rgba(56, 189, 248, 0.08)',
          gradient2: 'rgba(226, 232, 240, 0.08)'
        };
      case 'party':
        return {
          bg: 'bg-[#1a0515]',
          particles: ['#f472b6', '#34d399'],
          gradient1: 'rgba(244, 114, 182, 0.08)',
          gradient2: 'rgba(52, 211, 153, 0.08)'
        };
      case 'floating-hearts':
        return {
          bg: 'bg-[#1a050b]',
          particles: ['#fda4af', '#f43f5e'],
          gradient1: 'rgba(253, 164, 175, 0.08)',
          gradient2: 'rgba(244, 63, 94, 0.08)'
        };
      case 'neon-hearts':
        return {
          bg: 'bg-[#0a051a]',
          particles: ['#e879f9', '#22d3ee'],
          gradient1: 'rgba(232, 121, 249, 0.08)',
          gradient2: 'rgba(34, 211, 238, 0.08)'
        };
      case 'sparkle-hearts':
        return {
          bg: 'bg-[#1a0f05]',
          particles: ['#fde047', '#fda4af'],
          gradient1: 'rgba(253, 224, 71, 0.08)',
          gradient2: 'rgba(253, 164, 175, 0.08)'
        };
      case 'two-hearts':
        return {
          bg: 'bg-[#1a0505]',
          particles: ['#ef4444', '#f87171'],
          gradient1: 'rgba(239, 68, 68, 0.08)',
          gradient2: 'rgba(248, 113, 113, 0.08)'
        };
      case 'midnight':
      default:
        return {
          bg: 'bg-[#08030e]',
          particles: ['#f472b6', '#c084fc'],
          gradient1: 'rgba(236, 72, 153, 0.08)',
          gradient2: 'rgba(139, 92, 246, 0.08)'
        };
    }
  }, [theme]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${themeColors.bg} transition-colors duration-1000`}>
      {/* Base gradient glows */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen transition-all duration-1000" 
           style={{
             backgroundImage: `radial-gradient(circle at 30% 30%, ${themeColors.gradient1} 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${themeColors.gradient2} 0%, transparent 50%)`
           }}>
      </div>
      
      {/* Drifting galaxy particles */}
      {particles.map((p) => {
        const pColor = themeColors.particles[p.colorIndex];
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full transition-all duration-1000"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}vw`,
              top: `${p.y}vh`,
              backgroundColor: p.size > 3 ? pColor : '#ffffff',
              boxShadow: `0 0 ${p.size * 3}px ${p.size > 3 ? pColor : '#ffffff'}`,
            }}
            animate={{
              x: [0, p.xMove, 0],
              y: [0, p.yMove, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
};
