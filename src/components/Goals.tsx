"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Target, TrendingUp, Calendar as CalendarIcon, CheckCircle2, AlertCircle, Trophy } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useGoals } from "@/lib/hooks/use-goals";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface GoalsProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
}

export function Goals({ }: GoalsProps) {
  const { user } = useAuth();
  const {
    goals,
    loading,
    examDate,
    setExamDate: updateExamDate,
    weeklyGoal,
    setWeeklyGoal: updateWeeklyGoal,
    monthlyGoal,
    setMonthlyGoal: updateMonthlyGoal,
    prediction,
  } = useGoals(user?.id);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showWeeklyInput, setShowWeeklyInput] = useState(false);
  const [showMonthlyInput, setShowMonthlyInput] = useState(false);
  const [tempWeeklyGoal, setTempWeeklyGoal] = useState(weeklyGoal?.toString() || "");
  const [tempMonthlyGoal, setTempMonthlyGoal] = useState(monthlyGoal?.toString() || "");

  const handleSaveWeeklyGoal = async () => {
    const minutes = parseInt(tempWeeklyGoal);
    if (!isNaN(minutes) && minutes > 0) {
      await updateWeeklyGoal(minutes);
      setShowWeeklyInput(false);
    }
  };

  const handleSaveMonthlyGoal = async () => {
    const minutes = parseInt(tempMonthlyGoal);
    if (!isNaN(minutes) && minutes > 0) {
      await updateMonthlyGoal(minutes);
      setShowMonthlyInput(false);
    }
  };

  const handleSetExamDate = async (date: Date | undefined) => {
    if (date) {
      await updateExamDate(date);
      setShowDatePicker(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}分`;
    if (mins === 0) return `${hours}時間`;
    return `${hours}時間${mins}分`;
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">🎯 学習目標</h2>
        <p className="text-sm text-muted-foreground mt-1">
          目標を設定して計画的に学習を進めましょう
        </p>
      </div>

      {/* Exam Date Card */}
      <Card className="p-4 md:p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">試験日</h3>
          </div>
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="!opacity-100">
                {examDate ? '変更' : '設定'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={examDate || undefined}
                onSelect={handleSetExamDate}
                initialFocus
                locale={ja}
              />
            </PopoverContent>
          </Popover>
        </div>

        {examDate ? (
          <>
            <p className="text-2xl font-bold mb-2">
              {format(examDate, 'yyyy年MM月dd日', { locale: ja })}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">残り日数</p>
                <p className="text-xl font-bold text-blue-600">{prediction?.daysUntilExam || 0}日</p>
              </div>
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">1日あたりの目標時間</p>
                <p className="text-xl font-bold text-blue-600">
                  {prediction?.recommendedDailyMinutes ? formatTime(prediction.recommendedDailyMinutes) : '---'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">試験日を設定してください</p>
        )}
      </Card>

      {/* Weekly and Monthly Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Goal */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">週間目標</h3>
            </div>
            {!showWeeklyInput ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTempWeeklyGoal(weeklyGoal?.toString() || "");
                  setShowWeeklyInput(true);
                }}
                className="!opacity-100"
              >
                {weeklyGoal ? '変更' : '設定'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowWeeklyInput(false)}
                  className="!opacity-100"
                >
                  キャンセル
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveWeeklyGoal}
                  className="!opacity-100"
                >
                  保存
                </Button>
              </div>
            )}
          </div>

          {showWeeklyInput ? (
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="分単位で入力"
                value={tempWeeklyGoal}
                onChange={(e) => setTempWeeklyGoal(e.target.value)}
                className="!opacity-100"
              />
              <p className="text-xs text-muted-foreground">
                例: 420分 = 7時間
              </p>
            </div>
          ) : weeklyGoal ? (
            <>
              <p className="text-2xl font-bold mb-2">{formatTime(weeklyGoal)}</p>
              {goals?.weeklyProgress !== undefined && (
                <>
                  <div className="mb-2">
                    <Progress value={(goals.weeklyProgress / weeklyGoal) * 100} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      進捗: {formatTime(goals.weeklyProgress)} / {formatTime(weeklyGoal)}
                    </span>
                    {goals.weeklyProgress >= weeklyGoal ? (
                      <Badge className="bg-green-500 text-white">達成！</Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        あと{formatTime(weeklyGoal - goals.weeklyProgress)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">週間目標を設定してください</p>
          )}
        </Card>

        {/* Monthly Goal */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold">月間目標</h3>
            </div>
            {!showMonthlyInput ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTempMonthlyGoal(monthlyGoal?.toString() || "");
                  setShowMonthlyInput(true);
                }}
                className="!opacity-100"
              >
                {monthlyGoal ? '変更' : '設定'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMonthlyInput(false)}
                  className="!opacity-100"
                >
                  キャンセル
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveMonthlyGoal}
                  className="!opacity-100"
                >
                  保存
                </Button>
              </div>
            )}
          </div>

          {showMonthlyInput ? (
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="分単位で入力"
                value={tempMonthlyGoal}
                onChange={(e) => setTempMonthlyGoal(e.target.value)}
                className="!opacity-100"
              />
              <p className="text-xs text-muted-foreground">
                例: 1800分 = 30時間
              </p>
            </div>
          ) : monthlyGoal ? (
            <>
              <p className="text-2xl font-bold mb-2">{formatTime(monthlyGoal)}</p>
              {goals?.monthlyProgress !== undefined && (
                <>
                  <div className="mb-2">
                    <Progress value={(goals.monthlyProgress / monthlyGoal) * 100} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      進捗: {formatTime(goals.monthlyProgress)} / {formatTime(monthlyGoal)}
                    </span>
                    {goals.monthlyProgress >= monthlyGoal ? (
                      <Badge className="bg-green-500 text-white">達成！</Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        あと{formatTime(monthlyGoal - goals.monthlyProgress)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">月間目標を設定してください</p>
          )}
        </Card>
      </div>

      {/* Progress Prediction */}
      {examDate && prediction && (
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">進捗予測</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">総単元数</p>
              <p className="text-2xl font-bold">{prediction.totalTopics}単元</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">完了済み</p>
              <p className="text-2xl font-bold text-blue-600">{prediction.completedTopics}単元</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">残り</p>
              <p className="text-2xl font-bold text-orange-600">
                {prediction.totalTopics - prediction.completedTopics}単元
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {prediction.isOnTrack ? (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">順調です！</p>
                  <p className="text-sm text-green-700 mt-1">
                    このペースで学習を続ければ、試験日までに全単元を完了できます。
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">ペースアップが必要です</p>
                  <p className="text-sm text-orange-700 mt-1">
                    試験日までに全単元を完了するには、1日あたり
                    <span className="font-semibold"> {formatTime(prediction.recommendedDailyMinutes)} </span>
                    の学習が推奨されます。
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">完了率</p>
              <Progress value={(prediction.completedTopics / prediction.totalTopics) * 100} className="h-3 mb-1" />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round((prediction.completedTopics / prediction.totalTopics) * 100)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Goal Achievement History */}
      {goals?.achievements && goals.achievements.length > 0 && (
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-3">🏆 達成履歴</h3>
          <div className="space-y-2">
            {goals.achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl">
                    🎉
                  </div>
                  <div>
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(achievement.achieved_at), 'yyyy年MM月dd日', { locale: ja })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-yellow-500 text-white">達成</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
