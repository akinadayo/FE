"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Lock, Target, Flame, Star, Users } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useAchievements, AchievementWithProgress } from "@/lib/hooks/use-achievements";
import { Skeleton } from "@/components/ui/skeleton";

interface AchievementsProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
}

export function Achievements({ }: AchievementsProps) {
  const { user } = useAuth();
  const { achievements, stats, loading } = useAchievements(user?.id);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak':
        return <Flame className="w-5 h-5" />;
      case 'accuracy':
        return <Target className="w-5 h-5" />;
      case 'completion':
        return <Star className="w-5 h-5" />;
      case 'social':
        return <Users className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak':
        return '#f59e0b'; // amber
      case 'accuracy':
        return '#3b82f6'; // blue
      case 'completion':
        return '#10b981'; // green
      case 'social':
        return '#ec4899'; // pink
      default:
        return '#6b7280'; // gray
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'streak':
        return '継続学習';
      case 'accuracy':
        return '正確性';
      case 'completion':
        return '達成度';
      case 'social':
        return 'ソーシャル';
      default:
        return 'その他';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getProgressText = (achievement: AchievementWithProgress) => {
    if (achievement.earned) {
      return `獲得日: ${formatDate(achievement.earned_at)}`;
    }

    const { current_value, target_value, category } = achievement;

    if (category === 'streak') {
      return `あと${target_value - current_value}日`;
    } else if (category === 'accuracy') {
      return `現在: ${current_value}% / 目標: ${target_value}%`;
    } else if (category === 'completion') {
      return `${current_value}/${target_value}単元`;
    } else if (category === 'social') {
      return `${current_value}/${target_value}人`;
    }

    return `${Math.round(achievement.progress)}%`;
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === 'earned') return achievement.earned;
    if (filter === 'locked') return !achievement.earned;
    return true;
  });

  // Group by category
  const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, AchievementWithProgress[]>);

  if (loading) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">🏆 達成バッジ</h2>
        <p className="text-sm text-muted-foreground mt-1">
          学習の成果をバッジで確認しましょう
        </p>
      </div>

      {/* Stats Overview */}
      <Card className="p-6" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.earned}</div>
            <p className="text-sm text-muted-foreground mt-1">獲得済み</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">{stats.total - stats.earned}</div>
            <p className="text-sm text-muted-foreground mt-1">未獲得</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.percentage}%</div>
            <p className="text-sm text-muted-foreground mt-1">達成率</p>
          </div>
        </div>
        <Progress value={stats.percentage} className="h-3 mt-4" />
      </Card>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">すべて ({achievements.length})</TabsTrigger>
          <TabsTrigger value="earned">獲得済み ({stats.earned})</TabsTrigger>
          <TabsTrigger value="locked">未獲得 ({stats.total - stats.earned})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-6 mt-6">
          {Object.keys(groupedAchievements).length === 0 ? (
            <Card className="p-12 text-center" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">バッジがありません</h3>
              <p className="text-sm text-muted-foreground">
                学習を続けてバッジを獲得しましょう！
              </p>
            </Card>
          ) : (
            Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ color: getCategoryColor(category) }}>
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="font-semibold text-lg">{getCategoryName(category)}</h3>
                  <Badge className="ml-2 text-xs" style={{ backgroundColor: getCategoryColor(category), opacity: 1 }}>
                    {categoryAchievements.filter(a => a.earned).length}/{categoryAchievements.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryAchievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`p-4 transition-all ${
                        achievement.earned
                          ? 'border-2 shadow-lg hover:shadow-xl'
                          : 'opacity-60 hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: achievement.earned ? '#fefce8' : '#ffffff',
                        borderColor: achievement.earned ? getCategoryColor(achievement.category) : undefined,
                        opacity: 1
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                            achievement.earned ? 'shadow-lg' : 'bg-gray-100'
                          }`}
                          style={{
                            backgroundColor: achievement.earned ? getCategoryColor(achievement.category) : '#f3f4f6',
                          }}
                        >
                          {achievement.earned ? (
                            achievement.icon || '🏆'
                          ) : (
                            <Lock className="w-8 h-8 text-gray-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{achievement.name}</h4>
                            {achievement.earned && (
                              <Badge className="bg-green-500 text-white border-0 text-xs shrink-0" style={{ backgroundColor: '#22c55e' }}>
                                獲得済み
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 mb-3">
                            {achievement.description}
                          </p>

                          {/* Progress */}
                          {!achievement.earned && (
                            <>
                              <Progress value={achievement.progress} className="h-2 mb-1" />
                              <p className="text-xs text-muted-foreground">
                                {getProgressText(achievement)}
                              </p>
                            </>
                          )}

                          {achievement.earned && (
                            <p className="text-xs text-muted-foreground">
                              {getProgressText(achievement)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
