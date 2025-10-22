import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface FlashcardProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function Flashcard({ onNavigate }: FlashcardProps) {
  const [currentCard, setCurrentCard] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const totalCards = 15;

  const cards = [
    {
      question: "AND回路の真理値表で出力が1になるのは？",
      answer: "答え: 両方の入力が1のときのみ (A=1, B=1)",
      importance: 4
    },
    {
      question: "OR回路の真理値表で出力が0になるのは？",
      answer: "答え: 両方の入力が0のときのみ (A=0, B=0)",
      importance: 4
    },
    {
      question: "NOT回路の機能は？",
      answer: "答え: 入力を反転させる (0→1, 1→0)",
      importance: 5
    }
  ];

  const card = cards[currentCard % cards.length];

  return (
    <div className="flex flex-col h-full pb-4 md:pb-6 max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Badge style={{ background: '#dbeafe', color: '#2563eb', borderColor: '#3b82f6' }}>
            カード {currentCard} / {totalCards}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            +5 XP
          </Badge>
        </div>
        <div className="flex gap-1">
          {[...Array(totalCards)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < currentCard ? '' : 'bg-gray-200'
              }`}
              style={i < currentCard ? { background: 'linear-gradient(90deg, #2563eb, #3b82f6)' } : undefined}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Card */}
        <div className="relative w-full max-w-md perspective-1000">
          <Card 
            className={`w-full aspect-[4/3] cursor-pointer transition-all duration-500 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front */}
            <div 
              className={`absolute inset-0 p-8 flex flex-col items-center justify-center text-white rounded-lg shadow-xl ${
                isFlipped ? 'invisible' : 'visible'
              }`}
              style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #6DBFF2, #85D3F2)' }}
            >
              <div className="text-center space-y-6">
                <div className="text-4xl mb-4">🤔</div>
                <p className="text-xl">{card.question}</p>
                <div className="flex items-center gap-2 text-sm opacity-80 mt-8">
                  <RotateCcw className="w-4 h-4" />
                  <span>タップして答えを表示</span>
                </div>
              </div>
            </div>
            
            {/* Back */}
            <div 
              className={`absolute inset-0 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg shadow-xl ${
                isFlipped ? 'visible' : 'invisible'
              }`}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="text-center space-y-6">
                <div className="text-4xl mb-4">💡</div>
                <p className="text-xl">{card.answer}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Importance */}
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">重要度:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xl">
                  {i < card.importance ? '⭐' : '☆'}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full max-w-md">
          <Button
            variant="outline"
            size="lg"
            disabled={currentCard === 1}
            onClick={() => {
              setCurrentCard(c => Math.max(1, c - 1));
              setIsFlipped(false);
            }}
            className="bg-white hover:bg-blue-50"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            前へ
          </Button>
          
          <div className="text-center">
            <p className="text-2xl">{currentCard}</p>
            <p className="text-xs text-muted-foreground">/ {totalCards}</p>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            disabled={currentCard === totalCards}
            onClick={() => {
              setCurrentCard(c => Math.min(totalCards, c + 1));
              setIsFlipped(false);
            }}
            className="bg-white hover:bg-blue-50"
          >
            次へ
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* Confidence Buttons */}
        {isFlipped && (
          <div className="w-full max-w-md space-y-3 animate-slide-in">
            <p className="text-center">自信度を選択:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="h-16 bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:shadow-lg"
                onClick={() => {
                  setCurrentCard(c => Math.min(totalCards, c + 1));
                  setIsFlipped(false);
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">😢</div>
                  <p className="text-sm">わからない</p>
                </div>
              </Button>
              <Button 
                variant="outline"
                className="h-16 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-lg"
                onClick={() => {
                  setCurrentCard(c => Math.min(totalCards, c + 1));
                  setIsFlipped(false);
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🤔</div>
                  <p className="text-sm">微妙</p>
                </div>
              </Button>
              <Button 
                variant="outline"
                className="h-16 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg"
                onClick={() => {
                  setCurrentCard(c => Math.min(totalCards, c + 1));
                  setIsFlipped(false);
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">😊</div>
                  <p className="text-sm">理解した</p>
                </div>
              </Button>
              <Button 
                variant="outline"
                className="h-16 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg"
                onClick={() => {
                  setCurrentCard(c => Math.min(totalCards, c + 1));
                  setIsFlipped(false);
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">😎</div>
                  <p className="text-sm">完璧</p>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
