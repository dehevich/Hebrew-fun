"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen,
  Brain,
  Palette,
  Award,
  Star,
  Volume2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  User,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Play,
  RefreshCcw,
  Lightbulb,
  Zap,
  Trophy,
  Coins,
  Gem,
  Heart,
  Square,
  Triangle,
  Circle,
  Sparkles,
  Hand,
  Fingerprint,
  Type,
  Puzzle,
  Shapes,
  Gamepad2,
  Home,
  Settings,
  LogOut,
  BarChart2,
  Calendar,
  Clock,
  Target,
  MessageSquare,
  Share2,
  Bell,
  Info,
  HelpCircle,
  Mail,
  Lock,
  Download,
  RotateCcw
} from 'lucide-react';
import { HapticButton } from '@/components/ui/haptic-button';
import { useHaptics } from '@/hooks/use-haptics';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileBackButton } from '@/hooks/use-mobile-back-button';
import { useTouchOptimization, preventBodyScroll } from '@/hooks/use-touch-optimization';
import { LevelUpAnimation } from '@/components/level-up-animation';
import { ColoringRedemption } from '@/components/coloring-redemption';
import ShapeRecognitionGame from '@/components/shape-recognition-game';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

// --- Data Structures ---

interface Profile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  points: number;
  achievements: string[];
  dailyStreak: number;
  lastLogin: string;
  redeemedColoringSheets: string[];
  gameProgress: { // Added gameProgress to store individual game states
    letterMatch?: number;
    wordBuilder?: number;
    memoryGame?: number;
    numberRecognition?: number;
    tracingGame?: number;
    fallingLetters?: { score: number; targetLetter: string };
    puzzleGame?: number;
    shapeRecognition?: { level: number; question: number };
  };
}

interface AlphabetCard {
  letter: string;
  name: string;
  sound: string;
  image: string;
  description: string;
  hebrew: string; // Added 'hebrew' property
}

interface Game {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  progress: number; // 0-100
  locked: boolean;
  cost?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  threshold: number;
  rewardPoints: number;
}

interface MemoryCard {
  id: number;
  hebrew: string;
  english: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface TracingLetter {
  letter: string;
  hebrew: string;
  path: string; // SVG path data for tracing
}

interface FallingLetter {
  id: number;
  letter: string;
  x: number;
  y: number;
  speed: number;
  hebrew: string;
}

interface PuzzlePiece {
  id: number;
  hebrew: string;
  english: string;
  emoji: string;
  position: number;
  correctPosition: number;
}

// --- Static Data ---

const alphabetCards: AlphabetCard[] = [
  { letter: 'א', name: 'Aleph', sound: 'a', image: '🍎', description: 'First letter, like "A" in Apple', hebrew: 'א' },
  { letter: 'ב', name: 'Bet', sound: 'b', image: '🏠', description: 'Like "B" in House (Bayit)', hebrew: 'ב' },
  { letter: 'ג', name: 'Gimel', sound: 'g', image: '🐪', description: 'Like "G" in Camel (Gamal)', hebrew: 'ג' },
  { letter: 'ד', name: 'Dalet', sound: 'd', image: '🚪', description: 'Like "D" in Door (Delet)', hebrew: 'ד' },
  { letter: 'ה', name: 'Heh', sound: 'h', image: '👋', description: 'Like "H" in Hello', hebrew: 'ה' },
  { letter: 'ו', name: 'Vav', sound: 'v', image: '🔗', description: 'Like "V" in Link (Vav)', hebrew: 'ו' },
  { letter: 'ז', name: 'Zayin', sound: 'z', image: '🫒', description: 'Like "Z" in Olive (Zayit)', hebrew: 'ז' },
  { letter: 'ח', name: 'Chet', sound: 'ch', image: '🍞', description: 'Like "Ch" in Bread (Lechem)', hebrew: 'ח' },
];

const words: { hebrew: string; english: string; emoji: string; letters: string[] }[] = [
  { hebrew: 'שלום', english: 'Hello', emoji: '👋', letters: ['ש', 'ל', 'ו', 'ם'] },
  { hebrew: 'אבא', english: 'Father', emoji: '👨', letters: ['א', 'ב', 'א'] },
  { hebrew: 'אמא', english: 'Mother', emoji: '👩', letters: ['א', 'מ', 'א'] },
  { hebrew: 'מים', english: 'Water', emoji: '💧', letters: ['מ', 'י', 'ם'] },
  { hebrew: 'שמש', english: 'Sun', emoji: '☀️', letters: ['ש', 'מ', 'ש'] },
  { hebrew: 'חתול', english: 'Cat', emoji: '🐱', letters: ['ח', 'ת', 'ו', 'ל'] },
  { hebrew: 'כלב', english: 'Dog', emoji: '🐶', letters: ['כ', 'ל', 'ב'] },
  { hebrew: 'ספר', english: 'Book', emoji: '📚', letters: ['ס', 'פ', 'ר'] },
];

const numbers: { hebrew: string; english: string; value: number; emoji: string }[] = [
  { hebrew: 'אחת', english: 'One', value: 1, emoji: '1️⃣' },
  { hebrew: 'שתיים', english: 'Two', value: 2, emoji: '2️⃣' },
  { hebrew: 'שלוש', english: 'Three', value: 3, emoji: '3️⃣' },
  { hebrew: 'ארבע', english: 'Four', value: 4, emoji: '4️⃣' },
  { hebrew: 'חמש', english: 'Five', value: 5, emoji: '5️⃣' },
];

const tracingLetters: TracingLetter[] = [
  { letter: 'א', hebrew: 'א', path: 'M 50 20 L 50 180 M 20 150 L 80 150' },
  { letter: 'ב', hebrew: 'ב', path: 'M 20 20 L 80 20 L 80 180 L 20 180 L 20 100' },
  { letter: 'ג', hebrew: 'ג', path: 'M 80 20 L 20 180 L 80 180' },
  { letter: 'ד', hebrew: 'ד', path: 'M 20 20 L 80 20 L 80 180' },
];

const achievements: Achievement[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete your first lesson', icon: BookOpen, threshold: 1, rewardPoints: 10 },
  { id: 'letter-master', name: 'Letter Master', description: 'Learn all Hebrew letters', icon: Type, threshold: alphabetCards.length, rewardPoints: 50 },
  { id: 'word-wizard', name: 'Word Wizard', description: 'Master 5 words', icon: Brain, threshold: 5, rewardPoints: 75 },
  { id: 'game-guru', name: 'Game Guru', description: 'Play 3 different games', icon: Gamepad2, threshold: 3, rewardPoints: 100 },
  { id: 'daily-learner', name: 'Daily Learner', description: 'Maintain a 7-day streak', icon: Calendar, threshold: 7, rewardPoints: 150 },
  { id: 'point-collector', name: 'Point Collector', description: 'Earn 500 points', icon: Coins, threshold: 500, rewardPoints: 200 },
];

const animalIcons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐒', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🕷️', '🦂', '🦀', '🐍', '🦎', '🦖', '🦕', '🐢', '🐠', '🐬', '🐳', '🦈', '🐙', '🐚', '🦐', '🦑', '🦞', '🐡', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🐈', '🐓', '🦃', '🕊️', '🐇', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲'];

// --- Main App Component ---

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [view, setView] = useState<'profile-select' | 'main-dashboard' | 'learning-path' | 'games' | 'achievements' | 'rewards' | 'settings' | 'letter-match' | 'word-builder' | 'memory-game' | 'number-recognition' | 'tracing-game' | 'falling-letters' | 'puzzle-game' | 'shape-recognition' | 'coloring-redemption' | 'coloring-game' | 'profile-creation' | 'edit-profile' | 'level-up-animation' >('profile-select');
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐶');
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; xpGained: number } | null>(null);

  // Game specific states (will be initialized from profile.gameProgress)
  const [letterMatchQuestion, setLetterMatchQuestion] = useState(0);
  const [wordBuilderWord, setWordBuilderWord] = useState(0);
  const [memoryGameLevel, setMemoryGameLevel] = useState(0);
  const [numberRecognitionQuestion, setNumberRecognitionQuestion] = useState(0);
  const [tracingGameLetter, setTracingGameLetter] = useState(0);
  const [fallingLettersGameActive, setFallingLettersGameActive] = useState(false);
  const [fallingLettersScore, setFallingLettersScore] = useState(0);
  const [fallingLettersCorrectLetter, setFallingLettersCorrectLetter] = useState('');
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [puzzleGameWord, setPuzzleGameWord] = useState(0);
  const [shapeRecognitionLevel, setShapeRecognitionLevel] = useState(0);
  const [shapeRecognitionQuestion, setShapeRecognitionQuestion] = useState(0);

  const { triggerHaptic } = useHaptics();
  const isMobile = useIsMobile();
  const appRef = useRef<HTMLDivElement>(null); // Ref for touch optimization

  // Touch optimization for swipe gestures
  useTouchOptimization(appRef, {
    onSwipeRight: () => {
      if (view === 'learning-path') setView('main-dashboard');
      if (view === 'games') setView('main-dashboard');
      if (view === 'achievements') setView('main-dashboard');
      if (view === 'rewards') setView('main-dashboard');
    },
    onSwipeLeft: () => {
      if (view === 'main-dashboard') setView('learning-path');
    },
  }, isMobile);

  // Mobile back button handling
  useMobileBackButton(() => {
    if (view === 'profile-creation' || view === 'edit-profile') {
      setView('profile-select');
    } else if (view === 'main-dashboard') {
      setView('profile-select');
    } else if (view === 'learning-path' || view === 'games' || view === 'achievements' || view === 'rewards' || view === 'settings') {
      setView('main-dashboard');
    } else if (view === 'letter-match' || view === 'word-builder' || view === 'memory-game' || view === 'number-recognition' || view === 'tracing-game' || view === 'falling-letters' || view === 'puzzle-game' || view === 'shape-recognition' || view === 'coloring-redemption') {
      setView('games');
    } else if (view === 'coloring-game') {
      setView('coloring-redemption');
    }
  }, view !== 'profile-select'); // Only enable if not on profile select screen

  useEffect(() => {
    const storedProfiles = localStorage.getItem('hebrew_learning_profiles');
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    }
  }, []);

  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('hebrew_learning_profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  useEffect(() => {
    // When currentProfile changes, initialize game states
    if (currentProfile) {
      setLetterMatchQuestion(currentProfile.gameProgress.letterMatch || 0);
      setWordBuilderWord(currentProfile.gameProgress.wordBuilder || 0);
      setMemoryGameLevel(currentProfile.gameProgress.memoryGame || 0);
      setNumberRecognitionQuestion(currentProfile.gameProgress.numberRecognition || 0);
      setTracingGameLetter(currentProfile.gameProgress.tracingGame || 0);
      setFallingLettersScore(currentProfile.gameProgress.fallingLetters?.score || 0);
      setFallingLettersCorrectLetter(currentProfile.gameProgress.fallingLetters?.targetLetter || '');
      setPuzzleGameWord(currentProfile.gameProgress.puzzleGame || 0);
      setShapeRecognitionLevel(currentProfile.gameProgress.shapeRecognition?.level || 0);
      setShapeRecognitionQuestion(currentProfile.gameProgress.shapeRecognition?.question || 0);
    }
  }, [currentProfile]);


  useEffect(() => {
    // Prevent body scroll when a game is active
    const isGameActive = ['letter-match', 'word-builder', 'memory-game', 'number-recognition', 'tracing-game', 'falling-letters', 'puzzle-game', 'shape-recognition', 'coloring-game'].includes(view);
    preventBodyScroll(isGameActive);
  }, [view]);

  const playHebrewSound = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL'; // Hebrew (Israel)
      utterance.rate = 0.8; // Slightly slower for kids
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech not supported",
        description: "Your browser does not support speech synthesis.",
        variant: "destructive",
      });
    }
  };

  const addXp = (xp: number) => {
    if (!currentProfile) return;

    const newXp = currentProfile.xp + xp;
    const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level

    const updatedProfile = {
      ...currentProfile,
      xp: newXp,
      level: newLevel,
      points: currentProfile.points + xp, // Earn points equal to XP
    };

    if (newLevel > currentProfile.level) {
      setLevelUpData({ level: newLevel, xpGained: xp });
    }

    updateProfile(updatedProfile);
  };

  const updateProfile = (updatedProfile: Profile) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(p => (p.id === updatedProfile.id ? updatedProfile : p))
    );
    setCurrentProfile(updatedProfile);
  };

  const checkAchievements = useCallback((profile: Profile) => {
    let updatedProfile = { ...profile };
    let pointsEarned = 0;

    achievements.forEach(achievement => {
      if (!updatedProfile.achievements.includes(achievement.id)) {
        let conditionMet = false;
        switch (achievement.id) {
          case 'first-steps':
            // This achievement is typically triggered by completing the first lesson/game
            // For now, let's assume it's met if XP > 0
            if (updatedProfile.xp > 0) conditionMet = true;
            break;
          case 'letter-master':
            // This would require tracking learned letters, for now, use level
            if (updatedProfile.level >= 3) conditionMet = true;
            break;
          case 'word-wizard':
            // This would require tracking mastered words, for now, use level
            if (updatedProfile.level >= 5) conditionMet = true;
            break;
          case 'game-guru':
            // This would require tracking games played, for now, use level
            if (updatedProfile.level >= 7) conditionMet = true;
            break;
          case 'daily-learner':
            // This requires daily streak logic
            if (updatedProfile.dailyStreak >= achievement.threshold) conditionMet = true;
            break;
          case 'point-collector':
            if (updatedProfile.points >= achievement.threshold) conditionMet = true;
            break;
        }

        if (conditionMet) {
          updatedProfile.achievements.push(achievement.id);
          updatedProfile.points += achievement.rewardPoints;
          pointsEarned += achievement.rewardPoints;
          toast({
            title: "Achievement Unlocked!",
            description: `${achievement.name}: ${achievement.description} (+${achievement.rewardPoints} points)`,
            variant: "default",
          });
        }
      }
    });

    if (pointsEarned > 0) {
      updateProfile(updatedProfile);
    }
  }, [updateProfile]);

  useEffect(() => {
    if (currentProfile) {
      checkAchievements(currentProfile);
    }
  }, [currentProfile, checkAchievements]);

  // --- Profile Management ---

  const handleSelectProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    setView('main-dashboard');
  };

  const createProfile = () => {
    if (newProfileName.trim() === '') {
      toast({
        title: "Name required",
        description: "Please enter a name for your profile.",
        variant: "destructive",
      });
      return;
    }
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name: newProfileName.trim(),
      avatar: selectedAvatar,
      level: 1,
      xp: 0,
      points: 0,
      achievements: [],
      dailyStreak: 0,
      lastLogin: new Date().toISOString().split('T')[0],
      redeemedColoringSheets: [],
      gameProgress: {}, // Initialize empty game progress
    };
    setProfiles(prev => [...prev, newProfile]);
    setCurrentProfile(newProfile);
    setView('main-dashboard');
    setNewProfileName('');
    setSelectedAvatar('🐶');
    toast({
      title: "Profile Created!",
      description: `Welcome, ${newProfile.name}!`,
      variant: "success",
    });
  };

  const startEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setNewProfileName(profile.name);
    setSelectedAvatar(profile.avatar);
    setView('edit-profile');
  };

  const saveEditedProfile = () => {
    if (!editingProfile) return;
    if (newProfileName.trim() === '') {
      toast({
        title: "Name required",
        description: "Please enter a name for your profile.",
        variant: "destructive",
      });
      return;
    }

    const updatedProfile = {
      ...editingProfile,
      name: newProfileName.trim(),
      avatar: selectedAvatar,
    };

    updateProfile(updatedProfile);
    setEditingProfile(null);
    setNewProfileName('');
    setSelectedAvatar('🐶');
    setView('main-dashboard');
    toast({
      title: "Profile Updated!",
      description: `Your profile has been updated.`,
      variant: "success",
    });
  };

  const deleteProfile = (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      if (currentProfile?.id === profileId) {
        setCurrentProfile(null);
        setView('profile-select');
      }
      toast({
        title: "Profile Deleted",
        description: "The profile has been removed.",
        variant: "default",
      });
    }
  };

  // --- Game Logic ---

  // Letter Match Game
  const handleLetterMatchAnswer = (selectedLetter: string) => {
    if (!currentProfile) return;
    const currentCard = alphabetCards[letterMatchQuestion];
    if (selectedLetter === currentCard.letter) {
      addXp(10);
      const nextQuestion = letterMatchQuestion + 1;
      const isGameComplete = nextQuestion >= alphabetCards.length;

      updateProfile({
        ...currentProfile,
        gameProgress: {
          ...currentProfile.gameProgress,
          letterMatch: isGameComplete ? 0 : nextQuestion, // Reset or advance
        },
      });

      toast({
        title: "Correct!",
        description: `You matched ${currentCard.hebrew}!`,
        variant: "success",
      });

      if (isGameComplete) {
        toast({
          title: "Game Complete!",
          description: "You've mastered all the letters!",
          variant: "default",
        });
        setView('games');
      } else {
        setLetterMatchQuestion(nextQuestion);
      }
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
        variant: "destructive",
      });
    }
  };

  // Word Builder Game
  const [builtWordLetters, setBuiltWordLetters] = useState<string[]>([]);
  const [wordBuilderOptions, setWordBuilderOptions] = useState<string[]>([]);
  const [wordBuilderFeedback, setWordBuilderFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (view === 'word-builder') {
      const initialWordIndex = currentProfile?.gameProgress.wordBuilder || 0;
      setWordBuilderWord(initialWordIndex);
      if (words[initialWordIndex]) {
        const targetWord = words[initialWordIndex];
        setBuiltWordLetters([]);
        // Shuffle letters of the target word and add some random letters
        const allLetters = [...new Set([...targetWord.letters, ...alphabetCards.map(c => c.letter)])];
        const shuffledOptions = allLetters.sort(() => Math.random() - 0.5).slice(0, 8); // Max 8 options
        setWordBuilderOptions(shuffledOptions);
        setWordBuilderFeedback(null);
      }
    }
  }, [view, currentProfile]); // Depend on currentProfile to load initial state

  const handleAddLetterToWord = (letter: string) => {
    setBuiltWordLetters(prev => [...prev, letter]);
  };

  const handleRemoveLastLetter = () => {
    setBuiltWordLetters(prev => prev.slice(0, -1));
  };

  const checkBuiltWord = () => {
    if (!currentProfile) return;
    const targetWord = words[wordBuilderWord];
    const builtWord = builtWordLetters.join('');

    if (builtWord === targetWord.hebrew) {
      addXp(15);
      setWordBuilderFeedback('correct');
      toast({
        title: "Correct!",
        description: `You built "${targetWord.hebrew}"!`,
        variant: "success",
      });
      setTimeout(() => {
        const nextWordIndex = wordBuilderWord + 1;
        const isGameComplete = nextWordIndex >= words.length;

        updateProfile({
          ...currentProfile,
          gameProgress: {
            ...currentProfile.gameProgress,
            wordBuilder: isGameComplete ? 0 : nextWordIndex, // Reset or advance
          },
        });

        if (isGameComplete) {
          toast({
            title: "Game Complete!",
            description: "You've mastered all the words!",
            variant: "default",
          });
          setView('games');
        } else {
          setWordBuilderWord(nextWordIndex);
        }
      }, 1500);
    } else {
      setWordBuilderFeedback('incorrect');
      toast({
        title: "Incorrect",
        description: "That's not the word. Try again!",
        variant: "destructive",
      });
      setTimeout(() => {
        setWordBuilderFeedback(null);
        setBuiltWordLetters([]);
      }, 1500);
    }
  };

  // Memory Game
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]); // Stores IDs of flipped cards
  const [matchedPairs, setMatchedPairs] = useState(0);

  useEffect(() => {
    if (view === 'memory-game') {
      const initialLevel = currentProfile?.gameProgress.memoryGame || 0;
      setMemoryGameLevel(initialLevel);
      initializeMemoryGame(initialLevel);
    }
  }, [view, currentProfile]); // Depend on currentProfile to load initial state

  const initializeMemoryGame = (level: number) => {
    const numPairs = Math.min(4 + level, words.length); // Increase pairs with level
    const selectedWords = words.slice(0, numPairs);
    let cards: MemoryCard[] = [];

    selectedWords.forEach((word, index) => {
      cards.push({ id: index * 2, hebrew: word.hebrew, english: word.english, emoji: word.emoji, isFlipped: false, isMatched: false });
      cards.push({ id: index * 2 + 1, hebrew: word.hebrew, english: word.english, emoji: word.emoji, isFlipped: false, isMatched: false });
    });

    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs(0);
  };

  const handleCardClick = (clickedCard: MemoryCard) => {
    if (flippedCards.length === 2 || clickedCard.isFlipped || clickedCard.isMatched) {
      return;
    }

    const newFlippedCards = [...flippedCards, clickedCard.id];
    setFlippedCards(newFlippedCards);

    setMemoryCards(prev =>
      prev.map(card =>
        card.id === clickedCard.id ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      const card1 = memoryCards.find(card => card.id === newFlippedCards[0]);
      const card2 = memoryCards.find(card => card.id === newFlippedCards[1]);

      if (!card1 || !card2) return; // Add null checks here

      if (card1.hebrew === card2.hebrew) {
        // Match found
        addXp(20);
        setMatchedPairs(prev => prev + 1);
        setMemoryCards(prev =>
          prev.map(card =>
            card.id === card1.id || card.id === card2.id
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedCards([]); // Clear flipped cards for next turn
        toast({
          title: "Match!",
          description: `You found a pair for "${card1.hebrew}"!`,
          variant: "success",
        });
      } else {
        // No match, flip back after a delay
        toast({
          title: "No Match",
          description: "Try again!",
          variant: "destructive",
        });
        setTimeout(() => {
          setMemoryCards(prev =>
            prev.map(card =>
              card.id === card1.id || card.id === card2.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (matchedPairs > 0 && matchedPairs === memoryCards.length / 2) {
      toast({
        title: "Memory Game Complete!",
        description: "You've matched all the pairs!",
        variant: "default",
      });
      setTimeout(() => {
        const nextLevel = memoryGameLevel + 1;
        const isGameComplete = nextLevel > 2; // Max 3 levels for now

        updateProfile({
          ...currentProfile!,
          gameProgress: {
            ...currentProfile!.gameProgress,
            memoryGame: isGameComplete ? 0 : nextLevel, // Reset or advance
          },
        });

        if (isGameComplete) {
          setView('games');
        } else {
          setMemoryGameLevel(nextLevel);
          initializeMemoryGame(nextLevel); // Start next level
        }
      }, 1500);
    }
  }, [matchedPairs, memoryCards.length, memoryGameLevel, currentProfile]);

  // Number Recognition Game
  const [numberRecognitionFeedback, setNumberRecognitionFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [numbersOptions, setNumbersOptions] = useState<number[]>([]);

  useEffect(() => {
    if (view === 'number-recognition') {
      const initialQuestion = currentProfile?.gameProgress.numberRecognition || 0;
      setNumberRecognitionQuestion(initialQuestion);
      if (numbers[initialQuestion]) {
        const targetNumber = numbers[initialQuestion];
        const options = [targetNumber.value];
        while (options.length < 4) {
          const randomNum = Math.floor(Math.random() * 5) + 1; // Numbers 1-5
          if (!options.includes(randomNum)) {
            options.push(randomNum);
          }
        }
        setNumbersOptions(options.sort(() => Math.random() - 0.5));
        setNumberRecognitionFeedback(null);
      }
    }
  }, [view, currentProfile]); // Depend on currentProfile to load initial state

  const handleNumberSelect = (selectedNum: number) => {
    if (!currentProfile || numberRecognitionFeedback) return;
    const currentNumber = numbers[numberRecognitionQuestion];

    if (selectedNum === currentNumber.value) {
      addXp(10);
      setNumberRecognitionFeedback('correct');
      toast({
        title: "Correct!",
        description: `That's "${currentNumber.hebrew}"!`,
        variant: "success",
      });
      setTimeout(() => {
        const nextQuestion = numberRecognitionQuestion + 1;
        const isGameComplete = nextQuestion >= numbers.length;

        updateProfile({
          ...currentProfile,
          gameProgress: {
            ...currentProfile.gameProgress,
            numberRecognition: isGameComplete ? 0 : nextQuestion, // Reset or advance
          },
        });

        if (isGameComplete) {
          toast({
            title: "Game Complete!",
            description: "You've mastered number recognition!",
            variant: "default",
          });
          setView('games');
        } else {
          setNumberRecognitionQuestion(nextQuestion);
        }
      }, 1500);
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
        variant: "destructive",
      });
      setTimeout(() => {
        setNumberRecognitionFeedback(null);
      }, 1500);
    }
  };

  // Tracing Game
  const tracingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracingDrawing, setIsTracingDrawing] = useState(false);
  const [tracingPathProgress, setTracingPathProgress] = useState(0); // 0-100
  const [tracingFeedback, setTracingFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (view === 'tracing-game') {
      const initialLetter = currentProfile?.gameProgress.tracingGame || 0;
      setTracingGameLetter(initialLetter);
      if (tracingLetters[initialLetter]) {
        const canvas = tracingCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the letter outline
        const currentLetter = tracingLetters[initialLetter];
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const path = new Path2D(currentLetter.path);
        ctx.stroke(path);

        setTracingPathProgress(0);
        setTracingFeedback(null);
      }
    }
  }, [view, currentProfile]); // Depend on currentProfile to load initial state

  const getTracingCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = tracingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  const startTracing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const canvas = tracingCanvasRef.current;
    if (!canvas) return;

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y } = getTracingCanvasCoordinates(clientX, clientY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#6366f1'; // Purple color for tracing
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsTracingDrawing(true);
  };

  const trace = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isTracingDrawing) return;
    e.preventDefault();
    e.stopPropagation();

    const canvas = tracingCanvasRef.current;
    if (!canvas) return;

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y } = getTracingCanvasCoordinates(clientX, clientY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();

    // Simple progress calculation (can be improved with actual path matching)
    setTracingPathProgress(prev => Math.min(prev + 0.5, 100));
  };

  const stopTracing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsTracingDrawing(false);
  };

  const checkTracing = () => {
    if (!currentProfile) return;
    if (tracingPathProgress >= 90) { // Consider 90% as complete
      addXp(15);
      setTracingFeedback('correct');
      toast({
        title: "Great Tracing!",
        description: `You traced "${tracingLetters[tracingGameLetter].hebrew}"!`,
        variant: "success",
      });
      setTimeout(() => {
        const nextLetter = tracingGameLetter + 1;
        const isGameComplete = nextLetter >= tracingLetters.length;

        updateProfile({
          ...currentProfile,
          gameProgress: {
            ...currentProfile.gameProgress,
            tracingGame: isGameComplete ? 0 : nextLetter, // Reset or advance
          },
        });

        if (isGameComplete) {
          toast({
            title: "Game Complete!",
            description: "You've mastered tracing all letters!",
            variant: "default",
          });
          setView('games');
        } else {
          setTracingGameLetter(nextLetter);
        }
      }, 1500);
    } else {
      setTracingFeedback('incorrect');
      toast({
        title: "Keep Tracing!",
        description: "You need to trace more of the letter.",
        variant: "destructive",
      });
      setTimeout(() => {
        setTracingFeedback(null);
        // Optionally clear canvas and redraw outline for retry
        const canvas = tracingCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const currentLetter = tracingLetters[tracingGameLetter];
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 5;
            const path = new Path2D(currentLetter.path);
            ctx.stroke(path);
          }
        }
        setTracingPathProgress(0);
      }, 1500);
    }
  };

  // Falling Letters Game
  useEffect(() => {
    if (view === 'falling-letters') {
      const initialScore = currentProfile?.gameProgress.fallingLetters?.score || 0;
      const initialTargetLetter = currentProfile?.gameProgress.fallingLetters?.targetLetter || '';
      setFallingLettersScore(initialScore);
      setFallingLettersCorrectLetter(initialTargetLetter);
      // If game was active, resume it
      if (initialTargetLetter) {
        setFallingLettersGameActive(true);
      }
    }
  }, [view, currentProfile]);

  useEffect(() => {
    if (fallingLettersGameActive) {
      const interval = setInterval(() => {
        setFallingLetters(prev => {
          const newLetters = prev.map(letter => ({
            ...letter,
            y: letter.y + letter.speed,
          })).filter(letter => letter.y < window.innerHeight); // Remove letters that fall off screen

          // Add new letter if needed
          if (newLetters.length < 5) { // Keep max 5 letters on screen
            const randomLetter = alphabetCards[Math.floor(Math.random() * alphabetCards.length)];
            newLetters.push({
              id: Date.now() + Math.random(),
              letter: randomLetter.letter,
              hebrew: randomLetter.hebrew,
              x: Math.random() * (window.innerWidth - 100) + 50,
              y: -50, // Start above screen
              speed: Math.random() * 2 + 1, // Random speed
            });
          }
          return newLetters;
        });
      }, 50); // Update every 50ms

      return () => clearInterval(interval);
    }
  }, [fallingLettersGameActive, view]);

  const startGame = () => {
    setFallingLettersGameActive(true);
    setFallingLettersScore(0);
    setFallingLetters([]);
    pickNewFallingLetterTarget();
  };

  const pickNewFallingLetterTarget = () => {
    const target = alphabetCards[Math.floor(Math.random() * alphabetCards.length)];
    setFallingLettersCorrectLetter(target.letter);
    playHebrewSound(target.hebrew);

    // Update profile progress
    updateProfile({
      ...currentProfile!,
      gameProgress: {
        ...currentProfile!.gameProgress,
        fallingLetters: { score: fallingLettersScore, targetLetter: target.letter },
      },
    });
  };

  const handleFallingLetterClick = (clickedLetter: FallingLetter) => {
    if (!currentProfile || !fallingLettersGameActive) return;

    if (clickedLetter.letter === fallingLettersCorrectLetter) {
      addXp(5);
      const newScore = fallingLettersScore + 1;
      setFallingLettersScore(newScore);
      setFallingLetters(prev => prev.filter(l => l.id !== clickedLetter.id)); // Remove clicked letter
      pickNewFallingLetterTarget(); // Pick new target immediately

      toast({
        title: "Good Catch!",
        description: `You caught the ${clickedLetter.hebrew}!`,
        variant: "success",
      });
    } else {
      toast({
        title: "Oops!",
        description: "That's not the letter we're looking for.",
        variant: "destructive",
      });
    }
  };

  // Puzzle Game
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [puzzleFeedback, setPuzzleFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (view === 'puzzle-game') {
      const initialWordIndex = currentProfile?.gameProgress.puzzleGame || 0;
      setPuzzleGameWord(initialWordIndex);
      if (words[initialWordIndex]) {
        initializePuzzleGame(initialWordIndex);
      }
    }
  }, [view, currentProfile]); // Depend on currentProfile to load initial state

  const initializePuzzleGame = (wordIndex: number) => {
    const targetWord = words[wordIndex];
    const pieces: PuzzlePiece[] = targetWord.letters.map((letter, index) => ({
      id: index,
      hebrew: letter,
      english: alphabetCards.find(a => a.letter === letter)?.name || '',
      emoji: alphabetCards.find(a => a.letter === letter)?.image || '',
      position: index, // Initial position (will be shuffled)
      correctPosition: index,
    }));

    setPuzzlePieces(pieces.sort(() => Math.random() - 0.5).map((p, i) => ({ ...p, position: i })));
    setPuzzleFeedback(null);
  };

  const movePuzzlePiece = (fromIndex: number, toIndex: number) => {
    const newPieces = [...puzzlePieces];
    const [movedPiece] = newPieces.splice(fromIndex, 1);
    newPieces.splice(toIndex, 0, movedPiece);
    setPuzzlePieces(newPieces.map((p, i) => ({ ...p, position: i }))); // Update positions
  };

  const checkWord = () => {
    if (!currentProfile) return;
    const isCorrect = puzzlePieces.every((piece, index) => piece.correctPosition === index);

    if (isCorrect) {
      addXp(20);
      setPuzzleFeedback('correct');
      toast({
        title: "Puzzle Solved!",
        description: `You built "${words[puzzleGameWord].hebrew}"!`,
        variant: "success",
      });
      setTimeout(() => {
        const nextWordIndex = puzzleGameWord + 1;
        const isGameComplete = nextWordIndex >= words.length;

        updateProfile({
          ...currentProfile,
          gameProgress: {
            ...currentProfile.gameProgress,
            puzzleGame: isGameComplete ? 0 : nextWordIndex, // Reset or advance
          },
        });

        if (isGameComplete) {
          toast({
            title: "Game Complete!",
            description: "You've solved all the word puzzles!",
            variant: "default",
          });
          setView('games');
        } else {
          setPuzzleGameWord(nextWordIndex);
          initializePuzzleGame(nextWordIndex); // Load next puzzle
        }
      }, 1500);
    } else {
      setPuzzleFeedback('incorrect');
      toast({
        title: "Not quite!",
        description: "The letters are not in the correct order. Keep trying!",
        variant: "destructive",
      });
      setTimeout(() => {
        setPuzzleFeedback(null);
      }, 1500);
    }
  };

  // Coloring Redemption
  const handleRedeemColoringSheet = (sheetId: string, cost: number) => {
    if (!currentProfile) return;
    if (currentProfile.points >= cost) {
      const updatedProfile = {
        ...currentProfile,
        points: currentProfile.points - cost,
        redeemedColoringSheets: [...currentProfile.redeemedColoringSheets, sheetId],
      };
      updateProfile(updatedProfile);
      toast({
        title: "Sheet Unlocked!",
        description: "You can now color and download this sheet!",
        variant: "success",
      });
    } else {
      toast({
        title: "Not Enough Points",
        description: "You need more points to unlock this sheet.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadColoringSheet = (sheetId: string) => {
    // This would typically trigger a download from the ColoringSheetGenerator
    // For now, it's a placeholder. The ColoringGame component will handle the actual download.
    toast({
      title: "Download Initiated",
      description: "Your coloring sheet is being prepared for download.",
      variant: "default",
    });
  };

  // --- Render Logic ---

  const renderContent = () => {
    switch (view) {
      case 'profile-select':
        return (
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 safe-area-inset">
            <Card className="w-full max-w-md p-6 text-center shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-indigo-700 mb-4">
                  Welcome to Hebrew Fun!
                </CardTitle>
                <p className="text-gray-600 mb-6">Choose your profile or create a new one to start learning.</p>
              </CardHeader>
              <CardContent>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Profile</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {profiles.map(profile => (
                    <HapticButton
                      key={profile.id}
                      variant="outline"
                      onClick={() => handleSelectProfile(profile)}
                      className="flex flex-col items-center justify-center p-4 h-32 border-2 border-indigo-300 hover:border-indigo-500 transition-all duration-200"
                      hapticType="light"
                    >
                      <Avatar className="w-16 h-16 mb-2">
                        <AvatarImage src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profile.avatar}`} alt={profile.name} />
                        <AvatarFallback>{profile.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-lg text-gray-800">{profile.name}</span>
                      <span className="text-sm text-gray-500">Level {profile.level}</span>
                    </HapticButton>
                  ))}
                </div>
                <HapticButton
                  onClick={() => setView('profile-creation')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold"
                  hapticType="success"
                >
                  <Plus className="w-5 h-5 mr-2" /> Create New Profile
                </HapticButton>
              </CardContent>
            </Card>
          </div>
        );

      case 'profile-creation':
        return (
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 safe-area-inset">
            <Card className="w-full max-w-md p-6 text-center shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-indigo-700 mb-4">Create New Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter your name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="mb-4 text-center text-lg py-6"
                />
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Choose your avatar:</h3>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {animalIcons.map((icon, index) => (
                    <HapticButton
                      key={index}
                      variant={selectedAvatar === icon ? "default" : "outline"}
                      className={`p-2 h-20 w-20 flex items-center justify-center text-4xl ${selectedAvatar === icon ? 'border-indigo-500 ring-2 ring-indigo-500' : ''}`}
                      onClick={() => setSelectedAvatar(icon)}
                      hapticType="light"
                    >
                      {icon}
                    </HapticButton>
                  ))}
                </div>
                <div className="space-y-3 safe-area-bottom">
                  <HapticButton
                    onClick={createProfile}
                    disabled={newProfileName.trim() === ''}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                    hapticType="success"
                  >
                    Start Learning!
                  </HapticButton>
                  {profiles.length > 0 && (
                    <HapticButton
                      variant="outline"
                      onClick={() => setView('profile-select')}
                      className="w-full py-3 text-lg font-semibold"
                      hapticType="light"
                    >
                      ← Back to Profiles
                    </HapticButton>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'edit-profile':
        if (!editingProfile) return null;
        return (
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 safe-area-inset">
            <Card className="w-full max-w-md p-6 text-center shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-indigo-700 mb-4">Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter your name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="mb-4 text-center text-lg py-6"
                />
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Change avatar:</h3>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {animalIcons.map((icon, index) => (
                    <HapticButton
                      key={index}
                      variant={selectedAvatar === icon ? "default" : "outline"}
                      className={`p-2 h-20 w-20 flex items-center justify-center text-4xl ${selectedAvatar === icon ? 'border-indigo-500 ring-2 ring-indigo-500' : ''}`}
                      onClick={() => setSelectedAvatar(icon)}
                      hapticType="light"
                    >
                      {icon}
                    </HapticButton>
                  ))}
                </div>
                <div className="space-y-3 pt-4 safe-area-bottom">
                  <HapticButton
                    onClick={saveEditedProfile}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                    hapticType="success"
                  >
                    Save Changes
                  </HapticButton>
                  <HapticButton
                    variant="outline"
                    onClick={() => {
                      setView('main-dashboard');
                      setEditingProfile(null);
                      setNewProfileName('');
                      setSelectedAvatar('🐶');
                    }}
                    className="w-full py-3 text-lg font-semibold"
                    hapticType="light"
                  >
                    Cancel
                  </HapticButton>
                  <HapticButton
                    variant="destructive"
                    onClick={() => deleteProfile(editingProfile.id)}
                    className="w-full py-3 text-lg font-semibold"
                    hapticType="heavy"
                  >
                    <Trash2 className="w-5 h-5 mr-2" /> Delete Profile
                  </HapticButton>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'main-dashboard':
        if (!currentProfile) return null;
        return (
          <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 safe-area-inset" ref={appRef}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('profile-select')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${currentProfile.avatar}`} alt={currentProfile.name} />
                  <AvatarFallback>{currentProfile.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{currentProfile.name}</h1>
                  <p className="text-sm text-gray-600">Level {currentProfile.level} • XP: {currentProfile.xp}</p>
                </div>
                <HapticButton
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditProfile(currentProfile)}
                  className="ml-2"
                  hapticType="light"
                >
                  <Edit className="w-5 h-5 text-gray-600" />
                </HapticButton>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-bold text-gray-800">{currentProfile.points}</span>
              </div>
            </div>

            {/* Main Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => setView('learning-path')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Learning Path</CardTitle>
                  <BookOpen className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Start your journey</div>
                  <p className="text-xs text-blue-100">Letters, words, and phrases</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => setView('games')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Play Games</CardTitle>
                  <Gamepad2 className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Fun & interactive</div>
                  <p className="text-xs text-green-100">Practice with exciting games</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => setView('achievements')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Achievements</CardTitle>
                  <Award className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentProfile.achievements.length} Unlocked</div>
                  <p className="text-xs text-yellow-100">Earn badges and points</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => setView('rewards')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Rewards Store</CardTitle>
                  <Coins className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentProfile.points} Points</div>
                  <p className="text-xs text-red-100">Unlock new content</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-gray-500 to-gray-700 text-white cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => setView('settings')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Settings</CardTitle>
                  <Settings className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Customize your app</div>
                  <p className="text-xs text-gray-100">Audio, notifications & more</p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Streak */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Daily Streak</CardTitle>
                <Calendar className="h-6 w-6 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{currentProfile.dailyStreak} Days 🔥</div>
                <Progress value={(currentProfile.dailyStreak / 7) * 100} className="h-2 mt-2" />
                <p className="text-xs text-gray-500 mt-1">Keep learning every day to extend your streak!</p>
              </CardContent>
            </Card>

            {/* Recent Activity / Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <HapticButton variant="outline" onClick={() => setView('letter-match')} hapticType="light">
                  <Type className="w-4 h-4 mr-2" /> Letter Match
                </HapticButton>
                <HapticButton variant="outline" onClick={() => setView('word-builder')} hapticType="light">
                  <Lightbulb className="w-4 h-4 mr-2" /> Word Builder
                </HapticButton>
                <HapticButton variant="outline" onClick={() => setView('memory-game')} hapticType="light">
                  <Brain className="w-4 h-4 mr-2" /> Memory Game
                </HapticButton>
                <HapticButton variant="outline" onClick={() => setView('number-recognition')} hapticType="light">
                  <Zap className="w-4 h-4 mr-2" /> Number Recognition
                </HapticButton>
              </CardContent>
            </Card>
          </div>
        );

      case 'learning-path':
        if (!currentProfile) return null;
        return (
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('main-dashboard')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Learning Path 📚</h1>
              <div className="w-10" />
            </div>

            <div className="space-y-6">
              {/* Letters Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Type className="w-6 h-6" /> Hebrew Letters
                  </CardTitle>
                  <p className="text-gray-600">Learn the basics of the Hebrew alphabet.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {alphabetCards.map((card, index) => (
                      <Card key={index} className="flex flex-col items-center justify-center p-3 text-center">
                        <div className="text-4xl mb-1">{card.letter}</div>
                        <div className="font-semibold text-gray-800">{card.name}</div>
                        <div className="text-sm text-gray-500">{card.image}</div>
                        <HapticButton
                          variant="ghost"
                          size="icon"
                          onClick={() => playHebrewSound(card.hebrew)}
                          className="mt-2"
                          hapticType="light"
                        >
                          <Volume2 className="w-5 h-5" />
                        </HapticButton>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Words Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Lightbulb className="w-6 h-6" /> Common Words
                  </CardTitle>
                  <p className="text-gray-600">Expand your vocabulary with everyday Hebrew words.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {words.map((word, index) => (
                      <Card key={index} className="flex flex-col items-center justify-center p-3 text-center">
                        <div className="text-4xl mb-1">{word.emoji}</div>
                        <div className="font-semibold text-gray-800">{word.hebrew}</div>
                        <div className="text-sm text-gray-500">{word.english}</div>
                        <HapticButton
                          variant="ghost"
                          size="icon"
                          onClick={() => playHebrewSound(word.hebrew)}
                          className="mt-2"
                          hapticType="light"
                        >
                          <Volume2 className="w-5 h-5" />
                        </HapticButton>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Numbers Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="w-6 h-6" /> Numbers
                  </CardTitle>
                  <p className="text-gray-600">Learn to count in Hebrew.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {numbers.map((num, index) => (
                      <Card key={index} className="flex flex-col items-center justify-center p-3 text-center">
                        <div className="text-4xl mb-1">{num.emoji}</div>
                        <div className="font-semibold text-gray-800">{num.hebrew}</div>
                        <div className="text-sm text-gray-500">{num.english}</div>
                        <HapticButton
                          variant="ghost"
                          size="icon"
                          onClick={() => playHebrewSound(num.hebrew)}
                          className="mt-2"
                          hapticType="light"
                        >
                          <Volume2 className="w-5 h-5" />
                        </HapticButton>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'games':
        if (!currentProfile) return null;
        const availableGames: Game[] = [
          { id: 'letter-match', title: 'Letter Match', icon: Type, description: 'Match Hebrew letters to their sounds.', progress: currentProfile.gameProgress.letterMatch !== undefined ? (currentProfile.gameProgress.letterMatch / alphabetCards.length) * 100 : 0, locked: false },
          { id: 'word-builder', title: 'Word Builder', icon: Lightbulb, description: 'Build Hebrew words letter by letter.', progress: currentProfile.gameProgress.wordBuilder !== undefined ? (currentProfile.gameProgress.wordBuilder / words.length) * 100 : 0, locked: false },
          { id: 'memory-game', title: 'Memory Game', icon: Brain, description: 'Find matching pairs of Hebrew words.', progress: currentProfile.gameProgress.memoryGame !== undefined ? (currentProfile.gameProgress.memoryGame / 3) * 100 : 0, locked: false }, // Assuming 3 levels
          { id: 'number-recognition', title: 'Number Recognition', icon: Zap, description: 'Identify Hebrew numbers.', progress: currentProfile.gameProgress.numberRecognition !== undefined ? (currentProfile.gameProgress.numberRecognition / numbers.length) * 100 : 0, locked: false },
          { id: 'tracing-game', title: 'Letter Tracing', icon: Fingerprint, description: 'Practice writing Hebrew letters.', progress: currentProfile.gameProgress.tracingGame !== undefined ? (currentProfile.gameProgress.tracingGame / tracingLetters.length) * 100 : 0, locked: false },
          { id: 'falling-letters', title: 'Falling Letters', icon: Hand, description: 'Catch the correct Hebrew letters.', progress: currentProfile.gameProgress.fallingLetters?.score !== undefined ? (currentProfile.gameProgress.fallingLetters.score / 20) * 100 : 0, locked: false }, // Assuming max score of 20 for progress
          { id: 'puzzle-game', title: 'Word Puzzle', icon: Puzzle, description: 'Arrange letters to form Hebrew words.', progress: currentProfile.gameProgress.puzzleGame !== undefined ? (currentProfile.gameProgress.puzzleGame / words.length) * 100 : 0, locked: false },
          { id: 'shape-recognition', title: 'Shape Recognition', icon: Shapes, description: 'Learn Hebrew names for shapes.', progress: currentProfile.gameProgress.shapeRecognition?.question !== undefined ? (currentProfile.gameProgress.shapeRecognition.question / 8) * 100 : 0, locked: false }, // Assuming 8 questions per level
          { id: 'coloring-redemption', title: 'Coloring Fun', icon: Palette, description: 'Unlock and color fun sheets!', progress: (currentProfile.redeemedColoringSheets.length / 15) * 100, locked: false }, // Assuming 15 total sheets
        ];

        return (
          <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-100 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('main-dashboard')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Games 🎮</h1>
              <div className="w-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableGames.map(game => (
                <Card key={game.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{game.title}</CardTitle>
                    <game.icon className="h-6 w-6 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                    <Progress value={game.progress} className="h-2 mb-3" />
                    <HapticButton
                      onClick={() => setView(game.id as any)} // Type assertion for now
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={game.locked}
                      hapticType="light"
                    >
                      {game.locked ? 'Locked' : 'Play Now'}
                    </HapticButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!currentProfile) return null;
        return (
          <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('main-dashboard')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Achievements 🏆</h1>
              <div className="w-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => {
                const isUnlocked = currentProfile.achievements.includes(achievement.id);
                return (
                  <Card key={achievement.id} className={`transition-all duration-200 ${isUnlocked ? 'border-green-500 shadow-md' : 'border-gray-200'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isUnlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          <achievement.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg font-medium">{achievement.name}</CardTitle>
                      </div>
                      {isUnlocked && <CheckCircle className="h-6 w-6 text-green-500" />}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Reward: {achievement.rewardPoints} Points</span>
                        {isUnlocked ? (
                          <span className="text-green-600 font-semibold">Unlocked!</span>
                        ) : (
                          <span className="text-orange-600 font-semibold">Locked</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'rewards':
        if (!currentProfile) return null;
        return (
          <ColoringRedemption
            points={currentProfile.points}
            onRedeem={handleRedeemColoringSheet}
            onDownload={handleDownloadColoringSheet}
            redeemedSheets={currentProfile.redeemedColoringSheets}
            onBack={() => setView('main-dashboard')}
          />
        );

      case 'settings':
        if (!currentProfile) return null;
        return (
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('main-dashboard')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Settings ⚙️</h1>
              <div className="w-10" />
            </div>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <HapticButton variant="outline" onClick={() => startEditProfile(currentProfile)} className="w-full" hapticType="light">
                  <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </HapticButton>
                <HapticButton variant="destructive" onClick={() => deleteProfile(currentProfile.id)} className="w-full" hapticType="heavy">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Profile
                </HapticButton>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">Hebrew Fun - Version 1.0.0</p>
                <p className="text-sm text-gray-600">Designed to make learning Hebrew fun for kids!</p>
              </CardContent>
            </Card>

            <HapticButton variant="outline" onClick={() => { setCurrentProfile(null); setView('profile-select'); }} className="w-full mt-4" hapticType="light">
              <LogOut className="w-4 h-4 mr-2" /> Switch Profile
            </HapticButton>
          </div>
        );

      case 'letter-match':
        if (!currentProfile) return null;
        const currentLetterMatchCard = alphabetCards[letterMatchQuestion];
        const letterMatchOptions = alphabetCards.map(card => card.letter).sort(() => Math.random() - 0.5);

        return (
          <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('games')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Letter Match 🅰️</h1>
              <div className="w-10" />
            </div>

            <Card className="mb-8 p-8 text-center">
              <CardTitle className="text-xl font-bold text-gray-800 mb-4">
                Which letter makes the sound of "{currentLetterMatchCard.name}"?
              </CardTitle>
              <div className="text-6xl mb-4">{currentLetterMatchCard.image}</div>
              <p className="text-lg text-gray-600 mb-6">{currentLetterMatchCard.description}</p>

              {/* Big Sound Button */}
              <HapticButton
                variant="outline"
                onClick={() => playHebrewSound(currentLetterMatchCard.hebrew)}
                className="w-20 h-20 rounded-full mx-auto"
                hapticType="light"
              >
                <Volume2 className="w-10 h-10" />
              </HapticButton>
            </Card>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {letterMatchOptions.map((option, index) => (
                <HapticButton
                  key={index}
                  variant="outline"
                  onClick={() => handleLetterMatchAnswer(option)}
                  className="h-24 flex items-center justify-center text-5xl font-bold"
                  hapticType="light"
                  disabled={letterMatchQuestion >= alphabetCards.length}
                >
                  {option}
                </HapticButton>
              ))}
            </div>

            <div className="text-center safe-area-bottom">
              <div className="text-sm text-gray-600 mb-2">
                Progress: {letterMatchQuestion + 1}/{alphabetCards.length} letters
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((letterMatchQuestion + 1) / alphabetCards.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'word-builder':
        if (!currentProfile) return null;
        const currentWordBuilderWord = words[wordBuilderWord];

        return (
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('games')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Word Builder 🧱</h1>
              <div className="w-10" />
            </div>

            <Card className="mb-8 p-8 text-center">
              <CardTitle className="text-xl font-bold text-gray-800 mb-4">
                Build the word for "{currentWordBuilderWord.english}"
              </CardTitle>
              <div className="text-6xl mb-4">{currentWordBuilderWord.emoji}</div>

              {/* Big Sound Button */}
              <HapticButton
                variant="outline"
                onClick={() => playHebrewSound(currentWordBuilderWord.hebrew)}
                className="w-20 h-20 rounded-full mx-auto"
                hapticType="light"
              >
                <Volume2 className="w-10 h-10" />
              </HapticButton>
            </Card>

            {/* Built Word Display */}
            <Card className="mb-6 p-4 text-center">
              <div className="flex justify-center items-center h-20 border-2 border-dashed border-gray-300 rounded-lg text-4xl font-bold text-gray-700" dir="rtl"> {/* Added dir="rtl" */}
                {builtWordLetters.length > 0 ? builtWordLetters.join('') : 'Build your word here'}
              </div>
              {wordBuilderFeedback && (
                <div className={`mt-4 p-2 rounded-lg text-white font-bold ${
                  wordBuilderFeedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {wordBuilderFeedback === 'correct' ? 'Correct!' : 'Try again!'}
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              {builtWordLetters.length > 0 && (
                <HapticButton
                  variant="outline"
                  onClick={handleRemoveLastLetter}
                  className="px-6 py-3 text-lg"
                  hapticType="light"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Delete Last
                </HapticButton>
              )}
              <HapticButton
                onClick={checkBuiltWord}
                disabled={builtWordLetters.length === 0}
                className="px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white"
                hapticType="success"
              >
                Check Word <CheckCircle className="w-5 h-5 ml-2" />
              </HapticButton>
            </div>

            {/* Letter Options */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              {wordBuilderOptions.map((letter, index) => (
                <HapticButton
                  key={index}
                  variant="outline"
                  onClick={() => handleAddLetterToWord(letter)}
                  className="h-20 flex items-center justify-center text-4xl font-bold"
                  hapticType="light"
                  disabled={wordBuilderFeedback !== null}
                >
                  {letter}
                </HapticButton>
              ))}
            </div>

            <div className="text-center safe-area-bottom">
              <div className="text-sm text-gray-600 mb-2">
                Progress: {wordBuilderWord + 1}/{words.length} words
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((wordBuilderWord + 1) / words.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'memory-game':
        if (!currentProfile) return null;
        return (
          <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('games')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Memory Game 🧠</h1>
              <div className="w-10" />
            </div>

            <Card className="mb-8 p-6 text-center">
              <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                Level {memoryGameLevel + 1}
              </CardTitle>
              <p className="text-gray-600">Find all the matching pairs!</p>
            </Card>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
              {memoryCards.map(card => (
                <Card
                  key={card.id}
                  className={cn(
                    "relative w-full aspect-square rounded-lg shadow-md cursor-pointer transition-all duration-300 transform",
                    card.isFlipped || card.isMatched ? "rotate-y-180" : "",
                    card.isMatched ? "opacity-50 pointer-events-none" : ""
                  )}
                  onClick={() => handleCardClick(card)}
                >
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center bg-blue-500 text-white text-5xl font-bold rounded-lg">
                    ?
                  </div>
                  <div className="absolute inset-0 rotate-y-180 backface-hidden flex flex-col items-center justify-center bg-white rounded-lg p-2">
                    <div className="text-5xl mb-1">{card.emoji}</div>
                    <div className="text-xl font-bold text-gray-800">{card.hebrew}</div>
                    <div className="text-xs text-gray-600 text-center mb-1">{card.english}</div>
                      <HapticButton
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); playHebrewSound(card.hebrew); }}
                        className="mt-1"
                        hapticType="light"
                      >
                        <Volume2 className="w-4 h-4" />
                      </HapticButton>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center safe-area-bottom">
              <div className="text-sm text-gray-600 mb-2">
                Matched: {matchedPairs}/{memoryCards.length / 2} pairs
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-teal-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(matchedPairs / (memoryCards.length / 2)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'number-recognition':
        if (!currentProfile) return null;
        const currentNumberRecognition = numbers[numberRecognitionQuestion];

        return (
          <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('games')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Number Recognition 🔢</h1>
              <div className="w-10" />
            </div>

            <Card className="mb-8 p-8 text-center">
              <CardTitle className="text-xl font-bold text-gray-800 mb-4">
                What number is this?
              </CardTitle>
              <div className="text-6xl mb-4">{currentNumberRecognition.emoji}</div>
              <p className="text-lg text-gray-600 mb-6">{currentNumberRecognition.english}</p>

              {/* Big Sound Button */}
              <HapticButton
                variant="outline"
                onClick={() => playHebrewSound(currentNumberRecognition.hebrew)}
                className="w-20 h-20 rounded-full mx-auto"
                hapticType="light"
              >
                <Volume2 className="w-10 h-10" />
              </HapticButton>
            </Card>

            {numberRecognitionFeedback && (
              <div className={`mb-6 p-4 rounded-lg text-center text-white font-bold text-lg ${
                numberRecognitionFeedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`}>
                {numberRecognitionFeedback === 'correct' ? 'Correct! 🎉' : 'Try again! 😔'}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              {numbersOptions.map((option, index) => (
                <HapticButton
                  key={index}
                  variant="outline"
                  onClick={() => handleNumberSelect(option)}
                  className="h-24 flex items-center justify-center text-5xl font-bold"
                  hapticType="light"
                  disabled={numberRecognitionFeedback !== null}
                >
                  {option}
                </HapticButton>
              ))}
            </div>

            <div className="text-center safe-area-bottom">
              <div className="text-sm text-gray-600 mb-2">
                Progress: {numberRecognitionQuestion + 1}/{numbers.length} numbers
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((numberRecognitionQuestion + 1) / numbers.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'tracing-game':
        if (!currentProfile) return null;
        const currentTracingLetter = tracingLetters[tracingGameLetter];

        return (
          <div className="min-h-screen bg-gradient-to-b from-red-50 to-pink-50 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('games')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Letter Tracing ✍️</h1>
              <div className="w-10" />
            </div>

            <Card className="mb-8 p-8 text-center">
              <CardTitle className="text-xl font-bold text-gray-800 mb-4">
                Trace the letter "{currentTracingLetter.hebrew}"
              </CardTitle>
              <div className="text-6xl mb-4">{currentTracingLetter.letter}</div>

              {/* Big Sound Button */}
              <HapticButton
                variant="outline"
                onClick={() => playHebrewSound(currentTracingLetter.hebrew)}
                className="w-20 h-20 rounded-full mx-auto"
                hapticType="light"
              >
                <Volume2 className="w-10 h-10" />
              </HapticButton>
            </Card>

            <div className="space-y-4">
              <Card className="p-4">
                <canvas
                  ref={tracingCanvasRef}
                  width={300}
                  height={200}
                  className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair bg-white touch-none"
                  onMouseDown={startTracing}
                  onMouseMove={trace}
                  onMouseUp={stopTracing}
                  onMouseLeave={stopTracing}
                  onTouchStart={startTracing}
                  onTouchMove={trace}
                  onTouchEnd={stopTracing}
                />
              </Card>

              {tracingFeedback && (
                <div className={`p-4 rounded-lg text-center text-white font-bold text-lg ${
                  tracingFeedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`}>
                  {tracingFeedback === 'correct' ? 'Perfect! 🎉' : 'Keep going! 💪'}
                </div>
              )}

              <HapticButton
                onClick={checkTracing}
                disabled={tracingPathProgress < 50} // Require some progress to check
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                hapticType="success"
              >
                Check Tracing
              </HapticButton>
            </div>

            <div className="text-center mt-6 safe-area-bottom">
              <div className="text-sm text-gray-600 mb-2">
                Progress: {tracingPathProgress.toFixed(0)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${tracingPathProgress}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'falling-letters':
        if (!currentProfile) return null;
        return (
          <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 safe-area-inset relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => { setFallingLettersGameActive(false); setView('games'); }}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Falling Letters 🖐️</h1>
              <div className="w-10" />
            </div>

            <Card className="mb-8 p-8 text-center">
              <CardTitle className="text-xl font-bold text-gray-800 mb-4">
                Catch the letter: "{fallingLettersCorrectLetter}"
              </CardTitle>
              <p className="text-lg text-gray-600 mb-6">Score: {fallingLettersScore}</p>

              {/* Big Sound Button */}
              <HapticButton
                variant="outline"
                onClick={() => playHebrewSound(alphabetCards.find(a => a.letter === fallingLettersCorrectLetter)?.hebrew || '')}
                className="w-20 h-20 rounded-full mx-auto"
                hapticType="light"
              >
                <Volume2 className="w-10 h-10" />
              </HapticButton>
            </Card>

            {fallingLettersGameActive && (
              <div className="absolute inset-0 pointer-events-none">
                {fallingLetters.map((letter) => (
                  <HapticButton
                    key={letter.id}
                    variant="outline"
                    onClick={() => handleFallingLetterClick(letter)}
                    className="absolute w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-full shadow-md pointer-events-auto"
                    style={{ left: `${letter.x}px`, top: `${letter.y}px` }}
                    hapticType="light"
                  >
                    {letter.letter}
                  </HapticButton>
                ))}
              </div>
            )}

            {!fallingLettersGameActive ? (
              <HapticButton
                onClick={startGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold mt-4 safe-area-bottom"
                hapticType="success"
              >
                Start Game
              </HapticButton>
            ) : (
              <div className="text-center mt-4 safe-area-bottom">
                <p className="text-sm text-gray-600">Catch as many as you can!</p>
              </div>
            )}
          </div>
        );

      case 'puzzle-game':
        if (!currentProfile) return null;
        const currentPuzzleWord = words[puzzleGameWord];

        return (
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4 safe-area-inset">
            <div className="flex items-center justify-between mb-6 safe-area-top">
              <HapticButton
                variant="outline"
                onClick={() => setView('games')}
                className="p-2"
                hapticType="light"
              >
                <ArrowLeft className="w-5 h-5" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-gray-800">Word Puzzle 🧩</h1>
              <div className="w-10" />
            </div>

            <Card className="mb-8 p-8 text-center">
              <CardTitle className="text-xl font-bold text-gray-800 mb-4">
                Arrange the letters to form "{currentPuzzleWord.english}"
              </CardTitle>
              <div className="text-6xl mb-4">{currentPuzzleWord.emoji}</div>

              {/* Big Sound Button */}
              <HapticButton
                variant="outline"
                onClick={() => playHebrewSound(currentPuzzleWord.hebrew)}
                className="w-20 h-20 rounded-full mx-auto"
                hapticType="light"
              >
                <Volume2 className="w-10 h-10" />
              </HapticButton>
            </Card>

            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {puzzlePieces.map((piece, index) => (
                    <HapticButton
                      key={piece.id}
                      variant="outline"
                      onClick={() => {
                        // Simple swap logic: if two are selected, swap them
                        const selected = puzzlePieces.filter(p => p.position === index);
                        if (selected.length === 0) {
                          // Select this piece
                          // For simplicity, let's just allow dragging or simple clicks
                          // For a full drag-and-drop, dnd-kit would be used here.
                          // For now, let's implement a simple swap with two clicks.
                          // This would require more state to track first clicked piece.
                          // For now, just a placeholder for interaction.
                          toast({
                            title: "Click two letters to swap",
                            description: "This feature needs more advanced logic.",
                            variant: "default",
                          });
                        }
                      }}
                      className="h-20 w-20 flex flex-col items-center justify-center text-3xl font-bold"
                      hapticType="light"
                    >
                      {piece.hebrew}
                      <span className="text-xs text-gray-500">{piece.english}</span>
                    </HapticButton>
                  ))}
                </div>
              </Card>

              {puzzleFeedback && (
                <div className={`p-4 rounded-lg text-center text-white font-bold text-lg ${
                  puzzleFeedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`}>
                  {puzzleFeedback === 'correct' ? 'Solved! 🎉' : 'Not quite! 😔'}
                </div>
              )}

              <HapticButton
                variant="outline"
                onClick={initializePuzzleGame.bind(null, puzzleGameWord)} // Re-initialize current puzzle
                className="w-full py-3 text-lg font-semibold"
                hapticType="light"
              >
                <RefreshCcw className="w-5 h-5 mr-2" /> Reset Puzzle
              </HapticButton>

              <HapticButton
                onClick={checkWord}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                hapticType="success"
              >
                Check Word
              </HapticButton>
            </div>

            <div className="text-center mt-6 safe-area-bottom">
              <div className="text-sm text-gray-600 mb-2">
                Progress: {puzzleGameWord + 1}/{words.length} words
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((puzzleGameWord + 1) / words.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'shape-recognition':
        if (!currentProfile) return null;
        return (
          <ShapeRecognitionGame
            level={shapeRecognitionLevel}
            question={shapeRecognitionQuestion}
            onBack={() => setView('games')}
            onCorrect={() => {
              addXp(10);
              const nextQuestion = shapeRecognitionQuestion + 1;
              const isLevelComplete = nextQuestion >= 8; // 8 questions per level

              const updatedShapeRecognition = {
                level: isLevelComplete ? shapeRecognitionLevel + 1 : shapeRecognitionLevel,
                question: isLevelComplete ? 0 : nextQuestion,
              };

              updateProfile({
                ...currentProfile,
                gameProgress: {
                  ...currentProfile.gameProgress,
                  shapeRecognition: updatedShapeRecognition,
                },
              });

              if (isLevelComplete) {
                toast({
                  title: "Level Complete!",
                  description: "You've mastered this shape recognition level!",
                  variant: "default",
                });
                setShapeRecognitionLevel(updatedShapeRecognition.level);
                setShapeRecognitionQuestion(0);
              } else {
                setShapeRecognitionQuestion(nextQuestion);
              }
            }}
          />
        );

      case 'coloring-redemption':
        if (!currentProfile) return null;
        return (
          <ColoringRedemption
            points={currentProfile.points}
            onRedeem={handleRedeemColoringSheet}
            onDownload={handleDownloadColoringSheet}
            redeemedSheets={currentProfile.redeemedColoringSheets}
            onBack={() => setView('games')}
          />
        );

      case 'coloring-game':
        if (!currentProfile) return null;
        // This case needs to be handled by the ColoringRedemption component
        // which will render ColoringGame if a sheet is selected.
        // This case should ideally not be reached directly.
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl text-gray-600">Loading coloring game...</p>
          </div>
        );

      case 'level-up-animation':
        if (!levelUpData) return null;
        return (
          <LevelUpAnimation
            level={levelUpData.level}
            onAnimationComplete={() => setLevelUpData(null)}
          />
        );

      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        );
    }
  };

  return (
    <>
      {renderContent()}
      {levelUpData && (
        <LevelUpAnimation
          level={levelUpData.level}
          onAnimationComplete={() => setLevelUpData(null)}
        />
      )}
      <Toaster />
    </>
  );
}