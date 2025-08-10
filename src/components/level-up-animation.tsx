import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface LevelUpAnimationProps {
  level: number;
  onAnimationComplete: () => void;
}

const colors = ['#FFD700', '#FF6347', '#6A5ACD', '#3CB371', '#FF69B4'];

export function LevelUpAnimation({ level, onAnimationComplete }: LevelUpAnimationProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    setShowText(true);
    const timer = setTimeout(() => {
      setShowText(false);
      onAnimationComplete();
    }, 3000); // Animation duration

    const interval = setInterval(() => {
      const newFireworks: Firework[] = [];
      for (let i = 0; i < 20; i++) {
        newFireworks.push({
          id: Date.now() + i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.7, // Upper 70% of screen
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      setFireworks(prev => [...prev, ...newFireworks].slice(-50)); // Keep a max of 50 fireworks
    }, 200); // Spawn new fireworks every 200ms

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [level, onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-white text-center p-8 rounded-lg shadow-2xl bg-gradient-to-br from-purple-600 to-pink-600 relative z-10"
          >
            <Sparkles className="w-24 h-24 mx-auto text-yellow-300 animate-pulse" />
            <h2 className="text-5xl font-extrabold mt-4 mb-2 drop-shadow-lg">LEVEL UP!</h2>
            <p className="text-3xl font-semibold drop-shadow-md">You reached Level {level}!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {fireworks.map((firework) => (
        <motion.div
          key={firework.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: firework.color,
            width: 10,
            height: 10,
            left: firework.x,
            top: firework.y,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: firework.y - 50 }}
          exit={{ opacity: 0, scale: 0, y: firework.y + 100 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}