"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { HapticButton } from '@/components/ui/haptic-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ColoringRedemption } from '@/components/coloring-redemption';
import { useMobileBackButton } from '@/hooks/use-mobile-back-button';
import { useTouchOptimization, preventBodyScroll } from '@/hooks/use-touch-optimization';
import { Star, Trophy, BookOpen, Home, User, Settings, ArrowLeft, RotateCcw, Plus, Edit, Palette, Volume2 } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  age: number;
  icon: string;
  points: number;
  level: number;
  streak: number;
  gameProgress: {
    letterMatch: number;
    wordBuilder: number;
    memoryGame: number;
    letterTracing: number;
    newGame1: number; // Replacing bubble pop
    newGame2: number; // Replacing story time
    numbersGame: number;
  };
  achievements: string[];
  redeemedSheets: string[];
  createdAt: string;
}

const animalIcons = [
  '🦁', '🐘', '🦒', '🐼', '🦊', '🐨', '🐯', '🐮', 
  '🐸', '🐰', '🦄', '🐷', '🐶', '🐱', '🐭', '🦔'
];

// Hebrew alphabet with proper pronunciation
const hebrewAlphabet = [
  { letter: 'א', name: 'Aleph', sound: 'א', pronunciation: 'ah' },
  { letter: 'ב', name: 'Bet', sound: 'ב', pronunciation: 'b' },
  { letter: 'ג', name: 'Gimel', sound: 'ג', pronunciation: 'g' },
  { letter: 'ד', name: 'Dalet', sound: 'ד', pronunciation: 'd' },
  { letter: 'ה', name: 'He', sound: 'ה', pronunciation: 'h' },
  { letter: 'ו', name: 'Vav', sound: 'ו', pronunciation: 'v' },
  { letter: 'ז', name: 'Zayin', sound: 'ז', pronunciation: 'z' },
  { letter: 'ח', name: 'Chet', sound: 'ח', pronunciation: 'ch' },
  { letter: 'ט', name: 'Tet', sound: 'ט', pronunciation: 't' },
  { letter: 'י', name: 'Yod', sound: 'י', pronunciation: 'y' },
  { letter: 'כ', name: 'Kaf', sound: 'כ', pronunciation: 'k' },
  { letter: 'ל', name: 'Lamed', sound: 'ל', pronunciation: 'l' },
  { letter: 'מ', name: 'Mem', sound: 'מ', pronunciation: 'm' },
  { letter: 'נ', name: 'Nun', sound: 'נ', pronunciation: 'n' },
  { letter: 'ס', name: 'Samekh', sound: 'ס', pronunciation: 's' },
  { letter: 'ע', name: 'Ayin', sound: 'ע', pronunciation: 'ah' },
  { letter: 'פ', name: 'Pe', sound: 'פ', pronunciation: 'p' },
  { letter: 'צ', name: 'Tsadi', sound: 'צ', pronunciation: 'ts' },
  { letter: 'ק', name: 'Qof', sound: 'ק', pronunciation: 'q' },
  { letter: 'ר', name: 'Resh', sound: 'ר', pronunciation: 'r' },
  { letter: 'ש', name: 'Shin', sound: 'ש', pronunciation: 'sh' },
  { letter: 'ת', name: 'Tav', sound: 'ת', pronunciation: 't' },
];

// Hebrew numbers 1-100
const hebrewNumbers = Array.from({ length: 100 }, (_, i) => ({
  number: i + 1,
  hebrew: ['', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר'][i + 1] || `${i + 1}`,
  pronunciation: ['', 'achat', 'shtayim', 'shalosh', 'arba', 'chamesh', 'shesh', 'sheva', 'shmona', 'tesha', 'eser'][i + 1] || `${i + 1}`
}));

// Hebrew words for word builder
const hebrewWords = [
  { hebrew: 'שלום', english: 'Peace', letters: ['ש', 'ל', 'ו', 'ם'] },
  { hebrew: 'אבא', english: 'Father', letters: ['א', 'ב', 'א'] },
  { hebrew: 'אמא', english: 'Mother', letters: ['א', 'מ', 'א'] },
  { hebrew: 'תודה', english: 'Thank you', letters: ['ת', 'ו', 'ד', 'ה'] },
  { hebrew: 'חבר', english: 'Friend', letters: ['ח', 'ב', 'ר'] },
  { hebrew: 'בית', english: 'House', letters: ['ב', 'י', 'ת'] },
  { hebrew: 'מים', english: 'Water', letters: ['מ', 'י', 'ם'] },
  { hebrew: 'לחם', english: 'Bread', letters: ['ל', 'ח', 'ם'] },
];

// Memory game cards
const memoryCards = [
  { id: 1, hebrew: 'שלום', english: 'Peace', emoji: '🕊️' },
  { id: 2, hebrew: 'תודה', english: 'Thank you', emoji: '🙏' },
  { id: 3, hebrew: 'אהבה', english: 'Love', emoji: '❤️' },
  { id: 4, hebrew: 'חבר', english: 'Friend', emoji: '🤝' },
  { id: 5, hebrew: 'בית', english: 'House', emoji: '🏠' },
  { id: 6, hebrew: 'מים', english: 'Water', emoji: '💧' },
  { id: 7, hebrew: 'לחם', english: 'Bread', emoji: '🍞' },
  { id: 8, hebrew: 'שמש', english: 'Sun', emoji: '☀️' },
];

export default function HebrewLearningApp() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showProfileSelection, setShowProfileSelection] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState(5);
  const [selectedIcon, setSelectedIcon] = useState('🦁');
  const [activeTab, setActiveTab] = useState('home');
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  // Refs for touch optimization
  const appRef = useRef<HTMLDivElement>(null);

  // Game states
  const [gameLevel, setGameLevel] = useState(1);
  const [gameProgress, setGameProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Letter Tracing game states
  const tracingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tracingComplete, setTracingComplete] = useState(false);

  // Letter Catch game states
  const [fallingLetters, setFallingLetters] = useState<Array<{letter: string, id: number, x: number, y: number, isCaught?: boolean, isWrong?: boolean}>>([]);
  const [catchScore, setCatchScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [feedbackAnimation, setFeedbackAnimation] = useState<{type: 'good' | 'bad', letter: string, id: number} | null>(null);

  // Numbers game states
  const [numbersOptions, setNumbersOptions] = useState<number[]>([]);

  // Word puzzle game states
  const [puzzlePieces, setPuzzlePieces] = useState<Array<{letter: string, id: number, position: string}>>([]);
  const [builtWord, setBuiltWord] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  // Prevent body scroll when game is active
  useEffect(() => {
    preventBodyScroll(!!currentGame);
    return () => preventBodyScroll(false);
  }, [currentGame]);

  // Hardware back button support
  useMobileBackButton(() => {
    if (currentGame) {
      setCurrentGame(null);
    } else if (showProfileSelection) {
      setShowProfileSelection(false);
    } else if (showProfileCreation && profiles.length > 0) {
      setShowProfileCreation(false);
    }
  }, !!currentGame || showProfileSelection || showProfileCreation);

  // Touch optimization for swipe gestures
  useTouchOptimization(appRef, {
    onSwipeRight: () => {
      if (currentGame) {
        setCurrentGame(null);
      }
    },
    onSwipeLeft: () => {
      // Could be used for next question or other navigation
    }
  }, !!currentGame);

  // Initialize profiles from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem('hebrewLearningProfiles');
    const savedCurrentProfile = localStorage.getItem('hebrewLearningCurrentProfile');
    
    if (savedProfiles) {
      const parsedProfiles = JSON.parse(savedProfiles);
      setProfiles(parsedProfiles);
    }
    
    if (savedCurrentProfile) {
      setCurrentProfile(JSON.parse(savedCurrentProfile));
    } else {
      // Always show profile creation if no current profile
      setShowProfileCreation(true);
    }
  }, []);

  // Letter Catch game effects
  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        const newLetter = {
          letter: hebrewAlphabet[Math.floor(Math.random() * hebrewAlphabet.length)].letter,
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: 0
        };
        setFallingLetters(prev => [...prev, newLetter]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [gameActive]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setFallingLetters(prev => 
        prev.map(letter => ({ ...letter, y: letter.y + 5 }))
          .filter(letter => letter.y < 80)
      );
    }, 200);

    return () => clearInterval(moveInterval);
  }, []);

  // Feedback animation effect
  useEffect(() => {
    if (feedbackAnimation) {
      const timer = setTimeout(() => {
        setFeedbackAnimation(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [feedbackAnimation]);

  // Initialize numbers options when question changes
  useEffect(() => {
    if (currentGame === 'numbers-game') {
      const currentNumber = hebrewNumbers[currentQuestion % hebrewNumbers.length];
      const options = [currentNumber.number];
      
      // Add 3 random wrong options
      while (options.length < 4) {
        const randomNum = Math.floor(Math.random() * 100) + 1;
        if (!options.includes(randomNum)) {
          options.push(randomNum);
        }
      }
      
      // Shuffle options once and store
      setNumbersOptions([...options].sort(() => Math.random() - 0.5));
    }
  }, [currentQuestion, currentGame]);

  // Initialize word puzzle pieces when question changes
  useEffect(() => {
    if (currentGame === 'word-puzzle') {
      const currentWord = hebrewWords[currentQuestion % hebrewWords.length];
      setPuzzlePieces(currentWord.letters.map((letter, index) => ({
        letter,
        id: index,
        position: Math.random() > 0.5 ? 'top' : 'bottom'
      })));
      setBuiltWord([]);
      setSelectedPiece(null);
    }
  }, [currentQuestion, currentGame]);

  // Save profiles to localStorage when they change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('hebrewLearningProfiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  // Save current profile to localStorage when it changes
  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem('hebrewLearningCurrentProfile', JSON.stringify(currentProfile));
    }
  }, [currentProfile]);

  const createProfile = () => {
    if (!newProfileName.trim()) return;
    
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      age: newProfileAge,
      icon: selectedIcon,
      points: 0,
      level: 1,
      streak: 0,
      gameProgress: {
        letterMatch: 0,
        wordBuilder: 0,
        memoryGame: 0,
        letterTracing: 0,
        newGame1: 0,
        newGame2: 0,
        numbersGame: 0,
      },
      achievements: [],
      redeemedSheets: [],
      createdAt: new Date().toISOString(),
    };
    
    setProfiles(prev => [...prev, newProfile]);
    setCurrentProfile(newProfile);
    setShowProfileCreation(false);
    setNewProfileName('');
    setNewProfileAge(5);
    setSelectedIcon('🦁');
  };

  const selectProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    setShowProfileSelection(false);
  };

  const deleteProfile = (profileId: string) => {
    if (profiles.length <= 1) return;
    
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    
    if (currentProfile?.id === profileId) {
      setCurrentProfile(updatedProfiles[0]);
    }
  };

  const updateProfileProgress = (gameType: keyof Profile['gameProgress'], increment: number) => {
    if (!currentProfile) return;
    
    const updatedProfile = {
      ...currentProfile,
      gameProgress: {
        ...currentProfile.gameProgress,
        [gameType]: Math.min(currentProfile.gameProgress[gameType] + increment, 240) // 30 levels * 8 questions
      },
      points: currentProfile.points + increment
    };
    
    setCurrentProfile(updatedProfile);
    setProfiles(prev => prev.map(p => p.id === currentProfile.id ? updatedProfile : p));
  };

  const redeemColoringSheet = (sheetId: string, cost: number) => {
    if (!currentProfile) return;
    
    if (currentProfile.points >= cost) {
      const updatedProfile = {
        ...currentProfile,
        points: currentProfile.points - cost,
        redeemedSheets: [...currentProfile.redeemedSheets, sheetId]
      };
      
      setCurrentProfile(updatedProfile);
      setProfiles(prev => prev.map(p => p.id === currentProfile.id ? updatedProfile : p));
    }
  };

  const playHebrewSound = (text: string) => {
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Use Web Speech API for Hebrew pronunciation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to find a Hebrew voice
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(voice => voice.lang.startsWith('he'));
      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: just log to console
      console.log(`Playing Hebrew sound for: ${text}`);
    }
  };

  const startGame = (gameKey: string) => {
    setCurrentGame(gameKey);
    setGameLevel(1);
    setGameProgress(0);
    setCurrentQuestion(0);
  };

  const handleCorrectAnswer = () => {
    if (!currentProfile) return;
    
    setGameProgress(prev => prev + 1);
    setCurrentQuestion(prev => prev + 1);
    
    if (currentQuestion >= 7) { // 8 questions per level
      if (gameLevel < 30) {
        setGameLevel(prev => prev + 1);
        setCurrentQuestion(0);
      } else {
        // Game completed
        setCurrentGame(null);
      }
    }
    
    updateProfileProgress(currentGame as keyof Profile['gameProgress'], 1);
  };

  const handleWrongAnswer = () => {
    // Don't progress on wrong answer, just show feedback
    console.log('Wrong answer - try again!');
  };

  const renderProfileCreation = () => {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 safe-area-inset flex items-center justify-center">
        <Card className="w-full max-w-md mobile-spacious">
          <CardHeader className="text-center safe-area-top">
            <CardTitle className="text-2xl font-bold text-purple-600">Create New Profile 👶</CardTitle>
            <p className="text-gray-600">Let's set up your learning adventure!</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your name?
              </label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-target"
                maxLength={20}
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Age Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How old are you?
              </label>
              <div className="flex items-center justify-center gap-4">
                <HapticButton
                  variant="outline"
                  onClick={() => setNewProfileAge(Math.max(4, newProfileAge - 1))}
                  disabled={newProfileAge <= 4}
                  className="w-14 h-14 rounded-full touch-target"
                  hapticType="light"
                >
                  <span className="text-xl">-</span>
                </HapticButton>
                <span className="text-3xl font-bold text-purple-600 min-w-[70px] text-center">
                  {newProfileAge}
                </span>
                <HapticButton
                  variant="outline"
                  onClick={() => setNewProfileAge(Math.min(10, newProfileAge + 1))}
                  disabled={newProfileAge >= 10}
                  className="w-14 h-14 rounded-full touch-target"
                  hapticType="light"
                >
                  <span className="text-xl">+</span>
                </HapticButton>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                {newProfileAge <= 6 ? "Perfect for young learners! 🎨" : 
                 newProfileAge <= 8 ? "Great for growing minds! 🧠" : 
                 "Ready for challenges! 🚀"}
              </p>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose your favorite animal:
              </label>
              <div className="grid grid-cols-4 gap-3">
                {animalIcons.map((icon, index) => (
                  <HapticButton
                    key={index}
                    variant={selectedIcon === icon ? "default" : "outline"}
                    className="w-16 h-16 text-2xl rounded-lg touch-target"
                    onClick={() => setSelectedIcon(icon)}
                    hapticType="light"
                  >
                    {icon}
                  </HapticButton>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 safe-area-bottom">
              <HapticButton
                onClick={createProfile}
                disabled={!newProfileName.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 touch-target"
                hapticType="success"
              >
                Let's Start Learning! 🚀
              </HapticButton>
              {profiles.length > 0 && (
                <HapticButton
                  variant="outline"
                  onClick={() => {
                    setShowProfileCreation(false);
                    setShowProfileSelection(true);
                  }}
                  className="w-full py-3 touch-target"
                  hapticType="light"
                >
                  Choose Existing Profile
                </HapticButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProfileSelection = () => {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 safe-area-inset flex items-center justify-center">
        <Card className="w-full max-w-md mobile-spacious">
          <CardHeader className="text-center safe-area-top">
            <CardTitle className="text-2xl font-bold text-purple-600">Who's Learning Today? 👋</CardTitle>
            <p className="text-gray-600">Choose your profile to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile List */}
            <div className="space-y-3 max-h-96 overflow-y-auto smooth-scroll hide-scrollbar">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg touch-target ${
                    currentProfile?.id === profile.id 
                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectProfile(profile)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{profile.icon}</div>
                      <div>
                        <h3 className="font-bold text-gray-800">{profile.name}</h3>
                        <p className="text-sm text-gray-600">Age {profile.age} • Level {profile.level}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{profile.points} points</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Level {profile.level}</div>
                      <div className="text-xs text-gray-400">{profile.streak} day streak</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 safe-area-bottom">
              <HapticButton
                onClick={() => {
                  setShowProfileSelection(false);
                  setShowProfileCreation(true);
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 touch-target"
                hapticType="success"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Profile
              </HapticButton>
              <HapticButton
                variant="outline"
                onClick={() => setShowProfileSelection(false)}
                className="w-full py-3 touch-target"
                hapticType="light"
              >
                Cancel
              </HapticButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderHomeScreen = () => {
    if (!currentProfile) return null;

    const games = [
      { 
        title: 'Letter Match', 
        icon: '🎯', 
        description: 'Match Hebrew letters with sounds', 
        progress: currentProfile.gameProgress.letterMatch,
        key: 'letter-match'
      },
      { 
        title: 'Word Builder', 
        icon: '🧩', 
        description: 'Build words with Hebrew letters', 
        progress: currentProfile.gameProgress.wordBuilder,
        key: 'word-builder'
      },
      { 
        title: 'Memory Game', 
        icon: '🧠', 
        description: 'Remember Hebrew vocabulary', 
        progress: currentProfile.gameProgress.memoryGame,
        key: 'memory-game'
      },
      { 
        title: 'Letter Tracing', 
        icon: '✏️', 
        description: 'Trace Hebrew letters with your finger', 
        progress: currentProfile.gameProgress.letterTracing,
        key: 'letter-tracing'
      },
      { 
        title: 'Letter Catch', 
        icon: '🎮', 
        description: 'Catch falling Hebrew letters', 
        progress: currentProfile.gameProgress.newGame1,
        key: 'letter-catch'
      },
      { 
        title: 'Word Puzzle', 
        icon: '🧩', 
        description: 'Solve Hebrew word puzzles', 
        progress: currentProfile.gameProgress.newGame2,
        key: 'word-puzzle'
      },
      { 
        title: 'Numbers Game', 
        icon: '🔢', 
        description: 'Learn to count in Hebrew', 
        progress: currentProfile.gameProgress.numbersGame,
        key: 'numbers-game'
      },
      { 
        title: 'Coloring Store', 
        icon: '🎨', 
        description: 'Redeem points for coloring sheets', 
        progress: Math.min((currentProfile.redeemedSheets.length / 15) * 100, 100),
        key: 'coloring-store'
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 safe-area-inset">
        {/* Header */}
        <div className="safe-area-top p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{currentProfile.icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {currentProfile.name}!</h1>
                <p className="text-gray-600">Level {currentProfile.level} • {currentProfile.points} points</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HapticButton
                variant="outline"
                onClick={() => setShowProfileSelection(true)}
                className="p-3 touch-target"
                hapticType="light"
              >
                <User className="w-5 h-5" />
              </HapticButton>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center touch-target">
              <div className="text-2xl font-bold text-purple-600">{currentProfile.points}</div>
              <div className="text-sm text-gray-600">Points</div>
            </Card>
            <Card className="p-4 text-center touch-target">
              <div className="text-2xl font-bold text-blue-600">{currentProfile.level}</div>
              <div className="text-sm text-gray-600">Level</div>
            </Card>
            <Card className="p-4 text-center touch-target">
              <div className="text-2xl font-bold text-green-600">{currentProfile.streak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </Card>
            <Card className="p-4 text-center touch-target">
              <div className="text-2xl font-bold text-orange-600">{currentProfile.redeemedSheets.length}</div>
              <div className="text-sm text-gray-600">Coloring Sheets</div>
            </Card>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {games.map((game) => (
              <Card 
                key={game.key} 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 touch-target"
                onClick={() => startGame(game.key)}
              >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{game.icon}</div>
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <p className="text-sm text-gray-600">{game.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.floor(game.progress / 2.4)}%</span>
                    </div>
                    <Progress value={game.progress / 2.4} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Level {Math.floor(game.progress / 8) + 1} of 30
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLetterMatchGame = () => {
    const currentLetter = hebrewAlphabet[currentQuestion % hebrewAlphabet.length];
    const options = [currentLetter.pronunciation];
    
    // Add 3 random wrong options
    while (options.length < 4) {
      const randomLetter = hebrewAlphabet[Math.floor(Math.random() * hebrewAlphabet.length)];
      if (!options.includes(randomLetter.pronunciation)) {
        options.push(randomLetter.pronunciation);
      }
    }
    
    // Shuffle options
    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 safe-area-inset">
        <div className="max-w-2xl mx-auto safe-area-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 safe-area-top">
            <HapticButton
              variant="outline"
              onClick={() => setCurrentGame(null)}
              className="p-3 touch-target"
              hapticType="light"
            >
              <ArrowLeft className="w-5 h-5" />
            </HapticButton>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Letter Match</h1>
              <p className="text-gray-600">Level {gameLevel} • Question {currentQuestion + 1}/8</p>
            </div>
            <div className="w-12" />
          </div>

          {/* Letter Display */}
          <Card className="mb-8 p-8 text-center">
            <div className="text-8xl font-bold text-blue-600 mb-4">{currentLetter.letter}</div>
            <div className="text-lg text-gray-600">What sound does this letter make?</div>
            
            {/* Big Sound Button */}
            <HapticButton
              variant="outline"
              onClick={() => playHebrewSound(currentLetter.sound)}
              className="mt-4 w-20 h-20 rounded-full mx-auto touch-target"
              hapticType="light"
            >
              <Volume2 className="w-10 h-10" />
            </HapticButton>
          </Card>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {shuffledOptions.map((option, index) => (
              <HapticButton
                key={index}
                variant="outline"
                onClick={() => {
                  if (option === currentLetter.pronunciation) {
                    handleCorrectAnswer();
                  } else {
                    handleWrongAnswer();
                  }
                }}
                className="h-16 text-lg font-semibold touch-target"
                hapticType="light"
              >
                {option}
              </HapticButton>
            ))}
          </div>

          {/* Progress */}
          <div className="text-center safe-area-bottom">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {gameProgress}/8 questions
            </div>
            <Progress value={(gameProgress / 8) * 100} className="h-3" />
          </div>
        </div>
      </div>
    );
  };

  const renderWordBuilderGame = () => {
    const currentWord = hebrewWords[currentQuestion % hebrewWords.length];
    const scrambledLetters = [...currentWord.letters].sort(() => Math.random() - 0.5);

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 safe-area-inset">
        <div className="max-w-2xl mx-auto safe-area-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 safe-area-top">
            <HapticButton
              variant="outline"
              onClick={() => setCurrentGame(null)}
              className="p-3 touch-target"
              hapticType="light"
            >
              <ArrowLeft className="w-5 h-5" />
            </HapticButton>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Word Builder</h1>
              <p className="text-gray-600">Level {gameLevel} • Question {currentQuestion + 1}/8</p>
            </div>
            <div className="w-12" />
          </div>

          {/* Word Display */}
          <Card className="mb-8 p-8 text-center">
            <div className="text-3xl font-bold text-green-600 mb-4">{currentWord.hebrew}</div>
            <div className="text-lg text-gray-600 mb-4">{currentWord.english}</div>
            
            {/* Big Sound Button */}
            <HapticButton
              variant="outline"
              onClick={() => playHebrewSound(currentWord.hebrew)}
              className="w-20 h-20 rounded-full mx-auto mb-6 touch-target"
              hapticType="light"
            >
              <Volume2 className="w-10 h-10" />
            </HapticButton>

            {/* Letter Slots */}
            <div className="flex justify-center gap-2 mb-6">
              {currentWord.letters.map((_, index) => (
                <div key={index} className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  {/* Built letters will appear here */}
                </div>
              ))}
            </div>
          </Card>

          {/* Letter Options */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {scrambledLetters.map((letter, index) => (
              <HapticButton
                key={index}
                variant="outline"
                className="h-16 text-2xl font-bold touch-target"
                hapticType="light"
              >
                {letter}
              </HapticButton>
            ))}
          </div>

          {/* Big Check Button */}
          <div className="text-center">
            <HapticButton
              className="w-full h-16 text-lg font-bold bg-green-500 hover:bg-green-600 touch-target"
              hapticType="success"
            >
              Check Word ✓
            </HapticButton>
          </div>

          {/* Progress */}
          <div className="text-center mt-6 safe-area-bottom">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {gameProgress}/8 questions
            </div>
            <Progress value={(gameProgress / 8) * 100} className="h-3" />
          </div>
        </div>
      </div>
    );
  };

  const renderMemoryGame = () => {
    const gameCards = [...memoryCards, ...memoryCards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, id: index + 1 }));

    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 safe-area-inset">
        <div className="max-w-4xl mx-auto safe-area-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 safe-area-top">
            <HapticButton
              variant="outline"
              onClick={() => setCurrentGame(null)}
              className="p-3 touch-target"
              hapticType="light"
            >
              <ArrowLeft className="w-5 h-5" />
            </HapticButton>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Memory Game</h1>
              <p className="text-gray-600">Level {gameLevel} • Question {currentQuestion + 1}/8</p>
            </div>
            <div className="w-12" />
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {gameCards.map((card) => (
              <Card 
                key={card.id} 
                className="h-32 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 touch-target"
              >
                <CardContent className="p-4 h-full flex flex-col items-center justify-center">
                  <div className="text-4xl mb-2">{card.emoji}</div>
                  <div className="text-lg font-bold text-center">{card.hebrew}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {gameProgress}/8 questions
            </div>
            <Progress value={(gameProgress / 8) * 100} className="h-3" />
          </div>
        </div>
      </div>
    );
  };

  const renderNumbersGame = () => {
    const currentNumber = hebrewNumbers[currentQuestion % hebrewNumbers.length];

    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <HapticButton
              variant="outline"
              onClick={() => setCurrentGame(null)}
              className="p-2"
              hapticType="light"
            >
              <ArrowLeft className="w-5 h-5" />
            </HapticButton>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Numbers Game</h1>
              <p className="text-gray-600">Level {gameLevel} • Question {currentQuestion + 1}/8</p>
            </div>
            <div className="w-10" />
          </div>

          {/* Number Display */}
          <Card className="mb-8 p-8 text-center">
            <div className="text-6xl font-bold text-red-600 mb-4">{currentNumber.hebrew}</div>
            <div className="text-lg text-gray-600">What number is this?</div>
            
            {/* Big Sound Button */}
            <HapticButton
              variant="outline"
              onClick={() => playHebrewSound(currentNumber.hebrew)}
              className="mt-4 w-20 h-20 rounded-full mx-auto"
              hapticType="light"
            >
              <Volume2 className="w-10 h-10" />
            </HapticButton>
          </Card>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {numbersOptions.map((option, index) => (
              <HapticButton
                key={index}
                variant="outline"
                onClick={() => {
                  if (option === currentNumber.number) {
                    handleCorrectAnswer();
                  } else {
                    handleWrongAnswer();
                  }
                }}
                className="h-16 text-lg font-semibold"
                hapticType="light"
              >
                {option}
              </HapticButton>
            ))}
          </div>

          {/* Progress */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {gameProgress}/8 questions
            </div>
            <Progress value={(gameProgress / 8) * 100} className="h-3" />
          </div>
        </div>
      </div>
    );
  };

  const renderLetterTracingGame = () => {
    const currentLetter = hebrewAlphabet[currentQuestion % hebrewAlphabet.length];

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const canvas = tracingCanvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#4f46e5';
        setIsDrawing(true);
      }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      e.preventDefault();
      e.stopPropagation();
      
      const canvas = tracingCanvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsDrawing(false);
      setTracingComplete(true);
    };

    const clearCanvas = () => {
      const canvas = tracingCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTracingComplete(false);
      }
    };

    const checkTracing = () => {
      if (tracingComplete) {
        handleCorrectAnswer();
        clearCanvas();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <HapticButton
              variant="outline"
              onClick={() => setCurrentGame(null)}
              className="p-2"
              hapticType="light"
            >
              <ArrowLeft className="w-5 h-5" />
            </HapticButton>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Letter Tracing</h1>
              <p className="text-gray-600">Level {gameLevel} • Question {currentQuestion + 1}/8</p>
            </div>
            <div className="w-10" />
          </div>

          {/* Letter Display */}
          <Card className="mb-6 p-6 text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-4">{currentLetter.letter}</div>
            <div className="text-lg text-gray-600">Trace the letter above</div>
            
            {/* Big Sound Button */}
            <HapticButton
              variant="outline"
              onClick={() => playHebrewSound(currentLetter.sound)}
              className="mt-4 w-20 h-20 rounded-full mx-auto"
              hapticType="light"
            >
              <Volume2 className="w-10 h-10" />
            </HapticButton>
          </Card>

          {/* Tracing Canvas */}
          <Card className="mb-6 p-4">
            <canvas
              ref={tracingCanvasRef}
              width={400}
              height={200}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                tracingCanvasRef.current?.dispatchEvent(mouseEvent);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                tracingCanvasRef.current?.dispatchEvent(mouseEvent);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const mouseEvent = new MouseEvent('mouseup', {});
                tracingCanvasRef.current?.dispatchEvent(mouseEvent);
              }}
            />
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <HapticButton
              variant="outline"
              onClick={clearCanvas}
              className="w-full h-12"
              hapticType="light"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Clear & Try Again
            </HapticButton>
            
            <HapticButton
              onClick={checkTracing}
              disabled={!tracingComplete}
              className="w-full h-16 text-lg font-bold bg-green-500 hover:bg-green-600"
              hapticType="success"
            >
              Check My Tracing ✓
            </HapticButton>
          </div>

          {/* Progress */}
          <div className="text-center mt-6">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {gameProgress}/8 questions
            </div>
            <Progress value={(gameProgress / 8) * 100} className="h-3" />
          </div>
        </div>
      </div>
    );
  };

  const renderLetterCatchGame = () => {
    const currentLetter = hebrewAlphabet[currentQuestion % hebrewAlphabet.length];

    const catchLetter = (letter: string) => {
      if (letter === currentLetter.letter) {
        setCatchScore(prev => prev + 1);
        setFallingLetters(prev => prev.filter(l => l.letter !== letter));
        setFeedbackAnimation({ type: 'good', letter, id: Date.now() });
        
        if (catchScore >= 4) { // Changed from 5 to 4 since we increment after
          setTimeout(() => {
            handleCorrectAnswer();
            setCatchScore(0);
            setFallingLetters([]);
            setGameActive(false);
          }, 1000);
        }
      } else {
        setFeedbackAnimation({ type: 'bad', letter, id: Date.now() });
      }
    };

    const startGame = () => {
      setGameActive(true);
      setCatchScore(0);
      setFallingLetters([]);
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <HapticButton
              variant="outline"
              onClick={() => setCurrentGame(null)}
              className="p-2"
              hapticType="light"
            >
              <ArrowLeft className="w-5 h-5" />
            </HapticButton>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Letter Catch</h1>
              <p className="text-gray-600">Level {gameLevel} • Question {currentQuestion + 1}/8</p>
            </div>
            <div className="w-10" />
          </div>

          {/* Target Letter */}
          <Card className="mb-6 p-6 text-center">
            <div className="text-6xl font-bold text-cyan-600 mb-4">{currentLetter.letter}</div>
            <div className="text-lg text-gray-600 mb-4">Catch this letter!</div>
            <div className="text-sm text-gray-500">Score: {catchScore}/5</div>
            
            {/* Big Sound Button */}
            <HapticButton
              variant="outline"
              onClick={() => playHebrewSound(currentLetter.sound)}
              className="mt-4 w-20 h-20 rounded-full mx-auto"
              hapticType="light"
            >
              <Volume2 className="w-10 h-10" />
            </HapticButton>
          </Card>

          {/* Feedback Animation */}
          {feedbackAnimation && (
            <div className={`fixed inset-0 flex items-center justify-center pointer-events-none z-50 ${
              feedbackAnimation.type === 'good' ? 'text-green-500' : 'text-red-500'
            }`}>
              <div className="text-8xl font-bold animate-bounce">
                {feedbackAnimation.type === 'good' ? '✓' : '✗'}
              </div>
            </div>
          )}

          {/* Game Area */}
          <Card className="mb-6 p-4 h-64 relative overflow-hidden bg-blue-100">
            {fallingLetters.map((letter) => (
              <HapticButton
                key={letter.id}
                variant="outline"
                onClick={() => catchLetter(letter.letter)}
                className="absolute text-2xl font-bold w-12 h-12 rounded-full transition-all duration-200 hover:scale-110"
                style={{ left: `${letter.x}%`, top: `${letter.y}%` }}
                hapticType="light"
              >
                {letter.letter}
              </HapticButton>
            ))}
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            {!gameActive ? (
              <HapticButton
                onClick={startGame}
                className="w-full h-16 text-lg font-bold bg-cyan-500 hover:bg-cyan-600"
                hapticType="success"
              >
                {catchScore >= 5 ? "Great Job! Next Question →" : "Start Catching! 🎮"}
              </HapticButton>
            ) : (
              <div className="text-center text-lg font-semibold text-gray-600">
                Catch the letter: {currentLetter.letter}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="text-center mt-6">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {gameProgress}/8 questions
            </div>
            <Progress value={(gameProgress / 8) * 100} className="h-3" />
          </div>
        </div>
      </div>
    );
  };

  const renderWordPuzzleGame = () => {
    const currentWord = hebrewWords[currentQuestion % hebrewWords.length];

    const handlePieceClick = (pieceId: number) => {
      const piece = puzzlePieces.find(p => p.id === pieceId);
      if (!piece) return;

      if (selectedPiece === null) {
        // Select piece
        setSelectedPiece(pieceId);
      } else if (selectedPiece === pieceId) {
        // Deselect piece
        setSelectedPiece(null);
      } else {
        // Swap pieces
        const newPieces = [...puzzlePieces];
        const selectedIndex = newPieces.findIndex(p => p.id === selectedPiece);
        const clickedIndex = newPieces.findIndex(p => p.id === pieceId);
        
        [newPieces[selectedIndex], newPieces[clickedIndex]] = 
        [newPieces[clickedIndex], newPieces[selectedIndex]];
        
        setPuzzlePieces(newPieces);
        setSelectedPiece(null);
      }
    };

    const checkWord = () => {
      const constructedWord = puzzlePieces.map(p => p.letter).join('');
      if (constructedWord === currentWord.hebrew) {
        handleCorrectAnswer();
        setBuiltWord([]);
      } else {
        // Wrong answer - shake animation
        const wordBuilder = document.querySelector('.word-builder');
        if (wordBuilder) {
          wordBuilder.classList.add('animate-pulse');
          setTimeout(() => {
            wordBuilder.classList.remove('animate-pulse');
          }, 1000);
        }
      }
    };

    const resetPuzzle = () => {
      setPuzzlePieces(currentWord.letters.map((letter, index) => ({
        letter,
        id: index,
        position: Math.random() > 0.5 ? 'top' : 'bottom'
      })));
      setBuiltWord([]);
      setSelectedPiece(null);
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <HapticButton
              variant="outline"
              onClick={() => setCurrentGame(null)}
              className="p-2"
              hapticType="light"
            >
              <ArrowLeft className="w-5 h-5" />
            </HapticButton>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Word Puzzle</h1>
              <p className="text-gray-600">Level {gameLevel} • Question {currentQuestion + 1}/8</p>
            </div>
            <div className="w-10" />
          </div>

          {/* Word Display */}
          <Card className="mb-6 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-4">{currentWord.hebrew}</div>
            <div className="text-lg text-gray-600 mb-4">{currentWord.english}</div>
            
            {/* Big Sound Button */}
            <HapticButton
              variant="outline"
              onClick={() => playHebrewSound(currentWord.hebrew)}
              className="mt-4 w-20 h-20 rounded-full mx-auto"
              hapticType="light"
            >
              <Volume2 className="w-10 h-10" />
            </HapticButton>
          </Card>

          {/* Puzzle Area */}
          <Card className="mb-6 p-4">
            {/* Word Builder - Horizontal Layout */}
            <div className="mb-6">
              <h3 className="text-center font-semibold mb-3">Build the Word</h3>
              <div className="word-builder flex justify-center gap-2 flex-wrap">
                {puzzlePieces.map((piece) => (
                  <HapticButton
                    key={piece.id}
                    variant={selectedPiece === piece.id ? "default" : "outline"}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`h-16 w-16 text-2xl font-bold transition-all duration-200 ${
                      selectedPiece === piece.id ? 'ring-2 ring-purple-500 scale-110' : 'hover:scale-105'
                    }`}
                    hapticType="light"
                  >
                    {piece.letter}
                  </HapticButton>
                ))}
              </div>
            </div>

            {/* Preview Area */}
            <div className="text-center">
              <h3 className="text-center font-semibold mb-3">Your Word</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[60px] flex items-center justify-center">
                <div className="text-2xl font-bold text-purple-600">
                  {puzzlePieces.map(p => p.letter).join('') || 'Build the word above'}
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <HapticButton
              variant="outline"
              onClick={resetPuzzle}
              className="w-full h-12"
              hapticType="light"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset Puzzle
            </HapticButton>
            
            <HapticButton
              onClick={checkWord}
              className="w-full h-16 text-lg font-bold bg-purple-500 hover:bg-purple-600"
              hapticType="success"
            >
              Check My Word ✓
            </HapticButton>
          </div>

          {/* Progress */}
          <div className="text-center mt-6">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {gameProgress}/8 questions
            </div>
            <Progress value={(gameProgress / 8) * 100} className="h-3" />
          </div>
        </div>
      </div>
    );
  };

  const renderColoringStore = () => {
    if (!currentProfile) return null;

    return (
      <ColoringRedemption
        points={currentProfile.points}
        redeemedSheets={currentProfile.redeemedSheets}
        onRedeem={redeemColoringSheet}
        onDownload={(sheetId) => {
          // Download logic here
          console.log('Downloading sheet:', sheetId);
        }}
        onBack={() => setCurrentGame(null)}
      />
    );
  };

  // Main render logic
  if (showProfileCreation) {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderProfileCreation()}
      </div>
    );
  }

  if (showProfileSelection) {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderProfileSelection()}
      </div>
    );
  }

  // Safety check: if no current profile, show profile creation
  if (!currentProfile) {
    setShowProfileCreation(true);
    return null;
  }

  if (currentGame === 'letter-match') {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderLetterMatchGame()}
      </div>
    );
  }

  if (currentGame === 'word-builder') {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderWordBuilderGame()}
      </div>
    );
  }

  if (currentGame === 'memory-game') {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderMemoryGame()}
      </div>
    );
  }

  if (currentGame === 'letter-tracing') {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderLetterTracingGame()}
      </div>
    );
  }

  if (currentGame === 'letter-catch') {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderLetterCatchGame()}
      </div>
    );
  }

  if (currentGame === 'word-puzzle') {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderWordPuzzleGame()}
      </div>
    );
  }

  if (currentGame === 'numbers-game') {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderNumbersGame()}
      </div>
    );
  }

  if (currentGame === 'coloring-store') {
    return (
      <div ref={appRef} className="min-h-screen bg-background">
        {renderColoringStore()}
      </div>
    );
  }

  return (
    <div ref={appRef} className="min-h-screen bg-background">
      {renderHomeScreen()}
    </div>
  );
}