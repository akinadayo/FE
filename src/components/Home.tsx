"use client";

import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Flame, Zap, Trophy, AlertCircle, TrendingUp, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useUserStats } from "@/lib/hooks/use-user-stats";
import { useAchievements } from "@/lib/hooks/use-achievements";
import { useRecommendations } from "@/lib/hooks/use-recommendations";

interface HomeProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
}

function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function Home({ onNavigate }: HomeProps) {
  const { user } = useAuth();
  const { stats, todayMinutes, loading } = useUserStats(user?.id);
  const { achievements, stats: achievementStats } = useAchievements(user?.id);
  const { recommendations, loading: recLoading } = useRecommendations(user?.id, 1);

  // Calculate daily goal progress (20 minutes default)
  const dailyGoalMinutes = 20;
  const dailyProgress = Math.min((todayMinutes / dailyGoalMinutes) * 100, 100);
  const remainingMinutes = Math.max(dailyGoalMinutes - todayMinutes, 0);

  // Calculate total topics
  const completedTopics = stats?.completed_topics || 0;
  const totalTopics = 48; // This should come from syllabus data

  if (loading) {
    return (
      <div className="space-y-6 pb-4 md:pb-6">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">データ読み込み中...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 md:pb-6">
      {/* Hero Card with Daily Goal */}
      <Card className="overflow-hidden text-white border-0 shadow-xl" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)' }}>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs">今日の目標</span>
              </div>
              <h2 className="text-white text-xl">20分</h2>
            </div>
            <div className="text-3xl animate-float">🎯</div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span>{formatMinutes(todayMinutes)} / {formatMinutes(dailyGoalMinutes)}</span>
              <span>{Math.round(dailyProgress)}%</span>
            </div>
            <Progress value={dailyProgress} className="h-2 bg-white/30" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-3 h-3" />
            <span>
              {remainingMinutes > 0
                ? `あと${remainingMinutes}分で目標達成！`
                : '目標達成！素晴らしい！🎉'}
            </span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #eef2ff)', opacity: 1 }}>
          <div className="text-xl mb-1">⏱️</div>
          <p className="text-xs text-muted-foreground mb-1">総学習時間</p>
          <p className="text-sm font-semibold">
            {formatMinutes((stats?.total_hours || 0) * 60)}
          </p>
        </Card>

        <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow" style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #ecfdf5)', opacity: 1 }}>
          <div className="text-xl mb-1">✅</div>
          <p className="text-xs text-muted-foreground mb-1">完了単元</p>
          <p className="text-sm font-semibold">{completedTopics}/{totalTopics}</p>
        </Card>

        <Card className="p-3 text-center bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-lg transition-shadow" style={{ background: 'linear-gradient(to bottom right, #fefce8, #fef3c7)', opacity: 1 }}>
          <div className="text-xl mb-1">📊</div>
          <p className="text-xs text-muted-foreground mb-1">平均正解率</p>
          <p className="text-sm font-semibold">
            {stats?.avg_test_score ? `${Math.round(stats.avg_test_score)}%` : '-'}
          </p>
        </Card>
      </div>

      {/* Today's Recommendation */}
      {recommendations.length > 0 ? (
        <Card
          className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer bg-gradient-to-br from-white to-blue-50"
          style={{
            borderColor: recommendations[0].reason === 'weak_area' ? '#ef4444' :
                        recommendations[0].reason === 'review_needed' ? '#f59e0b' : '#6DBFF2',
            background: 'linear-gradient(to bottom right, #ffffff, #eff6ff)'
          }}
          onClick={() => onNavigate('unitDetail', { topicId: recommendations[0].topicId })}
        >
          <div className="px-3 py-1.5 text-white" style={{
            background: recommendations[0].reason === 'weak_area'
              ? 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
              : recommendations[0].reason === 'review_needed'
              ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
              : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
          }}>
            <div className="flex items-center gap-2">
              {recommendations[0].reason === 'weak_area' && <AlertCircle className="w-3 h-3" />}
              {recommendations[0].reason === 'review_needed' && <RotateCcw className="w-3 h-3" />}
              {recommendations[0].reason === 'next_to_learn' && <TrendingUp className="w-3 h-3" />}
              {recommendations[0].reason === 'continue_learning' && <BookOpen className="w-3 h-3" />}
              <span className="text-xs">
                {recommendations[0].reason === 'weak_area' && '弱点分野'}
                {recommendations[0].reason === 'review_needed' && '復習推奨'}
                {recommendations[0].reason === 'next_to_learn' && '次のステップ'}
                {recommendations[0].reason === 'continue_learning' && '学習継続'}
              </span>
              <Badge className="ml-auto bg-white/20 text-white border-0 text-xs px-1.5 py-0">
                <Zap className="w-2.5 h-2.5 mr-0.5" />
                優先度 {recommendations[0].priority}
              </Badge>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl animate-float">
                {recommendations[0].reason === 'weak_area' && '⚠️'}
                {recommendations[0].reason === 'review_needed' && '🔄'}
                {recommendations[0].reason === 'next_to_learn' && '📘'}
                {recommendations[0].reason === 'continue_learning' && '📖'}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-semibold">{recommendations[0].title}</h3>
                <p className="text-xs text-muted-foreground">{recommendations[0].reasonText}</p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer bg-gradient-to-br from-white to-blue-50"
          style={{ borderColor: '#6DBFF2', background: 'linear-gradient(to bottom right, #ffffff, #eff6ff)' }}
          onClick={() => onNavigate('learning')}
        >
          <div className="px-3 py-1.5 text-white" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)' }}>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3 h-3" />
              <span className="text-xs">今日のおすすめ</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl animate-float">📘</div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-semibold">学習を始めましょう</h3>
                <p className="text-xs text-muted-foreground">学習コンテンツから始めましょう</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Learning Streak */}
      <Card className="overflow-hidden border-2 shadow-lg" style={{ borderColor: '#99F2E9', backgroundColor: '#ffffff' }}>
        <div className="px-3 py-1.5 text-white" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)' }}>
          <div className="flex items-center gap-2">
            <Flame className="w-3 h-3" />
            <span className="text-xs">学習ストリーク</span>
          </div>
        </div>

        <div className="p-3">
          <div className="text-center space-y-2">
            <div className="text-2xl">🔥</div>
            <div>
              <p className="text-lg mb-0.5 font-semibold">{stats?.total_study_days || 0}日連続！</p>
              <p className="text-xs text-muted-foreground">
                {stats?.total_study_days && stats.total_study_days > 0
                  ? 'このまま継続しよう！'
                  : '今日から始めましょう！'}
              </p>
            </div>
            {stats?.total_study_days && stats.total_study_days > 0 && (
              <div className="flex gap-1 justify-center flex-wrap">
                {[...Array(Math.min(stats.total_study_days, 7))].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-lg flex items-center justify-center text-sm animate-slide-in" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', animationDelay: `${i * 0.1}s` }}>
                    🔥
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card
        className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
        style={{ borderColor: '#f59e0b', backgroundColor: '#ffffff' }}
        onClick={() => onNavigate('achievements')}
      >
        <div className="px-3 py-1.5 text-white" style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' }}>
          <div className="flex items-center gap-2">
            <Trophy className="w-3 h-3" />
            <span className="text-xs">達成バッジ</span>
            <Badge className="ml-auto bg-white/20 text-white border-0 text-xs px-1.5 py-0">
              {achievementStats.earned}/{achievementStats.total}
            </Badge>
          </div>
        </div>

        <div className="p-3">
          {achievementStats.earned === 0 ? (
            <div className="text-center py-2">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-xs text-muted-foreground">学習を続けてバッジを獲得しよう！</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {achievements
                  .filter(a => a.earned)
                  .slice(-3)
                  .reverse()
                  .map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-2xl shadow-md"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
                      title={achievement.name}
                    >
                      {achievement.icon || '🏆'}
                    </div>
                  ))}
              </div>
              <Progress value={achievementStats.percentage} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground text-center">
                達成率 {achievementStats.percentage}%
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50" style={{ borderColor: '#85D3F2', background: 'linear-gradient(to right, #eff6ff, #ecfeff)' }}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">⭐</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold">レベル {1}</span>
              <span className="text-xs text-muted-foreground">
                次のレベルまで {0} XP
              </span>
            </div>
            <Progress
              value={0}
              className="h-2"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
