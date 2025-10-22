"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, RotateCw, PenLine, Star, Target, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useTopicProgress } from "@/lib/hooks/use-topic-progress";
import { useTopicMastery } from "@/lib/hooks/use-topic-mastery";
import { getTopicById, getTopicPath, getNextTopic } from "@/lib/syllabus";

interface UnitDetailProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
  unitData?: { topicId: string };
}

export function UnitDetail({ onNavigate, unitData }: UnitDetailProps) {
  const { user } = useAuth();
  const { loading, getProgress, getProgressPercentage } = useTopicProgress(user?.id);
  const { mastery, loading: masteryLoading } = useTopicMastery(user?.id, unitData?.topicId);

  if (!unitData?.topicId) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">トピックが見つかりません</p>
          <Button onClick={() => onNavigate('learning')} className="mt-4">
            学習画面に戻る
          </Button>
        </Card>
      </div>
    );
  }

  const topic = getTopicById(unitData.topicId);
  const topicPath = getTopicPath(unitData.topicId);
  const progress = getProgress(unitData.topicId);
  const progressPercentage = getProgressPercentage(unitData.topicId);
  const nextTopic = getNextTopic(unitData.topicId);

  if (!topic) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">トピックデータが見つかりません</p>
          <Button onClick={() => onNavigate('learning')} className="mt-4">
            学習画面に戻る
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">データ読み込み中...</p>
        </Card>
      </div>
    );
  }

  const explanationCompleted = progress?.explanation_completed || false;
  const flashcardCompleted = progress?.flashcard_completed || false;
  const testScore = progress?.best_score;

  // Derive status from completion flags
  const status = !progress || (!explanationCompleted && !flashcardCompleted && !testScore)
    ? 'not_started'
    : (explanationCompleted && flashcardCompleted && testScore && testScore >= 70)
    ? 'completed'
    : 'in_progress';

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white border-0">完了</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 text-white border-0">進行中</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white border-0">未開始</Badge>;
    }
  };

  return (
    <div className="space-y-4 pb-4 md:pb-6 max-w-4xl mx-auto">
      {/* Hero Section */}
      <Card className="overflow-hidden text-white border-0 shadow-xl" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)' }}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              {topicPath && (
                <Badge className="bg-white/30 text-white border-0 mb-1.5 text-xs px-2 py-0">
                  {topicPath.category} / {topicPath.midCategory}
                </Badge>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white text-xl mb-1">{topic.タイトル}</h1>
                {mastery && mastery.totalCompletions > 0 && (
                  <Badge
                    className="mb-1 text-xs px-2 py-0.5"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    {mastery.tier.tierName} ×{mastery.totalCompletions}
                  </Badge>
                )}
              </div>
              <p className="text-xs">{topicPath?.subCategory || '基本から応用まで完全マスター'}</p>
            </div>
            <div className="text-3xl animate-float">📘</div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur">
              <div className="text-lg mb-0.5">📚</div>
              <p className="text-xs">学習項目</p>
              <p className="text-sm font-semibold">{topic.内容.length}項目</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur">
              <div className="text-lg mb-0.5">🏷️</div>
              <p className="text-xs">キーワード</p>
              <p className="text-sm font-semibold">{topic.キーワード.length}個</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur">
              <div className="text-lg mb-0.5">📊</div>
              <p className="text-xs">進捗</p>
              <p className="text-sm font-semibold">{progressPercentage}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Content */}
      <Card className="p-3 border-2">
        <h2 className="mb-2 text-sm font-semibold">学習内容</h2>
        <div className="space-y-2">
          {topic.内容.map((item, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-xs flex-1">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Learning Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Card
          className="p-4 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
          style={{ background: 'linear-gradient(to bottom right, #eff6ff, #eef2ff)' }}
          onClick={() => onNavigate('explanation', { topicId: topic.id })}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3b82f6' }}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="mb-0.5 text-sm font-semibold">解説を読む</h3>
              <p className="text-xs text-muted-foreground">詳しい説明で理解を深める</p>
            </div>
            {explanationCompleted && (
              <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0">完了</Badge>
            )}
          </div>
        </Card>

        <Card
          className="p-4 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
          style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #ecfdf5)' }}
          onClick={() => onNavigate('flashcard', { topicId: topic.id })}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
              <RotateCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="mb-0.5 text-sm font-semibold">練習問題</h3>
              <p className="text-xs text-muted-foreground">カードで繰り返し学習</p>
            </div>
            {flashcardCompleted && (
              <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0">完了</Badge>
            )}
          </div>
        </Card>

        <Card
          className="p-4 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 !opacity-100"
          style={{ background: 'linear-gradient(to bottom right, #faf5ff, #fdf2f8)' }}
          onClick={() => onNavigate('test', { topicId: topic.id })}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center" style={{ backgroundColor: '#a855f7' }}>
              <PenLine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="mb-0.5 text-sm font-semibold">確認テスト</h3>
              <p className="text-xs text-muted-foreground">理解度を確認しよう</p>
            </div>
            {testScore !== null && testScore !== undefined && (
              <Badge className={`${testScore >= 70 ? 'bg-green-500' : 'bg-yellow-500'} text-white border-0 text-xs px-2 py-0`}>
                {testScore}点
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="p-3 border-2 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-semibold">あなたの進捗</h2>
          <div className="ml-auto">{getStatusBadge()}</div>
        </div>

        <div className="space-y-2 mb-3">
          {/* Explanation */}
          <div className={`flex items-center justify-between p-2 rounded-lg border-2 ${
            explanationCompleted
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm ${
                explanationCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {explanationCompleted ? '✓' : '○'}
              </div>
              <div>
                <p className="text-sm font-medium">解説</p>
                <p className="text-xs text-muted-foreground">
                  {explanationCompleted ? '完了' : '未完了'}
                </p>
              </div>
            </div>
            {explanationCompleted && <Star className="w-4 h-4 text-green-500 fill-green-500" />}
          </div>

          {/* Flashcard */}
          <div className={`flex items-center justify-between p-2 rounded-lg border-2 ${
            flashcardCompleted
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm ${
                flashcardCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {flashcardCompleted ? '✓' : '○'}
              </div>
              <div>
                <p className="text-sm font-medium">練習</p>
                <p className="text-xs text-muted-foreground">
                  {flashcardCompleted ? '完了' : '未完了'}
                </p>
              </div>
            </div>
            {flashcardCompleted && <Star className="w-4 h-4 text-green-500 fill-green-500" />}
          </div>

          {/* Test */}
          <div className={`flex items-center justify-between p-2 rounded-lg border-2 ${
            testScore !== null && testScore !== undefined
              ? testScore >= 70 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm ${
                testScore !== null && testScore !== undefined
                  ? testScore >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                  : 'bg-gray-300'
              }`}>
                {testScore !== null && testScore !== undefined ? '✓' : '○'}
              </div>
              <div>
                <p className="text-sm font-medium">テスト</p>
                <p className="text-xs text-muted-foreground">
                  {testScore !== null && testScore !== undefined ? `スコア: ${testScore}%` : '未受験'}
                </p>
              </div>
            </div>
            {testScore !== null && testScore !== undefined && (
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < (testScore >= 90 ? 3 : testScore >= 70 ? 2 : testScore >= 50 ? 1 : 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-center mt-1.5">
          全体の進捗: {progressPercentage}%
        </p>
      </Card>

      {/* Keywords */}
      <Card className="p-3 border-2">
        <h2 className="mb-2 text-sm font-semibold">重要キーワード</h2>
        <div className="flex flex-wrap gap-1.5">
          {topic.キーワード.map((keyword, index) => (
            <Badge key={index} className="bg-blue-100 text-blue-700 border-blue-300 text-xs px-2 py-0.5">
              {keyword}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Next Topic - Only show when all learning is completed */}
      {explanationCompleted && flashcardCompleted && testScore !== null && testScore !== undefined && testScore >= 70 && nextTopic && (
        <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 border-2 shadow-lg">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl mb-2 font-bold">この単元をマスターしました！</h3>
          <p className="text-sm text-muted-foreground mb-4">
            解説・練習問題・テストを全てクリアしました。<br />次の単元に進む準備ができています。
          </p>
          <Button
            onClick={() => onNavigate('unitDetail', { topicId: nextTopic.id })}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            次の単元へ: {nextTopic.タイトル}
          </Button>
        </Card>
      )}
    </div>
  );
}
