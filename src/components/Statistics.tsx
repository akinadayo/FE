"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/contexts/auth-context";
import { useStatistics } from "@/lib/hooks/use-statistics";
import { Skeleton } from "@/components/ui/skeleton";
import { Heatmap } from "@/components/ui/heatmap";
import { useHeatmapData } from "@/lib/hooks/use-heatmap-data";

interface StatisticsProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
}

export function Statistics({ }: StatisticsProps) {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { data, loading, error } = useStatistics(user?.id, period);
  const { data: heatmapData, loading: heatmapLoading } = useHeatmapData(user?.id, 365);

  if (loading) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-24 ml-auto" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-5xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">統計データの読み込みに失敗しました</p>
        </Card>
      </div>
    );
  }

  // データを表示用に変換
  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;

  // 日別学習時間データ（直近の期間分）
  const recentDailyData = data.dailyStudyTime.slice(-periodDays);

  // 週/月/年の表示に応じてラベルを調整
  const chartData = recentDailyData.map((item) => {
    const date = new Date(item.date);
    let label = '';

    if (period === 'week') {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      label = days[date.getDay()];
    } else if (period === 'month') {
      label = `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      label = `${date.getMonth() + 1}月`;
    }

    return {
      label,
      hours: item.hours + (item.minutes / 60),
      totalMinutes: item.totalMinutes,
    };
  });

  // 時間のフォーマット
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-5xl mx-auto">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 学習統計</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {period === 'week' ? '直近7日間' : period === 'month' ? '直近30日間' : '直近1年間'}の学習データ
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as 'week' | 'month' | 'year')}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">週</SelectItem>
            <SelectItem value="month">月</SelectItem>
            <SelectItem value="year">年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">総学習時間</p>
          <p className="text-2xl font-bold mt-1">{formatTime(data.totalStudyMinutes)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">1日平均</p>
          <p className="text-2xl font-bold mt-1">{formatTime(data.averageDailyMinutes)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">学習ストリーク</p>
          <p className="text-2xl font-bold mt-1">{data.currentStreak}日</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">完了単元</p>
          <p className="text-2xl font-bold mt-1">{data.totalCompletedTopics}個</p>
        </Card>
      </div>

      {/* Study Time Chart */}
      <Card className="p-4 md:p-6">
        <h3 className="mb-4 font-semibold">📚 学習時間の推移</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: '時間', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}時間`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            学習データがありません
          </div>
        )}
      </Card>

      {/* Accuracy Trend */}
      <Card className="p-4 md:p-6">
        <h3 className="mb-4 font-semibold">📈 正解率の推移</h3>
        {data.weeklyAccuracy.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.weeklyAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: '正解率 (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            テスト結果がありません
          </div>
        )}
      </Card>

      {/* Learning Calendar Heatmap */}
      <Card className="p-4 md:p-6">
        <h3 className="mb-4 font-semibold">📅 学習カレンダー</h3>
        {heatmapLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : heatmapData.length > 0 ? (
          <Heatmap data={heatmapData} />
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            学習データがありません
          </div>
        )}
      </Card>

      {/* Category Proficiency */}
      <Card className="p-4 md:p-6">
        <h3 className="mb-4 font-semibold">🎯 分野別習熟度</h3>
        <div className="space-y-4">
          {data.categoryMastery.map((category) => (
            <div key={category.categoryId} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-xs text-muted-foreground">
                    ({category.completedTopics}/{category.totalTopics}単元)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    平均スコア: {category.averageScore}%
                  </span>
                  <span className="font-semibold">{category.mastery}%</span>
                </div>
              </div>
              <Progress value={category.mastery} className="h-3" />
            </div>
          ))}
          {data.categoryMastery.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              学習データがありません
            </p>
          )}
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-4">
        <h3 className="mb-3">🏆 達成バッジ</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center text-2xl">
              🔥
            </div>
            <span className="text-xs">7日連続</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <span className="text-xs">100時間</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-950 rounded-full flex items-center justify-center text-2xl">
              👑
            </div>
            <span className="text-xs">正解王</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
