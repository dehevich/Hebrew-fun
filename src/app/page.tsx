"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { HapticButton } from '@/components/ui/haptic-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ColoringRedemption } from '@/components/coloring-redemption';
import { Star, Trophy, BookOpen, Home, User, Settings, ArrowLeft, RotateCcw, Plus, Edit, Palette } from 'lucide-react';

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
    bubblePop: number;
    storyTime: number;
    numbersGame: number;
  };
  achievements: string[];
  redeemedSheets: string[];
  createdAt: string;
}

const animalIcons = [
  '🦁', '🐘', '🦒', '🐼', '🦊', '🐨', '🐯', '🦁', 
  '🐸', '🐰', '🦄', '🐷', '🐶', '🐱', '🐭', '🦔'
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

  // Initialize profiles from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem('hebrewLearningProfiles');
    const savedCurrentProfile = localStorage.getItem('hebrewLearningCurrentProfile');
    
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      // Create default profile if none exists
      const defaultProfile: Profile = {
        id: 'default',
        name: 'Little Learner',
        age: 5,
        icon: '🦁',
        points: 0,
        level: 1,
        streak: 0,
        gameProgress: {
          letterMatch: 0,
          wordBuilder: 0,
          memoryGame: 0,
          letterTracing: 0,
          bubblePop: 0,
          storyTime: 0,
          numbersGame: 0,
        },
        achievements: [],
        redeemedSheets: [],
        createdAt: new Date().toISOString(),
      };
      setProfiles([defaultProfile]);
      setCurrentProfile(defaultProfile);
      localStorage.setItem('hebrewLearningProfiles', JSON.stringify([defaultProfile]));
      localStorage.setItem('hebrewLearningCurrentProfile', JSON.stringify(defaultProfile));
    }
    
    if (savedCurrentProfile) {
      setCurrentProfile(JSON.parse(savedCurrentProfile));
    }
  }, []);

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
        bubblePop: 0,
        storyTime: 0,
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
        [gameType]: Math.min(currentProfile.gameProgress[gameType] + increment, 100)
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

  const downloadColoringSheet = (sheetId: string) => {
    // Import the coloring sheet generator
    import('@/utils/coloring-sheet-generator').then(({ ColoringSheetGenerator, coloringSheetTemplates }) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 500;
      
      const generator = new ColoringSheetGenerator(canvas);
      const template = coloringSheetTemplates[sheetId];
      
      if (template) {
        generator.generateColoringSheet(template);
        generator.downloadSheet(`${template.title.replace(/\s+/g, '_')}_coloring_sheet.png`);
      } else {
        // Fallback for sheets without predefined templates
        const fallbackTemplate = {
          id: sheetId,
          title: 'Coloring Sheet',
          backgroundColor: '#ffffff',
          elements: [
            { type: 'shape', content: 'star', x: 200, y: 200, size: 100, color: '#333333' },
            { type: 'text', content: 'HAVE FUN COLORING!', x: 200, y: 320, size: 20, color: '#333333' }
          ]
        };
        generator.generateColoringSheet(fallbackTemplate);
        generator.downloadSheet(`${sheetId}_coloring_sheet.png`);
      }
    });
  };

  const getAgeBasedDifficulty = () => {
    if (!currentProfile) return 'easy';
    
    if (currentProfile.age <= 6) {
      return 'easy'; // More visual, voice instructions
    } else if (currentProfile.age <= 8) {
      return 'medium'; // Balanced visual and text
    } else {
      return 'hard'; // More text-based challenges
    }
  };

  const shouldUseVoiceInstructions = () => {
    return currentProfile ? currentProfile.age <= 6 : false;
  };
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

  // Letter Tracing game states
  const [currentTracingLetter, setCurrentTracingLetter] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const [tracingProgress, setTracingProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const tracingCanvasRef = useRef<HTMLCanvasElement>(null);

  // Custom hook for letter tracing canvas
  const useLetterTracingCanvas = () => {
    useEffect(() => {
      const canvas = tracingCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get current letter
      const currentLetter = alphabetCards[currentTracingLetter];
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw letter template (light gray)
      ctx.font = 'bold 120px Arial';
      ctx.fillStyle = '#e5e7eb';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentLetter.letter, canvas.width / 2, canvas.height / 2);
    }, [currentTracingLetter]);
  };

  // Use the custom hook
  useLetterTracingCanvas();

  // Numbers game states
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showNumberFeedback, setShowNumberFeedback] = useState(false);
  const [isNumberCorrect, setIsNumberCorrect] = useState(false);

  // Word Builder game states
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [builtWord, setBuiltWord] = useState<string[]>([]);

  // Memory game states
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameCards, setGameCards] = useState([
    { id: 1, hebrew: 'שלום', english: 'Peace', emoji: '🕊️', matched: false },
    { id: 2, hebrew: 'תודה', english: 'Thank you', emoji: '🙏', matched: false },
    { id: 3, hebrew: 'אהבה', english: 'Love', emoji: '❤️', matched: false },
    { id: 4, hebrew: 'חבר', english: 'Friend', emoji: '🤝', matched: false },
    { id: 1, hebrew: 'שלום', english: 'Peace', emoji: '🕊️', matched: false },
    { id: 2, hebrew: 'תודה', english: 'Thank you', emoji: '🙏', matched: false },
    { id: 3, hebrew: 'אהבה', english: 'Love', emoji: '❤️', matched: false },
    { id: 4, hebrew: 'חבר', english: 'Friend', emoji: '🤝', matched: false },
  ].sort(() => Math.random() - 0.5));

  // Bubble Pop game states
  const [bubbles, setBubbles] = useState([
    { id: 1, letter: 'א', popped: false, x: 20, y: 80 },
    { id: 2, letter: 'ב', popped: false, x: 60, y: 60 },
    { id: 3, letter: 'ג', popped: false, x: 40, y: 40 },
    { id: 4, letter: 'ד', popped: false, x: 80, y: 20 },
    { id: 5, letter: 'ה', popped: false, x: 30, y: 70 },
    { id: 6, letter: 'ו', popped: false, x: 70, y: 50 },
  ]);
  const [timeLeft, setTimeLeft] = useState(30);

  // Story Time game states
  const [currentStory, setCurrentStory] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);

  const alphabetCards = [
    { letter: 'א', name: 'Aleph', sound: 'ah', image: '🦁' },
    { letter: 'ב', name: 'Bet', sound: 'b', image: '🏠' },
    { letter: 'ג', name: 'Gimel', sound: 'g', image: '🐪' },
    { letter: 'ד', name: 'Dalet', sound: 'd', image: '🚪' },
    { letter: 'ה', name: 'He', sound: 'h', image: '🪟' },
    { letter: 'ו', name: 'Vav', sound: 'v', image: '🔗' },
    { letter: 'ז', name: 'Zayin', sound: 'z', image: '⚡' },
    { letter: 'ח', name: 'Chet', sound: 'ch', image: '🏞️' },
  ];

  const games = currentProfile ? [
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
      title: 'Bubble Pop', 
      icon: '🫧', 
      description: 'Pop bubbles with Hebrew letters', 
      progress: currentProfile.gameProgress.bubblePop,
      key: 'bubble-pop'
    },
    { 
      title: 'Story Time', 
      icon: '📖', 
      description: 'Interactive Hebrew stories', 
      progress: currentProfile.gameProgress.storyTime,
      key: 'story-time'
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
  ] : [];

  const achievements = currentProfile ? [
    { title: 'First Steps', icon: '👶', earned: currentProfile.achievements.includes('first-steps') },
    { title: 'Letter Master', icon: '📝', earned: currentProfile.achievements.includes('letter-master') },
    { title: 'Word Wizard', icon: '🧙', earned: currentProfile.achievements.includes('word-wizard') },
    { title: 'Fluent Speaker', icon: '🗣️', earned: currentProfile.achievements.includes('fluent-speaker') },
  ] : [];

  const soundOptions = ['ah', 'b', 'g', 'd', 'h', 'v', 'z', 'ch'];

  const handleSoundSelect = (sound: string) => {
    setSelectedSound(sound);
    const correct = sound === alphabetCards[currentLetterIndex].sound;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      updateProfileProgress('letterMatch', 10);
      
      // Add achievement for first correct answer
      if (currentProfile && !currentProfile.achievements.includes('first-steps')) {
        const updatedProfile = {
          ...currentProfile,
          achievements: [...currentProfile.achievements, 'first-steps']
        };
        setCurrentProfile(updatedProfile);
        setProfiles(prev => prev.map(p => p.id === currentProfile.id ? updatedProfile : p));
      }
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedSound(null);
      setCurrentLetterIndex(prev => (prev + 1) % alphabetCards.length);
    }, 1500);
  };

  const renderProfileCreation = () => {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={20}
              />
            </div>

            {/* Age Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How old are you?
              </label>
              <div className="flex items-center gap-4">
                <HapticButton
                  variant="outline"
                  onClick={() => setNewProfileAge(Math.max(4, newProfileAge - 1))}
                  disabled={newProfileAge <= 4}
                  className="w-12 h-12 rounded-full"
                  hapticType="light"
                >
                  -
                </HapticButton>
                <span className="text-2xl font-bold text-purple-600 min-w-[60px] text-center">
                  {newProfileAge}
                </span>
                <HapticButton
                  variant="outline"
                  onClick={() => setNewProfileAge(Math.min(10, newProfileAge + 1))}
                  disabled={newProfileAge >= 10}
                  className="w-12 h-12 rounded-full"
                  hapticType="light"
                >
                  +
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
                    className="w-16 h-16 text-2xl rounded-lg"
                    onClick={() => setSelectedIcon(icon)}
                    hapticType="light"
                  >
                    {icon}
                  </HapticButton>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <HapticButton
                onClick={createProfile}
                disabled={!newProfileName.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3"
                hapticType="success"
              >
                Let's Start Learning! 🚀
              </HapticButton>
              <HapticButton
                variant="outline"
                onClick={() => setShowProfileCreation(false)}
                className="w-full"
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

  const renderProfileSelection = () => {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-600">Who's Learning Today? 👋</CardTitle>
            <p className="text-gray-600">Choose your profile to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile List */}
            <div className="space-y-3">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
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
                      <div className="text-sm text-gray-500">
                        {profile.gameProgress.letterMatch + 
                         profile.gameProgress.wordBuilder + 
                         profile.gameProgress.memoryGame + 
                         profile.gameProgress.letterTracing + 
                         profile.gameProgress.bubblePop + 
                         profile.gameProgress.storyTime}% Complete
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Profile Button */}
            <Button
              onClick={() => {
                setShowProfileCreation(true);
                setShowProfileSelection(false);
              }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const playHebrewSound = (letter: string, sound: string, event?: React.MouseEvent) => {
    // For authentic Hebrew pronunciation, we'll use Hebrew words instead of English sounds
    const hebrewWords = {
      'א': 'אלף',
      'ב': 'בית', 
      'ג': 'גמל',
      'ד': 'דלת',
      'ה': 'הא',
      'ו': 'וו',
      'ז': 'זין',
      'ח': 'חית'
    };
    
    const hebrewWord = hebrewWords[letter as keyof typeof hebrewWords] || letter;
    
    // Create audio context for Hebrew pronunciation
    const utterance = new SpeechSynthesisUtterance(hebrewWord);
    utterance.lang = 'he-IL';
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
    
    // Visual feedback if event is provided
    if (event) {
      const button = event.currentTarget as HTMLElement;
      button.classList.add('scale-95');
      setTimeout(() => {
        button.classList.remove('scale-95');
      }, 200);
    }
  };

  const playWordSound = (hebrew: string) => {
    const utterance = new SpeechSynthesisUtterance(hebrew);
    utterance.lang = 'he-IL';
    utterance.rate = 0.6;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  };

  const renderLetterMatchGame = () => {
    const currentLetter = alphabetCards[currentLetterIndex];
    
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <HapticButton 
            variant="ghost" 
            onClick={() => setCurrentGame(null)}
            className="flex items-center gap-2"
            hapticType="light"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </HapticButton>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Score: {currentProfile.gameProgress.letterMatch}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {currentProfile.points}
            </Badge>
          </div>
        </div>

        {/* Game Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Letter Match Game 🎯</CardTitle>
            <p className="text-lg opacity-90">Match the letter with its sound!</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl mb-4">{currentLetter.image}</div>
            <div className="text-7xl font-bold mb-4">{currentLetter.letter}</div>
            <p className="text-xl mb-6">What sound does this letter make?</p>
            <HapticButton 
              onClick={(e) => {
                playHebrewSound(currentLetter.letter, currentLetter.sound, e);
                // Voice instructions for young learners
                if (shouldUseVoiceInstructions()) {
                  setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(`What sound does the letter ${currentLetter.name} make?`);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.8;
                    utterance.pitch = 1.2;
                    speechSynthesis.speak(utterance);
                  }, 1000);
                }
              }}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 mb-4"
              hapticType="medium"
            >
              🔊 Hear Sound
            </HapticButton>
          </CardContent>
        </Card>

        {/* Sound Options */}
        <div className="grid grid-cols-2 gap-4">
          {soundOptions.map((sound, index) => (
            <HapticButton
              key={index}
              className={`h-20 text-xl font-bold transition-all duration-200 ${
                selectedSound === sound
                  ? isCorrect
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white'
              }`}
              onClick={() => handleSoundSelect(sound)}
              disabled={showFeedback}
              hapticType="medium"
            >
              /{sound}/
            </HapticButton>
          ))}
        </div>

        {/* Enhanced Feedback */}
        {showFeedback && (
          <Card className={`${isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">{isCorrect ? '🎉' : '😊'}</div>
              <p className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct! Great job!' : `Nice try! The sound is /${currentLetter.sound}/`}
              </p>
              {isCorrect && (
                <div className="mt-2">
                  <Badge className="bg-yellow-500 text-yellow-900">
                    +10 Points!
                  </Badge>
                  {shouldUseVoiceInstructions() && (
                    <p className="text-sm text-green-700 mt-2">🔊 Excellent work!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{currentLetterIndex + 1}/{alphabetCards.length}</span>
            </div>
            <Progress value={((currentLetterIndex + 1) / alphabetCards.length) * 100} className="h-3" />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWordBuilderGame = () => {
    const words = [
      { hebrew: 'שלום', english: 'Peace', image: '🕊️', letters: ['ש', 'ל', 'ו', 'ם'] },
      { hebrew: 'תודה', english: 'Thank you', image: '🙏', letters: ['ת', 'ו', 'ד', 'ה'] },
      { hebrew: 'אבא', english: 'Father', image: '👨', letters: ['א', 'ב', 'א'] },
    ];

    const currentWord = words[currentWordIndex];

    const handleLetterClick = (letter: string) => {
      if (builtWord.length < currentWord.letters.length) {
        setBuiltWord([...builtWord, letter]);
        
        // Voice feedback for young learners
        if (shouldUseVoiceInstructions()) {
          const utterance = new SpeechSynthesisUtterance(letter);
          utterance.lang = 'he-IL';
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }
      }
    };

    const checkWord = () => {
      const isCorrect = builtWord.join('') === currentWord.hebrew;
      if (isCorrect) {
        updateProfileProgress('wordBuilder', 20);
        
        // Voice feedback for young learners
        if (shouldUseVoiceInstructions()) {
          const utterance = new SpeechSynthesisUtterance('Excellent! You built the word correctly!');
          utterance.lang = 'en-US';
          utterance.rate = 0.8;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        }
        
        setTimeout(() => {
          setBuiltWord([]);
          setCurrentWordIndex(prev => (prev + 1) % words.length);
        }, 2000);
      } else {
        // Voice feedback for incorrect answer
        if (shouldUseVoiceInstructions()) {
          const utterance = new SpeechSynthesisUtterance('Try again! You can do it!');
          utterance.lang = 'en-US';
          utterance.rate = 0.8;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        }
      }
      return isCorrect;
    };

    const resetWord = () => {
      setBuiltWord([]);
    };

    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <HapticButton 
            variant="ghost" 
            onClick={() => setCurrentGame(null)}
            className="flex items-center gap-2"
            hapticType="light"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </HapticButton>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Score: {currentProfile.gameProgress.wordBuilder}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {currentProfile.points}
            </Badge>
          </div>
        </div>

        {/* Game Card */}
        <Card className="bg-gradient-to-br from-green-500 to-blue-500 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Word Builder 🧩</CardTitle>
            <p className="text-lg opacity-90">Build the Hebrew word!</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl mb-4">{currentWord.image}</div>
            <p className="text-xl mb-2">{currentWord.english}</p>
            <p className="text-lg opacity-90 mb-4" dir="rtl">Build: {currentWord.hebrew}</p>
            <HapticButton 
              onClick={() => {
                playWordSound(currentWord.hebrew);
                // Voice instructions for young learners
                if (shouldUseVoiceInstructions()) {
                  setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(`Can you build the word ${currentWord.english}?`);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.8;
                    utterance.pitch = 1.2;
                    speechSynthesis.speak(utterance);
                  }, 1000);
                }
              }}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              hapticType="medium"
            >
              🔊 Hear Word
            </HapticButton>
          </CardContent>
        </Card>

        {/* Word Building Area */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center gap-2 mb-4 min-h-[60px] items-center" dir="rtl">
              {builtWord.map((letter, index) => (
                <div key={index} className="w-12 h-12 bg-purple-100 border-2 border-purple-300 rounded-lg flex items-center justify-center text-2xl font-bold text-purple-800">
                  {letter}
                </div>
              ))}
              {Array(currentWord.letters.length - builtWord.length).fill(0).map((_, index) => (
                <div key={index} className="w-12 h-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">?</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-2">
              <HapticButton 
                onClick={resetWord}
                variant="outline"
                className="flex items-center gap-2"
                hapticType="light"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </HapticButton>
              {builtWord.length === currentWord.letters.length && (
                <HapticButton 
                  onClick={checkWord}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  hapticType="success"
                >
                  Check Word ✅
                </HapticButton>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Letter Options */}
        <div className="grid grid-cols-3 gap-3">
          {currentWord.letters.map((letter, index) => (
            <HapticButton
              key={index}
              className="h-16 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white"
              onClick={() => handleLetterClick(letter)}
              hapticType="medium"
            >
              {letter}
            </HapticButton>
          ))}
        </div>
      </div>
    );
  };

  const renderMemoryGame = () => {
    const cards = [
      { id: 1, hebrew: 'שלום', english: 'Peace', emoji: '🕊️', matched: false },
      { id: 2, hebrew: 'תודה', english: 'Thank you', emoji: '🙏', matched: false },
      { id: 3, hebrew: 'אהבה', english: 'Love', emoji: '❤️', matched: false },
      { id: 4, hebrew: 'חבר', english: 'Friend', emoji: '🤝', matched: false },
    ];

    const handleCardClick = (index: number) => {
      if (flippedCards.length === 2 || flippedCards.includes(index) || gameCards[index].matched) {
        return;
      }

      const newFlippedCards = [...flippedCards, index];
      setFlippedCards(newFlippedCards);

      // Play sound when card is flipped
      const card = gameCards[index];
      playWordSound(card.hebrew);

      // Voice instructions for young learners
      if (shouldUseVoiceInstructions()) {
        const utterance = new SpeechSynthesisUtterance(`You found ${card.english}!`);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        setTimeout(() => speechSynthesis.speak(utterance), 500);
      }

      if (newFlippedCards.length === 2) {
        const card1 = gameCards[newFlippedCards[0]];
        const card2 = gameCards[newFlippedCards[1]];

        if (card1.id === card2.id) {
          // Match found
          setTimeout(() => {
            const updatedCards = gameCards.map((card, i) => 
              newFlippedCards.includes(i) ? { ...card, matched: true } : card
            );
            setGameCards(updatedCards);
            setFlippedCards([]);
            setMatchedPairs(prev => prev + 1);
            updateProfileProgress('memoryGame', 15);
            
            // Voice feedback for match
            if (shouldUseVoiceInstructions()) {
              const utterance = new SpeechSynthesisUtterance('Great match! Well done!');
              utterance.lang = 'en-US';
              utterance.rate = 0.8;
              utterance.pitch = 1.2;
              speechSynthesis.speak(utterance);
            }
          }, 1000);
        } else {
          // No match
          setTimeout(() => {
            setFlippedCards([]);
            
            // Voice feedback for no match
            if (shouldUseVoiceInstructions()) {
              const utterance = new SpeechSynthesisUtterance('Try again! Look for matching pairs.');
              utterance.lang = 'en-US';
              utterance.rate = 0.8;
              utterance.pitch = 1.2;
              speechSynthesis.speak(utterance);
            }
          }, 1000);
        }
      }
    };

    const resetMemoryGame = () => {
      setFlippedCards([]);
      setMatchedPairs(0);
      setGameCards([...cards, ...cards].sort(() => Math.random() - 0.5));
    };

    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentGame(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Pairs: {matchedPairs}/4
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {currentProfile.points}
            </Badge>
          </div>
        </div>

        {/* Game Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Memory Game 🧠</CardTitle>
            <p className="text-lg opacity-90">Match the Hebrew words!</p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg">Find matching pairs of Hebrew words</p>
            {shouldUseVoiceInstructions() && (
              <p className="text-sm opacity-75 mt-2">🔊 Click cards to hear the words!</p>
            )}
          </CardContent>
        </Card>

        {/* Memory Grid */}
        <div className="grid grid-cols-4 gap-3">
          {gameCards.map((card, index) => (
            <Card
              key={index}
              className={`h-24 cursor-pointer transition-all duration-300 ${
                flippedCards.includes(index) || card.matched
                  ? 'bg-gradient-to-br from-blue-400 to-purple-400 text-white'
                  : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600 hover:from-gray-400 hover:to-gray-500'
              } ${card.matched ? 'opacity-50' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <CardContent className="p-3 text-center flex flex-col items-center justify-center h-full">
                {flippedCards.includes(index) || card.matched ? (
                  <>
                    <div className="text-2xl mb-1">{card.emoji}</div>
                    <div className="text-sm font-bold" dir="rtl">{card.hebrew}</div>
                  </>
                ) : (
                  <div className="text-2xl">❓</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reset Button */}
        <div className="text-center">
          <Button 
            onClick={resetMemoryGame}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>

        {/* Win Message */}
        {matchedPairs === 4 && (
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-xl font-bold mb-2">Congratulations!</p>
              <p className="text-lg">You matched all pairs!</p>
              <Badge className="mt-2 bg-white text-orange-600">
                +60 Points!
              </Badge>
              {shouldUseVoiceInstructions() && (
                <p className="text-sm mt-2">🔊 Amazing job! You're a memory master!</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderLetterTracingGame = () => {
    const currentLetter = alphabetCards[currentTracingLetter];

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = tracingCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      setIsTracing(true);
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#f97316'; // Orange color
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isTracing) return;
      
      const canvas = tracingCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Update progress based on drawing activity
      setTracingProgress(prev => Math.min(prev + 2, 100));
    };

    const stopDrawing = () => {
      setIsTracing(false);
      
      // Check if tracing is complete
      if (tracingProgress >= 80) {
        handleTracingComplete();
      }
    };

    const clearCanvas = () => {
      const canvas = tracingCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setTracingProgress(0);
    };

    const handleTracingComplete = () => {
      updateProfileProgress('letterTracing', 15);
      setShowSuccess(true);
      
      // Voice feedback for young learners
      if (shouldUseVoiceInstructions()) {
        const utterance = new SpeechSynthesisUtterance('Excellent tracing! Great job!');
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
      
      setTimeout(() => {
        setShowSuccess(false);
        clearCanvas();
        setCurrentTracingLetter(prev => (prev + 1) % alphabetCards.length);
      }, 2000);
    };

    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentGame(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Letter: {currentTracingLetter + 1}/{alphabetCards.length}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {currentProfile.points}
            </Badge>
          </div>
        </div>

        {/* Game Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Letter Tracing ✏️</CardTitle>
            <p className="text-lg opacity-90">Trace the Hebrew letter with your finger!</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl mb-4">{currentLetter.image}</div>
            <div className="text-7xl font-bold mb-4" dir="rtl">{currentLetter.letter}</div>
            <p className="text-xl mb-4">{currentLetter.name}</p>
            <Button 
              onClick={() => playHebrewSound(currentLetter.letter, currentLetter.sound)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 mb-4"
            >
              🔊 Hear Sound
            </Button>
          </CardContent>
        </Card>

        {/* Tracing Area */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-800 mb-2">Trace the letter:</p>
              {shouldUseVoiceInstructions() && (
                <p className="text-sm text-blue-600 mb-2">🔊 Use your finger to trace the letter!</p>
              )}
            </div>
            
            {/* Canvas Drawing Area */}
            <div className="relative mb-4">
              <canvas
                ref={tracingCanvasRef}
                width={300}
                height={200}
                className="border-2 border-dashed border-gray-300 rounded-lg bg-white cursor-crosshair w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                Draw here
              </div>
            </div>
            
            {/* Progress */}
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${tracingProgress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={clearCanvas}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </Button>
                
                <Button 
                  onClick={handleTracingComplete}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={tracingProgress < 80}
                >
                  Complete! ✅
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Progress: {tracingProgress}% (Need 80% to complete)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {showSuccess && (
          <Card className="bg-green-100 border-green-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-xl font-bold text-green-800 mb-2">Excellent tracing!</p>
              <p className="text-green-700">You traced the letter {currentLetter.letter} perfectly!</p>
              <Badge className="mt-2 bg-yellow-500 text-yellow-900">
                +15 Points!
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-700 mb-2">
              ✏️ Use your mouse or finger to trace the Hebrew letter
            </p>
            <p className="text-sm text-gray-600">
              Follow the gray template and reach 80% progress to complete!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBubblePopGame = () => {
    const popBubble = (id: number) => {
      setBubbles(prev => prev.map(bubble => 
        bubble.id === id ? { ...bubble, popped: true } : bubble
      ));
      updateProfileProgress('bubblePop', 5);
      
      // Voice feedback for young learners
      if (shouldUseVoiceInstructions()) {
        const bubble = bubbles.find(b => b.id === id);
        if (bubble) {
          const utterance = new SpeechSynthesisUtterance(`Great job! You popped ${bubble.letter}!`);
          utterance.lang = 'en-US';
          utterance.rate = 0.8;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        }
      }
      
      // Respawn bubble after 2 seconds
      setTimeout(() => {
        setBubbles(prev => prev.map(bubble => 
          bubble.id === id 
            ? { ...bubble, popped: false, x: Math.random() * 80 + 10, y: Math.random() * 60 + 10 }
            : bubble
        ));
      }, 2000);
    };

    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentGame(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Score: {currentProfile.gameProgress.bubblePop}
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              Time: {timeLeft}s
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {currentProfile.points}
            </Badge>
          </div>
        </div>

        {/* Game Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Bubble Pop 🫧</CardTitle>
            <p className="text-lg opacity-90">Pop the bubbles with Hebrew letters!</p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-4">Pop as many Hebrew letter bubbles as you can!</p>
            {shouldUseVoiceInstructions() && (
              <p className="text-sm opacity-75">🔊 Pop the bubbles and hear the letters!</p>
            )}
          </CardContent>
        </Card>

        {/* Game Area */}
        <Card className="relative h-96 overflow-hidden">
          <CardContent className="p-0 h-full">
            <div className="relative w-full h-full bg-gradient-to-b from-sky-100 to-blue-100">
              {bubbles.map((bubble) => (
                !bubble.popped && (
                  <Button
                    key={bubble.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white border-2 border-white shadow-lg transition-all duration-200 hover:scale-110"
                    style={{
                      left: `${bubble.x}%`,
                      top: `${bubble.y}%`,
                    }}
                    onClick={() => popBubble(bubble.id)}
                  >
                    <span className="text-2xl font-bold" dir="rtl">{bubble.letter}</span>
                  </Button>
                )
              ))}
              
              {/* Decorative bubbles */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full"></div>
              <div className="absolute top-8 right-8 w-6 h-6 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-12 left-12 w-10 h-10 bg-white/25 rounded-full"></div>
              <div className="absolute bottom-8 right-16 w-4 h-4 bg-white/15 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Game Instructions */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-700 mb-2">
              🎯 Click on the bubbles to pop them and learn Hebrew letters!
            </p>
            <p className="text-sm text-gray-600">
              Each bubble gives you 5 points. New bubbles appear automatically!
            </p>
            {shouldUseVoiceInstructions() && (
              <p className="text-sm text-blue-600 mt-2">🔊 Listen for the letter sounds as you play!</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStoryTimeGame = () => {
    const stories = [
      {
        title: "The Lion and the Mouse",
        hebrew: "האריה והעכבר",
        content: "A little mouse helps a big lion. In Hebrew: עכבר קטן עוזר לאריה גדול",
        words: ["אריה", "עכבר", "גדול", "קטן", "עוזר"]
      },
      {
        title: "The Happy Family",
        hebrew: "המשפחה המאושרת",
        content: "A happy family loves each other. In Hebrew: משפחה מאושרת אוהבת אחד את השני",
        words: ["משפחה", "אבא", "אמא", "ילד", "אוהב"]
      }
    ];

    const story = stories[currentStory];

    const handleWordClick = (word: string, index: number) => {
      setCurrentWord(index);
      playWordSound(word);
      updateProfileProgress('storyTime', 3);
      
      // Voice feedback for young learners
      if (shouldUseVoiceInstructions()) {
        const utterance = new SpeechSynthesisUtterance(`Great! You learned the word ${word}!`);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        setTimeout(() => speechSynthesis.speak(utterance), 500);
      }
    };

    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentGame(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Story {currentStory + 1}/{stories.length}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {currentProfile.points}
            </Badge>
          </div>
        </div>

        {/* Game Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Story Time 📖</CardTitle>
            <p className="text-lg opacity-90">Interactive Hebrew stories!</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl mb-2">{story.title}</p>
            <p className="text-lg opacity-90" dir="rtl">{story.hebrew}</p>
          </CardContent>
        </Card>

        {/* Story Content */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-700 mb-4">{story.content}</p>
              <Button 
                onClick={() => {
                  playWordSound(story.hebrew);
                  // Voice instructions for young learners
                  if (shouldUseVoiceInstructions()) {
                    setTimeout(() => {
                      const utterance = new SpeechSynthesisUtterance(`Listen to this story about ${story.title}`);
                      utterance.lang = 'en-US';
                      utterance.rate = 0.8;
                      utterance.pitch = 1.2;
                      speechSynthesis.speak(utterance);
                    }, 1000);
                  }
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                🔊 Hear Story in Hebrew
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center text-gray-800">Learn the Words:</h3>
              <div className="grid grid-cols-2 gap-4">
                {story.words.map((word, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all duration-200 ${
                      currentWord === index 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-md' 
                        : 'bg-gray-50 border-gray-200 hover:shadow-md'
                    }`}
                    onClick={() => handleWordClick(word, index)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-2" dir="rtl">{word}</div>
                      <Button 
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playWordSound(word);
                        }}
                      >
                        🔊 Listen
                      </Button>
                      {shouldUseVoiceInstructions() && currentWord === index && (
                        <p className="text-xs text-green-600 mt-2">🔊 Great choice!</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button 
                onClick={() => setCurrentStory(prev => (prev + 1) % stories.length)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Next Story 📖
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNumbersGame = () => {
    const hebrewNumbers = [
      { number: 1, hebrew: 'אחת', pronunciation: 'achat', image: '🍎' },
      { number: 2, hebrew: 'שתיים', pronunciation: 'shtayim', image: '👟' },
      { number: 3, hebrew: 'שלוש', pronunciation: 'shalosh', image: '🌟' },
      { number: 4, hebrew: 'ארבע', pronunciation: 'arba', image: '🍀' },
      { number: 5, hebrew: 'חמש', pronunciation: 'chamesh', image: '✋' },
      { number: 6, hebrew: 'שש', pronunciation: 'shesh', image: '🎲' },
      { number: 7, hebrew: 'שבע', pronunciation: 'sheva', image: '🌈' },
      { number: 8, hebrew: 'שמונה', pronunciation: 'shmona', image: '🕷️' },
      { number: 9, hebrew: 'תשע', pronunciation: 'tesha', image: '🎈' },
      { number: 10, hebrew: 'עשר', pronunciation: 'eser', image: '🔟' },
    ];

    const handleNumberSelect = (number: number) => {
      setSelectedNumber(number);
      const correct = number === hebrewNumbers[currentNumberIndex].number;
      setIsNumberCorrect(correct);
      setShowNumberFeedback(true);
      
      if (correct) {
        updateProfileProgress('numbersGame', 10);
        
        // Voice feedback for young learners
        if (shouldUseVoiceInstructions()) {
          const utterance = new SpeechSynthesisUtterance('Excellent! You got it right!');
          utterance.lang = 'en-US';
          utterance.rate = 0.8;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        }
      }

      setTimeout(() => {
        setShowNumberFeedback(false);
        setSelectedNumber(null);
        setCurrentNumberIndex(prev => (prev + 1) % hebrewNumbers.length);
      }, 2000);
    };

    const playNumberSound = (hebrew: string, pronunciation: string, event?: React.MouseEvent) => {
      // Play Hebrew pronunciation
      const utterance = new SpeechSynthesisUtterance(hebrew);
      utterance.lang = 'he-IL';
      utterance.rate = 0.7;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
      
      // Visual feedback if event is provided
      if (event) {
        const button = event.currentTarget as HTMLElement;
        button.classList.add('scale-95');
        setTimeout(() => {
          button.classList.remove('scale-95');
        }, 200);
      }
    };

    const currentNumber = hebrewNumbers[currentNumberIndex];

    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentGame(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Score: {currentProfile.gameProgress.numbersGame}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {currentProfile.points}
            </Badge>
          </div>
        </div>

        {/* Game Card */}
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Numbers Game 🔢</CardTitle>
            <p className="text-lg opacity-90">Learn to count in Hebrew!</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl mb-4">{currentNumber.image}</div>
            <div className="text-5xl font-bold mb-4" dir="rtl">{currentNumber.hebrew}</div>
            <p className="text-xl mb-6">What number is this?</p>
            <Button 
              onClick={(e) => {
                playNumberSound(currentNumber.hebrew, currentNumber.pronunciation, e);
                // Voice instructions for young learners
                if (shouldUseVoiceInstructions()) {
                  setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(`Can you guess what number this is?`);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.8;
                    utterance.pitch = 1.2;
                    speechSynthesis.speak(utterance);
                  }, 1000);
                }
              }}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 mb-4"
            >
              🔊 Hear Number
            </Button>
          </CardContent>
        </Card>

        {/* Number Options */}
        <div className="grid grid-cols-2 gap-4">
          {hebrewNumbers.slice(0, 6).map((num) => (
            <Button
              key={num.number}
              className={`h-20 text-xl font-bold transition-all duration-200 ${
                selectedNumber === num.number
                  ? isNumberCorrect
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white'
              }`}
              onClick={() => handleNumberSelect(num.number)}
              disabled={showNumberFeedback}
            >
              {num.number}
            </Button>
          ))}
        </div>

        {/* Enhanced Feedback */}
        {showNumberFeedback && (
          <Card className={`${isNumberCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">{isNumberCorrect ? '🎉' : '😊'}</div>
              <p className={`text-xl font-bold ${isNumberCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isNumberCorrect 
                  ? `Correct! This is ${currentNumber.number} - ${currentNumber.hebrew}!` 
                  : `Nice try! This is ${currentNumber.number} - ${currentNumber.hebrew}`
                }
              </p>
              {isNumberCorrect && (
                <div className="mt-2">
                  <Badge className="bg-yellow-500 text-yellow-900">
                    +10 Points!
                  </Badge>
                  {shouldUseVoiceInstructions() && (
                    <p className="text-sm text-green-700 mt-2">🔊 Fantastic counting!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{currentNumberIndex + 1}/{hebrewNumbers.length}</span>
            </div>
            <Progress value={((currentNumberIndex + 1) / hebrewNumbers.length) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Number Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">Numbers Reference 📚</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {hebrewNumbers.slice(0, 6).map((num) => (
                <Card key={num.number} className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl mb-1">{num.image}</div>
                    <div className="text-xl font-bold text-gray-800">{num.number}</div>
                    <div className="text-sm text-gray-600" dir="rtl">{num.hebrew}</div>
                    <Button 
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        playNumberSound(num.hebrew, num.pronunciation, e);
                      }}
                    >
                      🔊 Listen
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderColoringStore = () => {
    return (
      <ColoringRedemption
        points={currentProfile.points}
        onRedeem={redeemColoringSheet}
        onDownload={downloadColoringSheet}
        redeemedSheets={currentProfile.redeemedSheets}
      />
    );
  };

  // Show profile creation screen if needed
  if (showProfileCreation) {
    return renderProfileCreation();
  }

  // Show profile selection screen if needed
  if (showProfileSelection) {
    return renderProfileSelection();
  }

  // Show loading if no profile
  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg font-semibold text-gray-800">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Hebrew Fun</h1>
            <p className="text-xs text-gray-600">{currentProfile.name}'s Adventure</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            🔥 {currentProfile.streak} days
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            ⭐ {currentProfile.points}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowProfileSelection(true)}
            className="p-2"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {currentGame === 'letter-match' && renderLetterMatchGame()}
        {currentGame === 'word-builder' && renderWordBuilderGame()}
        {currentGame === 'memory-game' && renderMemoryGame()}
        {currentGame === 'letter-tracing' && renderLetterTracingGame()}
        {currentGame === 'bubble-pop' && renderBubblePopGame()}
        {currentGame === 'story-time' && renderStoryTimeGame()}
        {currentGame === 'numbers-game' && renderNumbersGame()}
        {currentGame === 'coloring-store' && renderColoringStore()}

        {!currentGame && activeTab === 'home' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Welcome Back, {currentProfile.name}! 👋</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">Ready to learn Hebrew today?</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Level {currentProfile.level}</p>
                    <Progress value={(currentProfile.level % 5) * 20} className="w-32 h-2 bg-white/20" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{currentProfile.icon}</span>
                      <span className="text-lg font-semibold">Age {currentProfile.age}</span>
                    </div>
                    <p className="text-sm opacity-90">
                      {getAgeBasedDifficulty() === 'easy' ? '🎨 Visual Learning Mode' :
                       getAgeBasedDifficulty() === 'medium' ? '🧠 Balanced Learning Mode' :
                       '🚀 Challenge Mode'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-800">{currentProfile.streak}</p>
                  <p className="text-sm text-yellow-600">Day Streak</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-800">{currentProfile.points}</p>
                  <p className="text-sm text-green-600">Points</p>
                </CardContent>
              </Card>
            </div>

            {/* Games Section - More Prominent */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">🎮 Fun Learning Games!</CardTitle>
                <p className="text-lg opacity-90">Choose your adventure!</p>
              </CardHeader>
            </Card>

            {/* Games Grid */}
            <div className="grid grid-cols-2 gap-4">
              {games.map((game, index) => (
                <Card 
                  key={index} 
                  className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => setCurrentGame(game.key)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{game.icon}</div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{game.title}</h3>
                    <p className="text-xs text-gray-600 mb-3">{game.description}</p>
                    <div className="space-y-2">
                      <Progress value={game.progress} className="h-2" />
                      <span className="text-xs text-gray-600">{game.progress}% Complete</span>
                    </div>
                    {shouldUseVoiceInstructions() && (
                      <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800 text-xs">
                        🔊 Voice Instructions
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Today's Letters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">Today's Letters ✨</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {alphabetCards.slice(0, 4).map((card, index) => (
                    <Card key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{card.image}</div>
                        <div className="text-3xl font-bold text-gray-800 mb-1" dir="rtl">{card.letter}</div>
                        <div className="text-sm text-gray-600">{card.name}</div>
                        <div className="text-xs text-gray-500 mt-1">/{card.sound}/</div>
                        <Button 
                          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white w-full text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            playHebrewSound(card.letter, card.sound, e);
                          }}
                        >
                          🔊 Listen
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!currentGame && activeTab === 'learn' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Hebrew Alphabet 📚</CardTitle>
                <p className="text-sm text-gray-600">
                  {shouldUseVoiceInstructions() ? '🔊 Tap letters to hear pronunciation!' : 'Learn the Hebrew letters'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {alphabetCards.map((card, index) => (
                    <Card key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                      <CardContent className="p-6 text-center">
                        <div className="text-5xl mb-3">{card.image}</div>
                        <div className="text-4xl font-bold text-gray-800 mb-2">{card.letter}</div>
                        <div className="text-lg font-semibold text-gray-700 mb-1">{card.name}</div>
                        <div className="text-sm text-gray-600">/{card.sound}/</div>
                        <Button 
                          className="mt-3 bg-purple-500 hover:bg-purple-600 text-white w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            playHebrewSound(card.letter, card.sound);
                          }}
                        >
                          🔊 Listen
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!currentGame && activeTab === 'rewards' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{currentProfile.name}'s Achievements 🏆</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card key={index} className={`${achievement.earned ? 'bg-white/20 border-white/30' : 'bg-black/20 border-black/30'} backdrop-blur-sm`}>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <p className="text-sm font-semibold">{achievement.title}</p>
                        {achievement.earned && (
                          <Badge className="mt-2 bg-green-500">Earned!</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">Rewards Shop 🛍️</CardTitle>
                <p className="text-sm text-gray-600">You have {currentProfile.points} points to spend!</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎨</span>
                        <div>
                          <h3 className="font-bold text-gray-800">Colorful Background</h3>
                          <p className="text-sm text-gray-600">Unlock new themes</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={currentProfile.points >= 100 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        100 ⭐
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎵</span>
                        <div>
                          <h3 className="font-bold text-gray-800">Music Pack</h3>
                          <p className="text-sm text-gray-600">Fun learning songs</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={currentProfile.points >= 200 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        200 ⭐
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!currentGame && activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">{currentProfile.icon}</span>
                </div>
                <CardTitle className="text-xl font-bold">{currentProfile.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg mb-4">Level {currentProfile.level} Hebrew Explorer</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{currentProfile.streak}</p>
                    <p className="text-sm opacity-90">Day Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentProfile.points}</p>
                    <p className="text-sm opacity-90">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</p>
                    <p className="text-sm opacity-90">Badges</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => setShowProfileSelection(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    Switch Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">Learning Progress 📊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Letters Learned</span>
                    <span className="text-sm text-gray-600">8/22</span>
                  </div>
                  <Progress value={36} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Words Mastered</span>
                    <span className="text-sm text-gray-600">12/50</span>
                  </div>
                  <Progress value={24} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Games Completed</span>
                    <span className="text-sm text-gray-600">
                      {Object.values(currentProfile.gameProgress).reduce((a, b) => a + b, 0)}/700
                    </span>
                  </div>
                  <Progress value={Object.values(currentProfile.gameProgress).reduce((a, b) => a + b, 0) / 7} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">Profile Settings ⚙️</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Age: {currentProfile.age}</h3>
                    <p className="text-sm text-gray-600">Learning Mode: {getAgeBasedDifficulty()}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Voice Instructions</h3>
                    <p className="text-sm text-gray-600">
                      {shouldUseVoiceInstructions() ? 'Enabled for young learners' : 'Disabled'}
                    </p>
                  </div>
                  <Badge variant={shouldUseVoiceInstructions() ? "default" : "secondary"}>
                    {shouldUseVoiceInstructions() ? '🔊 On' : '🔇 Off'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      {!currentGame && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
          <div className="flex justify-around py-2">
            <Button
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4"
              onClick={() => setActiveTab('home')}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant={activeTab === 'learn' ? 'default' : 'ghost'}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4"
              onClick={() => setActiveTab('learn')}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Learn</span>
            </Button>
            <Button
              variant={activeTab === 'rewards' ? 'default' : 'ghost'}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4"
              onClick={() => setActiveTab('rewards')}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-xs">Rewards</span>
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4"
              onClick={() => setActiveTab('profile')}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}