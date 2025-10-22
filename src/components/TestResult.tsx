"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Home, RotateCw, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSoundEffect } from "@/hooks/use-sound";

interface TestResultProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
  resultData?: {
    topicId: string;
    score: number;
    totalQuestions: number;
    correctCount: number;
    incorrectQuestions: Array<{
      question: {
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      };
      userAnswer: number;
    }>;
    allQuestions: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
    userAnswers: Array<[number, number]>;
  };
}

export function TestResult({ onNavigate, resultData }: TestResultProps) {
  const [showDetails, setShowDetails] = useState(false);
  const playSound = useSoundEffect();

  // Play sound based on result
  useEffect(() => {
    if (resultData) {
      const passed = resultData.score >= 70;
      if (passed) {
        // Delay slightly for better UX
        setTimeout(() => playSound('achievement'), 300);
      } else {
        setTimeout(() => playSound('notification'), 300);
      }
    }
  }, [resultData, playSound]);

  if (!resultData) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">結果データがありません</p>
          <Button onClick={() => onNavigate('home')} className="mt-4">
            ホームに戻る
          </Button>
        </Card>
      </div>
    );
  }

  const { score, totalQuestions, correctCount, incorrectQuestions, topicId } = resultData;
  const incorrectCount = totalQuestions - correctCount;
  const passed = score >= 70;

  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
      {/* Celebration Card */}
      <Card
        className={`overflow-hidden text-white border-0 shadow-xl ${
          passed
            ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'
            : 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500'
        }`}
      >
        <div className="p-8 text-center space-y-4">
          <div className="text-6xl animate-float">{passed ? '🎉' : '💪'}</div>
          <h1 className="text-white text-3xl">{passed ? 'おめでとうございます！' : 'もう少し！'}</h1>
          <p className="text-white/90">
            {passed ? 'テストに合格しました' : '惜しかったです。復習してもう一度挑戦しましょう'}
          </p>
        </div>
      </Card>

      {/* Score Card */}
      <Card className="p-8 text-center space-y-6 shadow-xl border-4" style={{ borderColor: passed ? '#10b981' : '#f59e0b' }}>
        <Badge
          className="text-white border-0 text-lg px-4 py-1"
          style={{ background: passed ? '#10b981' : '#f59e0b' }}
        >
          スコア
        </Badge>

        <div className="relative">
          <div
            className="text-7xl bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: passed
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
            }}
          >
            {score}%
          </div>
          <div
            className="absolute inset-0 blur-2xl opacity-20"
            style={{
              background: passed
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
            }}
          />
        </div>

        <div className="space-y-2">
          <p className="text-2xl">
            {correctCount}/{totalQuestions} 正解
          </p>
          {passed && (
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-green-500" />
              <span className="text-green-600">合格基準（70%）をクリア！</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">正解</p>
            </div>
            <p className="text-2xl text-green-600">{correctCount}問</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">不正解</p>
            </div>
            <p className="text-2xl text-red-600">{incorrectCount}問</p>
          </div>
        </div>
      </Card>

      {/* Incorrect Questions */}
      {incorrectQuestions.length > 0 && (
        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">間違えた問題</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? '閉じる' : '詳細を見る'}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-4 mt-4">
              {incorrectQuestions.map((item, index) => (
                <Card key={index} className="p-4 bg-red-50 border-red-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-red-500 text-white border-0 shrink-0">Q{index + 1}</Badge>
                      <p className="text-sm">{item.question.question}</p>
                    </div>

                    {/* User's Answer */}
                    <div className="ml-6 p-3 bg-red-100 rounded border border-red-300">
                      <p className="text-xs text-red-700 mb-1">あなたの回答:</p>
                      <p className="text-sm">
                        {item.userAnswer >= 0
                          ? item.question.options[item.userAnswer]
                          : '未回答'}
                      </p>
                    </div>

                    {/* Correct Answer */}
                    <div className="ml-6 p-3 bg-green-100 rounded border border-green-300">
                      <p className="text-xs text-green-700 mb-1">正解:</p>
                      <p className="text-sm">{item.question.options[item.question.correctAnswer]}</p>
                    </div>

                    {/* Explanation */}
                    <div className="ml-6 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-700 mb-1">解説:</p>
                      <p className="text-sm">{item.question.explanation}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onNavigate('test', { topicId })}
          className="h-16"
        >
          <RotateCw className="w-5 h-5 mr-2" />
          もう一度挑戦
        </Button>
        <Button
          size="lg"
          onClick={() => onNavigate('unitDetail', { topicId })}
          className="h-16 bg-blue-600 hover:bg-blue-700"
        >
          <Home className="w-5 h-5 mr-2" />
          単元詳細に戻る
        </Button>
      </div>

      {/* Passed Celebration */}
      {passed && (
        <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-xl mb-2">この単元をマスターしました！</h3>
          <p className="text-sm text-muted-foreground mb-4">
            次の単元に進む準備ができました
          </p>
          <Button onClick={() => onNavigate('learning')} className="bg-green-600 hover:bg-green-700">
            次の単元へ
          </Button>
        </Card>
      )}
    </div>
  );
}
