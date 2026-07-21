import React, { useMemo } from 'react';
import { motion } from 'motion/react';

const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];

export const Confetti = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      initialX: Math.random() * 100 - 50, // -50vw to 50vw
      finalX: Math.random() * 120 - 60,
      duration: Math.random() * 2.5 + 2, // 2s to 4.5s
      delay: Math.random() * 0.8, // stagger
      rotation: Math.random() * 720 - 360, // random rotation
      scale: Math.random() * 0.6 + 0.4,
      color: COLORS[i % COLORS.length]
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex justify-center">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 1,
            y: '-10vh',
            x: `${p.initialX}vw`,
            rotate: 0,
            scale: p.scale
          }}
          animate={{
            opacity: [1, 1, 0.8, 0],
            y: '110vh',
            x: `${p.finalX}vw`,
            rotate: p.rotation
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear'
          }}
          className={`absolute top-0 left-1/2 w-3 h-3 ${p.id % 3 === 0 ? 'rounded-full' : 'rounded-sm'}`}
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};
