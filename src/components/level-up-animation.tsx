"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Trophy, Sparkles } from 'lucide-react';

interface LevelUpAnimationProps {
  show: boolean;
  level: number;
  pointsEarned: number;
  onComplete: () => void;
}

export default function LevelUpAnimation({ show, level, pointsEarned, onComplete }: LevelUpAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [fireworks, setFireworks] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Generate fireworks
      const newFireworks = [];
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
      
      for (let i = 0; i < 20; i++) {
        newFireworks.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setFireworks(newFireworks);
      
      // Auto-complete after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setFireworks([]);
          onComplete();
        }, 500);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Fireworks */}
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute animate-ping"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
            animationDelay: `${firework.id * 0.1}s`,
          }}
        >
          <Sparkles 
            className="w-8 h-8" 
            style={{ color: firework.color }}
          />
        </div>
      ))}
      
      {/* Main Animation */}
      <div className="relative z-10 animate-bounce">
        <Card className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-2xl transform scale-110">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Trophy className="w-16 h-16 mx-auto text-yellow-300 animate-pulse" />
            </div>
            
            <h1 className="text-4xl font-bold mb-2 animate-pulse">
              LEVEL UP! 🎉
            </h1>
            
            <div className="text-2xl mb-4">
              Level {level}
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-300" />
              <span className="text-xl font-semibold">
                +{pointsEarned} Points
              </span>
              <Star className="w-6 h-6 text-yellow-300" />
            </div>
            
            <div className="text-lg opacity-90">
              Great job! Keep going! 🌟
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}