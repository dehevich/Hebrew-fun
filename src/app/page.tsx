"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, BookOpen, Home, User, Settings, ArrowLeft, RotateCcw } from 'lucide-react';

export default function HebrewLearningApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [streak, setStreak] = useState(3);
  const [points, setPoints] = useState(150);
  const [level, setLevel] = useState(1);

  // Game states
  const [letterMatchScore, setLetterMatchScore] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Word Builder game states
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [builtWord, setBuiltWord] = useState<string[]>([]);
  const [wordScore, setWordScore] = useState(0);

  // Memory game states
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [memoryScore, setMemoryScore] = useState(0);
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

  const games = [
    { title: 'Letter Match', icon: '🎯', description: 'Match Hebrew letters with sounds', progress: 75 },
    { title: 'Word Builder', icon: '🧩', description: 'Build words with Hebrew letters', progress: 50 },
    { title: 'Memory Game', icon: '🧠', description: 'Remember Hebrew vocabulary', progress: 30 },
  ];

  const achievements = [
    { title: 'First Steps', icon: '👶', earned: true },
    { title: 'Letter Master', icon: '📝', earned: true },
    { title: 'Word Wizard', icon: '🧙', earned: false },
    { title: 'Fluent Speaker', icon: '🗣️', earned: false },
  ];

  const soundOptions = ['ah', 'b', 'g', 'd', 'h', 'v', 'z', 'ch'];

  const handleSoundSelect = (sound: string) => {
    setSelectedSound(sound);
    const correct = sound === alphabetCards[currentLetterIndex].sound;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setLetterMatchScore(prev => prev + 1);
      setPoints(prev => prev + 10);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedSound(null);
      setCurrentLetterIndex(prev => (prev + 1) % alphabetCards.length);
    }, 1500);
  };

  const playHebrewSound = (letter: string, sound: string, event?: React.MouseEvent) => {
    // Create audio context for Hebrew pronunciation
    const utterance = new SpeechSynthesisUtterance(sound);
    utterance.lang = 'he-IL';
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
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
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  };

  const renderLetterMatchGame = () => {
    const currentLetter = alphabetCards[currentLetterIndex];
    
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
              Score: {letterMatchScore}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {points}
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
            <Button 
              onClick={(e) => {
                playHebrewSound(currentLetter.letter, currentLetter.sound, e);
              }}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 mb-4"
            >
              🔊 Hear Sound
            </Button>
          </CardContent>
        </Card>

        {/* Sound Options */}
        <div className="grid grid-cols-2 gap-4">
          {soundOptions.map((sound, index) => (
            <Button
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
            >
              /{sound}/
            </Button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <Card className={`${isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">{isCorrect ? '🎉' : '😊'}</div>
              <p className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct! Great job!' : `Nice try! The sound is /${currentLetter.sound}/`}
              </p>
              {isCorrect && (
                <Badge className="mt-2 bg-yellow-500 text-yellow-900">
                  +10 Points!
                </Badge>
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
      }
    };

    const checkWord = () => {
      const isCorrect = builtWord.join('') === currentWord.hebrew;
      if (isCorrect) {
        setWordScore(prev => prev + 1);
        setPoints(prev => prev + 20);
        setTimeout(() => {
          setBuiltWord([]);
          setCurrentWordIndex(prev => (prev + 1) % words.length);
        }, 2000);
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
              Score: {wordScore}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⭐ {points}
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
            <p className="text-lg opacity-90 mb-4">Build: {currentWord.hebrew}</p>
            <Button 
              onClick={() => {
                playWordSound(currentWord.hebrew);
              }}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              🔊 Hear Word
            </Button>
          </CardContent>
        </Card>

        {/* Word Building Area */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center gap-2 mb-4 min-h-[60px] items-center">
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
              <Button 
                onClick={resetWord}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              {builtWord.length === currentWord.letters.length && (
                <Button 
                  onClick={checkWord}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Check Word ✅
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Letter Options */}
        <div className="grid grid-cols-3 gap-3">
          {currentWord.letters.map((letter, index) => (
            <Button
              key={index}
              className="h-16 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white"
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </Button>
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
            setMemoryScore(prev => prev + 1);
            setPoints(prev => prev + 15);
          }, 1000);
        } else {
          // No match
          setTimeout(() => {
            setFlippedCards([]);
          }, 1000);
        }
      }
    };

    const resetMemoryGame = () => {
      setFlippedCards([]);
      setMatchedPairs(0);
      setMemoryScore(0);
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
              ⭐ {points}
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
                    <div className="text-sm font-bold">{card.hebrew}</div>
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
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Hebrew Fun</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            🔥 {streak} days
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            ⭐ {points}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {currentGame === 'letter-match' && renderLetterMatchGame()}
        {currentGame === 'word-builder' && renderWordBuilderGame()}
        {currentGame === 'memory-game' && renderMemoryGame()}

        {!currentGame && activeTab === 'home' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Welcome Back! 👋</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">Ready to learn Hebrew today?</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Level {level}</p>
                    <Progress value={(level % 5) * 20} className="w-32 h-2 bg-white/20" />
                  </div>
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-6 py-3">
                    Start Learning! 🚀
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-800">{streak}</p>
                  <p className="text-sm text-yellow-600">Day Streak</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-800">{points}</p>
                  <p className="text-sm text-green-600">Points</p>
                </CardContent>
              </Card>
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
                        <div className="text-3xl font-bold text-gray-800 mb-1">{card.letter}</div>
                        <div className="text-sm text-gray-600">{card.name}</div>
                        <div className="text-xs text-gray-500 mt-1">/{card.sound}/</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fun Games */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">Fun Games 🎮</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {games.map((game, index) => (
                  <Card 
                    key={index} 
                    className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setCurrentGame(
                      game.title === 'Letter Match' ? 'letter-match' :
                      game.title === 'Word Builder' ? 'word-builder' :
                      'memory-game'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{game.icon}</span>
                          <div>
                            <h3 className="font-bold text-gray-800">{game.title}</h3>
                            <p className="text-sm text-gray-600">{game.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={game.progress} className="flex-1 h-2" />
                        <span className="text-sm text-gray-600">{game.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {!currentGame && activeTab === 'learn' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Hebrew Alphabet 📚</CardTitle>
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
                <CardTitle className="text-xl font-bold">Your Achievements 🏆</CardTitle>
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
                      <Badge variant="secondary">100 ⭐</Badge>
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
                      <Badge variant="secondary">200 ⭐</Badge>
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
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Little Learner</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg mb-4">Level {level} Hebrew Explorer</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{streak}</p>
                    <p className="text-sm opacity-90">Day Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{points}</p>
                    <p className="text-sm opacity-90">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</p>
                    <p className="text-sm opacity-90">Badges</p>
                  </div>
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
                    <span className="text-sm text-gray-600">8/25</span>
                  </div>
                  <Progress value={32} className="h-3" />
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