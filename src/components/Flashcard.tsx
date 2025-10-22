"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, RotateCw } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useStudySession } from "@/lib/hooks/use-study-session";
import { useTopicActions } from "@/lib/hooks/use-topic-actions";
import { useFlashcardReview } from "@/lib/hooks/use-flashcard-review";
import { getTopicById } from "@/lib/syllabus";
import { useSoundEffect } from "@/hooks/use-sound";
import { triggerAchievementCheckAfterTopicComplete } from "@/lib/achievements/trigger";

interface FlashcardProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
  unitData?: { topicId: string };
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  importance: number;
}

interface FlashcardData {
  topicId: string;
  title: string;
  flashcards: Flashcard[];
}

export function Flashcard({ onNavigate, unitData }: FlashcardProps) {
  const { user } = useAuth();
  const [currentCard, setCurrentCard] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());
  const [topicStatus, setTopicStatus] = useState<string | null>(null);

  const { startSession, endSession } = useStudySession(user?.id, unitData?.topicId);
  const { markFlashcardCompleted } = useTopicActions(user?.id);
  const { saveReview } = useFlashcardReview(user?.id);
  const playSound = useSoundEffect();

  const topic = unitData?.topicId ? getTopicById(unitData.topicId) : null;

  // Load topic status
  useEffect(() => {
    async function loadTopicStatus() {
      if (!unitData?.topicId) return;

      try {
        const response = await fetch('/data/topic-status.json');
        if (response.ok) {
          const data = await response.json();
          const status = data.topics[unitData.topicId]?.status;
          setTopicStatus(status || null);
        }
      } catch (error) {
        console.error('Error loading topic status:', error);
      }
    }

    loadTopicStatus();
  }, [unitData?.topicId]);

  // Load flashcard data
  useEffect(() => {
    async function loadFlashcards() {
      if (!unitData?.topicId) return;

      try {
        const response = await fetch(`/data/flashcards/${unitData.topicId}.json`);
        if (!response.ok) {
          throw new Error('Flashcards not found');
        }
        const data = await response.json();
        setFlashcardData(data);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        // Use fallback data
        const currentTopic = getTopicById(unitData.topicId);
        setFlashcardData({
          topicId: unitData.topicId,
          title: currentTopic?.タイトル || 'フラッシュカード',
          flashcards: [{
            id: 'fallback-1',
            front: 'フラッシュカード準備中',
            back: 'この単元のフラッシュカードは現在準備中です。',
            importance: 3
          }]
        });
      } finally {
        setLoading(false);
      }
    }

    loadFlashcards();
  }, [unitData?.topicId]);

  // Temporarily disabled for debugging infinite loop
  // Start study session on mount
  //   useEffect(() => {
  //     startSession();
  //     return () => {
  //       endSession();
  //     };
  //   }, [startSession, endSession]);

  const handleConfidenceSelect = async (confidence: number) => {
    if (!flashcardData || !unitData?.topicId) return;

    const currentFlashcard = flashcardData.flashcards[currentCard - 1];

    // Save review
    await saveReview(currentFlashcard.id, unitData.topicId, confidence);

    // Mark card as reviewed
    setReviewedCards(prev => new Set(prev).add(currentCard));

    // Move to next card
    if (currentCard < flashcardData.flashcards.length) {
      setCurrentCard(c => c + 1);
      setIsFlipped(false);
      playSound('transition');
    } else {
      // All cards completed
      playSound('complete');
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!unitData?.topicId) return;

    setCompleting(true);
    try {
      await markFlashcardCompleted(unitData.topicId);

      // Check for new achievements
      if (user?.id) {
        await triggerAchievementCheckAfterTopicComplete(user.id).catch((error) => {
          console.error('Failed to check achievements:', error);
        });
      }

      await endSession().catch(() => {
        // Ignore session errors
      });
      onNavigate('unitDetail', { topicId: unitData.topicId });
    } catch (error) {
      console.error('Error completing flashcard:', error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <p className="text-muted-foreground">フラッシュカードを読み込み中...</p>
      </div>
    );
  }

  if (!flashcardData) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">フラッシュカードデータが見つかりません</p>
          <Button onClick={() => onNavigate('unitDetail', { topicId: unitData?.topicId })} className="mt-4">
            単元詳細に戻る
          </Button>
        </Card>
      </div>
    );
  }

  // Check if content is not ready
  if (topicStatus === 'coming_soon' || topicStatus === 'not_created') {
    return (
      <div className="flex flex-col h-full pb-4 md:pb-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-green-500" />
              <Badge className="bg-green-100 text-green-700 border-green-300">
                フラッシュカード
              </Badge>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl mb-1">{flashcardData.title}</h1>
        </div>

        <Card className="p-8 text-center bg-yellow-50 border-yellow-200 border-2">
          <div className="space-y-4">
            <div className="text-6xl">📝</div>
            <h3 className="text-xl font-semibold text-yellow-800">
              このコンテンツは現在準備中です
            </h3>
            <p className="text-yellow-700">
              近日公開予定です。しばらくお待ちください。
            </p>
            <Button
              onClick={() => onNavigate('unitDetail', { topicId: unitData?.topicId })}
              className="mt-6 bg-yellow-600 hover:bg-yellow-700"
            >
              単元詳細に戻る
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalCards = flashcardData.flashcards.length;
  const card = flashcardData.flashcards[currentCard - 1];
  const allReviewed = reviewedCards.size === totalCards;

  return (
    <div className="flex flex-col h-full pb-4 md:pb-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-green-500" />
            <Badge className="bg-green-100 text-green-700 border-green-300">
              カード {currentCard} / {totalCards}
            </Badge>
          </div>
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            復習中
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {[...Array(totalCards)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                reviewedCards.has(i + 1)
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : i + 1 === currentCard
                  ? 'bg-blue-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Card */}
        <div className="relative w-full max-w-md perspective-1000">
          <Card
            className="w-full aspect-[4/3] cursor-pointer transition-all duration-500 shadow-xl"
            onClick={() => {
              if (!allReviewed) {
                setIsFlipped(!isFlipped);
                playSound('flip');
              }
            }}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front */}
            <div
              className={`absolute inset-0 p-8 flex flex-col items-center justify-center text-white rounded-lg ${
                isFlipped ? 'invisible' : 'visible'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
              }}
            >
              <div className="text-center space-y-6">
                <div className="text-4xl mb-4">🤔</div>
                <p className="text-xl whitespace-pre-line">{card.front}</p>
                <div className="flex items-center gap-2 text-sm opacity-80 mt-8">
                  <RotateCcw className="w-4 h-4" />
                  <span>タップして答えを表示</span>
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className={`absolute inset-0 p-8 flex flex-col items-center justify-center text-white rounded-lg ${
                isFlipped ? 'visible' : 'invisible'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
              }}
            >
              <div className="text-center space-y-6 overflow-auto max-h-full">
                <div className="text-4xl mb-4">💡</div>
                <p className="text-lg whitespace-pre-line">{card.back}</p>
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
        {!allReviewed && (
          <div className="flex items-center justify-between w-full max-w-md">
            <Button
              variant="outline"
              size="lg"
              disabled={currentCard === 1}
              onClick={() => {
                setCurrentCard(c => Math.max(1, c - 1));
                setIsFlipped(false);
              }}
              className="bg-white hover:bg-green-50"
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
              className="bg-white hover:bg-green-50"
            >
              次へ
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* Confidence Buttons */}
        {isFlipped && !allReviewed && (
          <div className="w-full max-w-md space-y-3 animate-slide-in">
            <p className="text-center font-medium">自信度を選択:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-16 bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:shadow-lg transition-all"
                onClick={() => handleConfidenceSelect(1)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">😢</div>
                  <p className="text-sm">わからない</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-16 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-lg transition-all"
                onClick={() => handleConfidenceSelect(2)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🤔</div>
                  <p className="text-sm">微妙</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-16 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-all"
                onClick={() => handleConfidenceSelect(3)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">😊</div>
                  <p className="text-sm">理解した</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-16 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all"
                onClick={() => handleConfidenceSelect(4)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">😎</div>
                  <p className="text-sm">完璧</p>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Completion */}
        {allReviewed && (
          <div className="w-full max-w-md space-y-4 animate-slide-in">
            <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl mb-2">すべてのカードを復習しました！</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {totalCards}枚のフラッシュカードを完了しました
              </p>
            </Card>

            <Button
              className="w-full h-12"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  完了処理中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  学習を完了する
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
