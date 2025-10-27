"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X, CheckCircle, XCircle, ArrowRight, AlertCircle, Flame } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/contexts/auth-context";
import { useStudySession } from "@/lib/hooks/use-study-session";
import { useTopicActions } from "@/lib/hooks/use-topic-actions";
import { getTopicById } from "@/lib/syllabus";
import { useSoundEffect } from "@/hooks/use-sound";
import { triggerAchievementCheckAfterTest } from "@/lib/achievements/trigger";
import { useParticles, ParticleManager } from "@/components/effects/ParticleManager";
import { ExpPopupManager } from "@/components/effects/ExpPopup";
import { Cutscene, CutsceneType } from "@/components/effects/Cutscene";
import { ScreenFlash, FlashColor } from "@/components/effects/ScreenFlash";
import { ComboDisplay } from "@/components/effects/ComboDisplay";

interface TestProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
  unitData?: { topicId: string };
}

interface Question {
  id: string;
  type: "multiple_choice";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TestData {
  topicId: string;
  title: string;
  questions: Question[];
}

interface ShuffledOption {
  text: string;
  originalIndex: number;
}

export function Test({ onNavigate, unitData }: TestProps) {
  const { user } = useAuth();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<number, { answer: number; correct: boolean }>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [topicStatus, setTopicStatus] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);

  const { startSession, endSession } = useStudySession(user?.id, unitData?.topicId);
  const { saveTestScore } = useTopicActions(user?.id);
  const playSound = useSoundEffect();

  // エフェクト管理
  const { particles, spawnParticles, spawnBurst, removeParticle } = useParticles();
  const [expPopups, setExpPopups] = useState<{ id: string; x: number; y: number; exp: number }[]>([]);
  const [cutscene, setCutscene] = useState<CutsceneType | null>(null);
  const [screenFlash, setScreenFlash] = useState<FlashColor | null>(null);
  const [combo, setCombo] = useState(0);

  const topic = unitData?.topicId ? getTopicById(unitData.topicId) : null;

  // Fisher-Yates shuffle algorithm
  const shuffleOptions = (options: string[]): ShuffledOption[] => {
    const shuffled: ShuffledOption[] = options.map((text, index) => ({
      text,
      originalIndex: index
    }));

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  };

  // Shuffle options when question changes
  useEffect(() => {
    if (testData && testData.questions[currentQuestion]) {
      const currentQ = testData.questions[currentQuestion];
      setShuffledOptions(shuffleOptions(currentQ.options));
    }
  }, [testData, currentQuestion]);

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

  // Load test questions
  useEffect(() => {
    async function loadQuestions() {
      if (!unitData?.topicId) return;

      try {
        const response = await fetch(`/data/questions/${unitData.topicId}.json`);
        if (!response.ok) {
          throw new Error('Questions not found');
        }
        const data = await response.json();
        setTestData(data);
      } catch (error) {
        console.error('Error loading questions:', error);
        // Use fallback data
        const currentTopic = getTopicById(unitData.topicId);
        setTestData({
          topicId: unitData.topicId,
          title: currentTopic?.タイトル || 'テスト',
          questions: [{
            id: 'fallback-1',
            type: 'multiple_choice',
            question: 'テスト問題は現在準備中です。',
            options: ['OK'],
            correctAnswer: 0,
            explanation: 'この単元のテスト問題は現在準備中です。'
          }]
        });
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [unitData?.topicId]);

  const handleAnswerSelect = (answerIndex: number) => {
    console.log('handleAnswerSelect called with:', answerIndex, 'showResult:', showResult);
    if (!showResult) {
      setSelectedAnswer(answerIndex);
      console.log('selectedAnswer set to:', answerIndex);
      playSound('click');
    }
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null || !testData || shuffledOptions.length === 0) return;

    const currentQ = testData.questions[currentQuestion];
    // Convert shuffled index to original index
    const originalAnswerIndex = shuffledOptions[selectedAnswer].originalIndex;
    const isCorrect = originalAnswerIndex === currentQ.correctAnswer;

    // 回答を記録（元のインデックスで保存）
    setAnsweredQuestions(prev => new Map(prev).set(currentQuestion, {
      answer: originalAnswerIndex,
      correct: isCorrect
    }));

    // 正解/不正解の音を再生
    playSound(isCorrect ? 'correct' : 'incorrect');

    // エフェクト発動
    if (isCorrect) {
      // コンボ増加
      const newCombo = combo + 1;
      setCombo(newCombo);

      // 画面中央の座標を取得
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // パーティクルエフェクト
      spawnBurst(centerX, centerY);

      // EXPポップアップ
      const expAmount = 10 + (newCombo > 1 ? newCombo * 5 : 0);
      setExpPopups(prev => [...prev, {
        id: `exp-${Date.now()}`,
        x: centerX,
        y: centerY - 50,
        exp: expAmount
      }]);

      // カットイン演出（コンボ数に応じて）
      let cutsceneType: CutsceneType = 'NICE';
      if (newCombo >= 10) {
        cutsceneType = 'PERFECT';
        spawnParticles(centerX, centerY, 'confetti', 30);
      } else if (newCombo >= 5) {
        cutsceneType = 'EXCELLENT';
      } else if (newCombo >= 3) {
        cutsceneType = 'GOOD';
      }

      if (newCombo >= 3) {
        setCutscene(cutsceneType);
      }

      // 画面フラッシュ（成功）
      setScreenFlash('success');
    } else {
      // 不正解時はコンボリセット
      setCombo(0);

      // 画面フラッシュ（失敗）
      setScreenFlash('error');
    }

    // 結果を表示
    setShowResult(true);
  };

  const removeExpPopup = (id: string) => {
    setExpPopups(prev => prev.filter(p => p.id !== id));
  };

  const handleNextQuestion = () => {
    if (!testData) return;

    if (currentQuestion < testData.questions.length - 1) {
      // 次の問題へ
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      playSound('transition');
    } else {
      // 全問完了 - 結果画面へ
      handleFinishTest();
    }
  };

  const handleFinishTest = async () => {
    if (!testData || !unitData?.topicId) return;

    setSubmitting(true);

    try {
      // Calculate score
      let correctCount = 0;
      const incorrectQuestions: { question: Question; userAnswer: number }[] = [];

      testData.questions.forEach((question, index) => {
        const answered = answeredQuestions.get(index);
        if (answered?.correct) {
          correctCount++;
        } else {
          incorrectQuestions.push({
            question,
            userAnswer: answered?.answer ?? -1
          });
        }
      });

      const score = Math.round((correctCount / testData.questions.length) * 100);

      // Save score
      await saveTestScore(
        unitData.topicId,
        score,
        testData.questions.length,
        correctCount
      );

      // Check for new achievements
      if (user?.id) {
        await triggerAchievementCheckAfterTest(user.id).catch((error) => {
          console.error('Failed to check achievements:', error);
        });
      }

      await endSession().catch(() => {
        // Ignore session errors
      });

      // Navigate to result page
      onNavigate('testResult', {
        topicId: unitData.topicId,
        score,
        totalQuestions: testData.questions.length,
        correctCount,
        incorrectQuestions,
        allQuestions: testData.questions,
        userAnswers: Array.from(answeredQuestions.entries()).map(([index, data]) => [index, data.answer])
      });
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-muted-foreground">テスト問題を読み込み中...</p>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
        <Card className="p-8 text-center" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
          <p className="text-muted-foreground">テスト問題が見つかりません</p>
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
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto pt-8">
            <Card className="p-4 text-white border-0 shadow-lg" style={{ background: 'linear-gradient(90deg, #a855f7, #d946ef)' }}>
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                  テスト
                </Badge>
              </div>
              <p className="text-center text-lg font-semibold">
                {testData.title}
              </p>
            </Card>

            <Card className="p-8 text-center bg-yellow-50 border-yellow-200 border-2" style={{ backgroundColor: '#fefce8', opacity: 1 }}>
              <div className="space-y-4">
                <div className="text-6xl">🚧</div>
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
        </div>
      </div>
    );
  }

  const totalQuestions = testData.questions.length;
  const answeredCount = answeredQuestions.size;
  const currentQ = testData.questions[currentQuestion];
  const currentAnswered = answeredQuestions.get(currentQuestion);
  const isCorrect = currentAnswered?.correct ?? false;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* エフェクト表示 */}
      <ParticleManager particles={particles} onRemove={removeParticle} />
      <ExpPopupManager popups={expPopups} onRemove={removeExpPopup} />
      {cutscene && <Cutscene type={cutscene} onComplete={() => setCutscene(null)} />}
      {screenFlash && <ScreenFlash color={screenFlash} onComplete={() => setScreenFlash(null)} />}
      <ComboDisplay combo={combo} />

      {/* Exit Button */}
      <div className="flex justify-end p-4 pb-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-red-100 text-red-600">
              <X className="w-5 h-5 mr-2" />
              終了
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>テストを終了しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                まだ問題が残っています。終了すると、進捗は保存されません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  endSession().catch(() => {
                    // Ignore session errors
                  });
                  onNavigate('unitDetail', { topicId: unitData?.topicId });
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                終了する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
          {/* Header Card */}
          <Card className="p-4 text-white border-0 shadow-lg" style={{ background: 'linear-gradient(90deg, #a855f7, #d946ef)' }}>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                問題 {currentQuestion + 1}/{totalQuestions}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                回答済: {answeredCount}/{totalQuestions}
              </Badge>
            </div>

            <Progress value={((answeredCount) / totalQuestions) * 100} className="h-3 bg-white/30 mb-2" />

            <p className="text-center text-sm opacity-90">
              {testData.title} - 確認テスト
            </p>
          </Card>

          {/* Question Card */}
          <Card className="p-4 shadow-xl" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
            <div className="flex items-start gap-2 mb-3">
              <Badge className="bg-purple-100 text-purple-700 border-purple-300 shrink-0 text-xs">
                Q{currentQuestion + 1}
              </Badge>
              <h3 className="text-sm leading-relaxed">{currentQ.question}</h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {shuffledOptions.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = option.originalIndex === currentQ.correctAnswer;
                const showCorrectAnswer = showResult && isCorrectOption;
                const showIncorrectAnswer = showResult && isSelected && !isCorrect;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all text-center ${
                      showCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : showIncorrectAnswer
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200'
                    } ${!showResult ? 'cursor-pointer hover:border-purple-300 hover:bg-purple-50/50' : ''}`}
                    style={{
                      backgroundColor: showCorrectAnswer
                        ? '#f0fdf4'
                        : showIncorrectAnswer
                        ? '#fef2f2'
                        : isSelected
                        ? '#faf5ff'
                        : '#ffffff',
                      opacity: 1
                    }}
                    onClick={() => {
                      if (!showResult) {
                        console.log('Clicked option:', index);
                        handleAnswerSelect(index);
                      }
                    }}
                  >
                    <div className="flex-1 text-sm">
                      {option.text}
                    </div>
                    {showCorrectAnswer && (
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 ml-2" />
                    )}
                    {showIncorrectAnswer && (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 回答確定ボタン（未回答時のみ表示） */}
            {!showResult && (
              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={handleConfirmAnswer}
                  disabled={selectedAnswer === null}
                  style={{
                    backgroundColor: selectedAnswer === null ? '#d1d5db' : '#9333ea',
                    color: selectedAnswer === null ? '#6b7280' : '#ffffff',
                    opacity: 1
                  }}
                  className={`w-full ${
                    selectedAnswer === null
                      ? 'cursor-not-allowed'
                      : 'hover:brightness-110'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  回答を確定
                </Button>
              </div>
            )}
          </Card>

          {/* 結果と解説の表示 */}
          {showResult && (
            <Card
              className={`p-3 border-2 ${isCorrect ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}`}
              style={{ backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2', opacity: 1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="text-sm font-semibold text-green-700">正解！</h3>
                      <p className="text-xs text-green-600">よくできました</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="text-sm font-semibold text-red-700">不正解</h3>
                      <p className="text-xs text-red-600">
                        正解は「{currentQ.options[currentQ.correctAnswer]}」です
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex items-start gap-2 mb-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <h4 className="font-semibold text-gray-700 text-sm">解説</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed ml-6 whitespace-pre-wrap font-mono">{currentQ.explanation}</p>
              </div>

              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={handleNextQuestion}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  style={{ background: 'linear-gradient(to right, #9333ea, #db2777)', opacity: 1 }}
                >
                  {currentQuestion < totalQuestions - 1 ? (
                    <>
                      次の問題へ
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          結果を集計中...
                        </>
                      ) : (
                        <>
                          テスト結果を見る
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Question Navigation Grid */}
          <Card className="p-2" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
            <p className="text-xs text-muted-foreground mb-1.5">問題一覧</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px'
            }}>
              {testData.questions.map((_, index) => {
                const answered = answeredQuestions.get(index);
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`h-8 rounded text-center flex items-center justify-center text-[10px] font-medium border cursor-pointer hover:opacity-80 transition-opacity ${
                      index === currentQuestion
                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                        : answered?.correct
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : answered && !answered.correct
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-400'
                    }`}
                    style={{
                      backgroundColor: index === currentQuestion
                        ? '#f3e8ff'
                        : answered?.correct
                        ? '#f0fdf4'
                        : answered && !answered.correct
                        ? '#fef2f2'
                        : '#ffffff'
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
