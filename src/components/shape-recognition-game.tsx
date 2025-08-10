"use client";

import { useState, useEffect } from 'react';
import { HapticButton } from '@/components/ui/haptic-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Volume2, CheckCircle, XCircle } from 'lucide-react';

interface ShapeRecognitionGameProps {
  level: number;
  question: number;
  onBack: () => void;
  onCorrect: () => void;
}

interface Shape {
  id: string;
  name: string;
  hebrew: string;
  english: string;
  pronunciation: string;
  emoji: string;
  description: string;
}

const shapes: Shape[] = [
  {
    id: 'circle',
    name: 'Circle',
    hebrew: 'עיגול',
    english: 'Circle',
    pronunciation: 'igul',
    emoji: '⭕',
    description: 'A round shape with no corners'
  },
  {
    id: 'square',
    name: 'Square',
    hebrew: 'ריבוע',
    english: 'Square',
    pronunciation: 'ribua',
    emoji: '⬜',
    description: 'Four equal sides and four right angles'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    hebrew: 'משולש',
    english: 'Triangle',
    pronunciation: 'meshulash',
    emoji: '🔺',
    description: 'Three sides and three angles'
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    hebrew: 'מלבן',
    english: 'Rectangle',
    pronunciation: 'malben',
    emoji: '▭',
    description: 'Four sides with opposite sides equal'
  },
  {
    id: 'star',
    name: 'Star',
    hebrew: 'כוכב',
    english: 'Star',
    pronunciation: 'kochav',
    emoji: '⭐',
    description: 'A shape with points pointing outward'
  },
  {
    id: 'heart',
    name: 'Heart',
    hebrew: 'לב',
    english: 'Heart',
    pronunciation: 'lev',
    emoji: '❤️',
    description: 'A symbol of love and affection'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    hebrew: 'יהלום',
    english: 'Diamond',
    pronunciation: 'yahalom',
    emoji: '💎',
    description: 'A precious stone shape with four sides'
  },
  {
    id: 'moon',
    name: 'Moon',
    hebrew: 'ירח',
    english: 'Moon',
    pronunciation: 'yareach',
    emoji: '🌙',
    description: 'The Earth\'s natural satellite'
  }
];

export default function ShapeRecognitionGame({ level, question, onBack, onCorrect }: ShapeRecognitionGameProps) {
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<{type: 'good' | 'bad', message: string} | null>(null);
  const [currentShapes, setCurrentShapes] = useState<Shape[]>([]);
  const [correctShape, setCorrectShape] = useState<Shape | null>(null);

  // Initialize shapes based on level
  useEffect(() => {
    const levelShapes = shapes.slice(0, Math.min(4 + Math.floor(level / 2), shapes.length));
    const shuffled = [...levelShapes].sort(() => Math.random() - 0.5);
    const correct = shuffled[0];
    const options = [correct, ...shuffled.slice(1, 4)].sort(() => Math.random() - 0.5);
    
    setCurrentShapes(options);
    setCorrectShape(correct);
    setSelectedShape(null);
    setShowFeedback(null);
  }, [question, level]);

  const playHebrewSound = (text: string) => {
    // Placeholder for Hebrew sound playback
    console.log(`Playing Hebrew sound for: ${text}`);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleShapeSelect = (shapeId: string) => {
    if (selectedShape || showFeedback) return;
    
    setSelectedShape(shapeId);
    
    if (shapeId === correctShape?.id) {
      setShowFeedback({ type: 'good', message: 'Correct! Well done!' });
      setTimeout(() => {
        onCorrect();
      }, 1500);
    } else {
      setShowFeedback({ type: 'bad', message: 'Try again!' });
      setTimeout(() => {
        setSelectedShape(null);
        setShowFeedback(null);
      }, 1500);
    }
  };

  if (!correctShape) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 safe-area-inset">
      <div className="max-w-4xl mx-auto safe-area-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 safe-area-top">
          <HapticButton
            variant="outline"
            onClick={onBack}
            className="p-3 touch-target"
            hapticType="light"
          >
            <ArrowLeft className="w-5 h-5" />
          </HapticButton>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Shape Recognition</h1>
            <p className="text-gray-600">Level {level} • Question {question + 1}/8</p>
          </div>
          <div className="w-12" />
        </div>

        {/* Question */}
        <Card className="mb-8 p-8 text-center">
          <div className="text-6xl mb-4">{correctShape.emoji}</div>
          <div className="text-2xl font-bold text-purple-600 mb-2">{correctShape.hebrew}</div>
          <div className="text-lg text-gray-600 mb-4">{correctShape.english}</div>
          <div className="text-sm text-gray-500 mb-6">{correctShape.description}</div>
          
          {/* Sound Button */}
          <HapticButton
            variant="outline"
            onClick={() => playHebrewSound(correctShape.hebrew)}
            className="w-20 h-20 rounded-full mx-auto touch-target"
            hapticType="light"
          >
            <Volume2 className="w-10 h-10" />
          </HapticButton>
        </Card>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mb-6 p-4 rounded-lg text-center text-white font-bold text-lg ${
            showFeedback.type === 'good' ? 'bg-green-500' : 'bg-red-500'
          } animate-pulse`}>
            <div className="text-2xl mb-2">
              {showFeedback.type === 'good' ? <CheckCircle className="w-8 h-8 mx-auto" /> : <XCircle className="w-8 h-8 mx-auto" />}
            </div>
            {showFeedback.message}
          </div>
        )}

        {/* Shape Options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {currentShapes.map((shape) => (
            <HapticButton
              key={shape.id}
              variant={selectedShape === shape.id ? "default" : "outline"}
              onClick={() => handleShapeSelect(shape.id)}
              className={`h-32 flex flex-col items-center justify-center touch-target transition-all duration-200 ${
                selectedShape === shape.id 
                  ? shape.id === correctShape.id 
                    ? 'bg-green-500 hover:bg-green-600 text-white border-green-600' 
                    : 'bg-red-500 hover:bg-red-600 text-white border-red-600'
                  : 'hover:shadow-lg hover:scale-105'
              }`}
              disabled={!!selectedShape}
              hapticType="light"
            >
              <div className="text-3xl mb-2">{shape.emoji}</div>
              <div className="text-sm font-semibold">{shape.hebrew}</div>
              <div className="text-xs text-gray-600">{shape.english}</div>
            </HapticButton>
          ))}
        </div>

        {/* Progress */}
        <div className="text-center safe-area-bottom">
          <div className="text-sm text-gray-600 mb-2">
            Progress: {question}/8 questions
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-purple-500 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${(question / 8) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}