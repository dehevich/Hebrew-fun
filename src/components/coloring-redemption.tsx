import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HapticButton } from '@/components/ui/haptic-button';
import { Star, Download, Lock, CheckCircle, Palette, Play } from 'lucide-react';
import ColoringGame from './coloring-game';

interface ColoringSheet {
  id: string;
  title: string;
  category: 'cars' | 'animals' | 'flowers' | 'space' | 'airplanes';
  cost: number;
  image: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  unlocked: boolean;
  downloaded: boolean;
}

interface ColoringRedemptionProps {
  points: number;
  onRedeem: (sheetId: string, cost: number) => void;
  onDownload: (sheetId: string) => void;
  redeemedSheets: string[];
  onBack?: () => void;
}

const coloringSheets: ColoringSheet[] = [
  // Cars
  {
    id: 'car-1',
    title: 'Racing Car',
    category: 'cars',
    cost: 50,
    image: '🏎️',
    description: 'Fast and furious racing car',
    difficulty: 'easy',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'car-2',
    title: 'Monster Truck',
    category: 'cars',
    cost: 75,
    image: '🚛',
    description: 'Big and powerful monster truck',
    difficulty: 'medium',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'car-3',
    title: 'Sports Car',
    category: 'cars',
    cost: 100,
    image: '🚗',
    description: 'Sleek and shiny sports car',
    difficulty: 'hard',
    unlocked: false,
    downloaded: false
  },
  
  // Animals
  {
    id: 'animal-1',
    title: 'Cute Lion',
    category: 'animals',
    cost: 50,
    image: '🦁',
    description: 'Friendly lion with a big mane',
    difficulty: 'easy',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'animal-2',
    title: 'Happy Elephant',
    category: 'animals',
    cost: 75,
    image: '🐘',
    description: 'Gentle giant with big ears',
    difficulty: 'medium',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'animal-3',
    title: 'Playful Monkey',
    category: 'animals',
    cost: 100,
    image: '🐵',
    description: 'Swinging from tree to tree',
    difficulty: 'hard',
    unlocked: false,
    downloaded: false
  },
  
  // Flowers
  {
    id: 'flower-1',
    title: 'Sunflower',
    category: 'flowers',
    cost: 50,
    image: '🌻',
    description: 'Bright and cheerful sunflower',
    difficulty: 'easy',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'flower-2',
    title: 'Rose Garden',
    category: 'flowers',
    cost: 75,
    image: '🌹',
    description: 'Beautiful red roses',
    difficulty: 'medium',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'flower-3',
    title: 'Tulip Field',
    category: 'flowers',
    cost: 100,
    image: '🌷',
    description: 'Colorful tulip garden',
    difficulty: 'hard',
    unlocked: false,
    downloaded: false
  },
  
  // Space
  {
    id: 'space-1',
    title: 'Rocket Ship',
    category: 'space',
    cost: 75,
    image: '🚀',
    description: 'Blast off to the stars',
    difficulty: 'medium',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'space-2',
    title: 'Astronaut',
    category: 'space',
    cost: 100,
    image: '👨‍🚀',
    description: 'Floating in zero gravity',
    difficulty: 'hard',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'space-3',
    title: 'Planet Explorer',
    category: 'space',
    cost: 125,
    image: '🪐',
    description: 'Discover new worlds',
    difficulty: 'hard',
    unlocked: false,
    downloaded: false
  },
  
  // Airplanes
  {
    id: 'airplane-1',
    title: 'Propeller Plane',
    category: 'airplanes',
    cost: 75,
    image: '✈️',
    description: 'Classic propeller airplane',
    difficulty: 'medium',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'airplane-2',
    title: 'Jet Fighter',
    category: 'airplanes',
    cost: 100,
    image: '🛩️',
    description: 'Fast and agile jet',
    difficulty: 'hard',
    unlocked: false,
    downloaded: false
  },
  {
    id: 'airplane-3',
    title: 'Cargo Plane',
    category: 'airplanes',
    cost: 125,
    image: '🛩️',
    description: 'Heavy lift cargo plane',
    difficulty: 'hard',
    unlocked: false,
    downloaded: false
  }
];

const categoryIcons = {
  cars: '🚗',
  animals: '🐾',
  flowers: '🌸',
  space: '🌟',
  airplanes: '✈️'
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

export function ColoringRedemption({ points, onRedeem, onDownload, redeemedSheets, onBack }: ColoringRedemptionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [currentColoringSheet, setCurrentColoringSheet] = useState<string | null>(null);

  const filteredSheets = selectedCategory === 'all' 
    ? coloringSheets 
    : coloringSheets.filter(sheet => sheet.category === selectedCategory);

  const categories = ['all', 'cars', 'animals', 'flowers', 'space', 'airplanes'];

  const handleRedeem = (sheetId: string, cost: number) => {
    if (points >= cost) {
      onRedeem(sheetId, cost);
      setShowSuccess(sheetId);
      setTimeout(() => setShowSuccess(null), 2000);
    }
  };

  const handleDownload = (sheetId: string) => {
    onDownload(sheetId);
  };

  const handlePlayColoring = (sheetId: string) => {
    setCurrentColoringSheet(sheetId);
  };

  const handleSaveColoring = (imageData: string) => {
    // Save the colored image
    console.log('Saving colored image:', imageData);
    setCurrentColoringSheet(null);
  };

  // Show coloring game if a sheet is selected
  if (currentColoringSheet) {
    const sheet = coloringSheets.find(s => s.id === currentColoringSheet);
    return (
      <ColoringGame
        sheetId={currentColoringSheet}
        title={sheet?.title || 'Coloring Game'}
        onBack={() => setCurrentColoringSheet(null)}
        onSave={handleSaveColoring}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <HapticButton
              variant="outline"
              onClick={onBack}
              className="p-2"
              hapticType="light"
            >
              ← Back
            </HapticButton>
          )}
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Coloring Sheets Store 🎨</h1>
            <p className="text-gray-600">Use your points to unlock fun coloring pages!</p>
          </div>
          <div className="w-20" />
        </div>

        <div className="space-y-6">
          {/* Points Card */}
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                <Palette className="w-6 h-6" />
                Your Points
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-300" />
                <span className="text-3xl font-bold">{points}</span>
              </div>
              <Progress value={(points / 1000) * 100} className="h-3 bg-white/20" />
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <HapticButton
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center gap-2"
                    hapticType="light"
                  >
                    <span>{category === 'all' ? '🎨' : categoryIcons[category as keyof typeof categoryIcons]}</span>
                    <span className="capitalize">{category}</span>
                  </HapticButton>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coloring Sheets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSheets.map((sheet) => {
              const isRedeemed = redeemedSheets.includes(sheet.id);
              const canAfford = points >= sheet.cost;
              
              return (
                <Card key={sheet.id} className="transition-all duration-200 hover:shadow-lg">
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-2">{sheet.image}</div>
                    <CardTitle className="text-lg font-bold">{sheet.title}</CardTitle>
                    <p className="text-sm text-gray-600">{sheet.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge className={difficultyColors[sheet.difficulty]}>
                        {sheet.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold">{sheet.cost}</span>
                      </div>
                    </div>

                    {showSuccess === sheet.id && (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <p className="text-green-800 font-medium">Unlocked! 🎉</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {!isRedeemed ? (
                        <HapticButton
                          onClick={() => handleRedeem(sheet.id, sheet.cost)}
                          disabled={!canAfford}
                          className={`w-full ${canAfford 
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          hapticType={canAfford ? "success" : "error"}
                        >
                          {canAfford ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Unlock for {sheet.cost} points
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Need {sheet.cost - points} more points
                            </>
                          )}
                        </HapticButton>
                      ) : (
                        <div className="space-y-2">
                          <HapticButton
                            onClick={() => handlePlayColoring(sheet.id)}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            hapticType="medium"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play Coloring Game
                          </HapticButton>
                          <HapticButton
                            onClick={() => handleDownload(sheet.id)}
                            variant="outline"
                            className="w-full"
                            hapticType="light"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Sheet
                          </HapticButton>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredSheets.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-lg text-gray-600">No coloring sheets found in this category.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}