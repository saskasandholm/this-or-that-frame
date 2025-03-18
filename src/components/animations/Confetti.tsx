'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  duration?: number;
  pieces?: number;
  colors?: string[];
}

const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  pieces = 100,
  colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#F24A72'],
}) => {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setIsVisible(false);
      return;
    }

    // Generate confetti particles
    const newParticles = Array.from({ length: pieces }).map((_, i) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 0.8 + 0.2; // 0.2 to 1
      const rotateInitial = Math.random() * 360;
      const rotateEnd = rotateInitial + Math.random() * 360 - 180;
      const x = Math.random() * 100; // 0-100%
      const yEnd = 100 + Math.random() * 20; // 100-120%
      const delay = Math.random() * 0.5; // 0-0.5s

      return (
        <motion.div
          key={i}
          initial={{
            x: `${x}%`,
            y: '-10%',
            rotate: rotateInitial,
            scale: size,
            opacity: 1,
          }}
          animate={{
            y: `${yEnd}%`,
            rotate: rotateEnd,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 2, // 2-4s
            delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
          }}
        />
      );
    });

    setParticles(newParticles);
    setIsVisible(true);

    // Hide after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, colors, duration, pieces]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {particles}
    </div>
  );
};

export default Confetti;
