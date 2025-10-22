"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useTopicProgress } from "@/lib/hooks/use-topic-progress";
import { useTopicsMastery } from "@/lib/hooks/use-topic-mastery";
import { getSyllabusData } from "@/lib/syllabus";
import { Topic } from "@/lib/types";
import { useMemo } from "react";

interface LearningProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
}

export function Learning({ onNavigate }: LearningProps) {
  const { user } = useAuth();
  const { loading, getProgressPercentage, getProgress } = useTopicProgress(user?.id);
  const syllabusData = getSyllabusData();

  // Get all topic IDs for mastery calculation
  const allTopicIds = useMemo(() => {
    const ids: string[] = [];
    syllabusData.大分類.forEach(cat => {
      cat.中分類.forEach(mid => {
        mid.小分類.forEach(sub => {
          sub.トピック.forEach(topic => {
            ids.push(topic.id);
          });
        });
      });
    });
    return ids;
  }, []);

  const { masteryMap, loading: masteryLoading } = useTopicsMastery(user?.id, allTopicIds);

  // Calculate category progress
  const getCategoryProgress = (categoryId: string) => {
    const category = syllabusData.大分類.find(c => c.id === categoryId);
    if (!category) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    category.中分類.forEach(mid => {
      mid.小分類.forEach(sub => {
        sub.トピック.forEach(topic => {
          total++;
          const progress = getProgress(topic.id);
          const testCompleted = progress?.best_score !== null && progress?.best_score !== undefined && progress.best_score >= 70;
          if (progress?.explanation_completed && progress?.flashcard_completed && testCompleted) {
            completed++;
          }
        });
      });
    });

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  // Calculate overall progress
  const getOverallProgress = () => {
    let completed = 0;
    let total = 0;

    syllabusData.大分類.forEach(category => {
      category.中分類.forEach(mid => {
        mid.小分類.forEach(sub => {
          sub.トピック.forEach(topic => {
            total++;
            const progress = getProgress(topic.id);
            const testCompleted = progress?.latest_score !== null && progress?.latest_score !== undefined && progress.latest_score >= 70;
            if (progress?.explanation_completed && progress?.flashcard_completed && testCompleted) {
              completed++;
            }
          });
        });
      });
    });

    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const overall = getOverallProgress();

  // Get topic status
  const getTopicStatus = (topic: Topic, prevTopic?: Topic) => {
    const progress = getProgress(topic.id);

    // テスト完了は latest_score >= 70 で判定
    const testCompleted = progress?.latest_score !== null && progress?.latest_score !== undefined && progress.latest_score >= 70;

    if (progress?.explanation_completed && progress?.flashcard_completed && testCompleted) return 'completed';
    if (progress?.explanation_completed || progress?.flashcard_completed || progress?.latest_score !== null) return 'in_progress';

    // Check if locked (previous topic must be completed)
    if (prevTopic) {
      const prevProgress = getProgress(prevTopic.id);
      const prevTestCompleted = prevProgress?.latest_score !== null && prevProgress?.latest_score !== undefined && prevProgress.latest_score >= 70;
      if (!(prevProgress?.explanation_completed && prevProgress?.flashcard_completed && prevTestCompleted)) return 'locked';
    }

    return 'available';
  };

  // Get stars based on test score
  const getStars = (topicId: string): number => {
    const progress = getProgress(topicId);
    if (!progress?.best_score) return 0;

    if (progress.best_score >= 90) return 3;
    if (progress.best_score >= 70) return 2;
    if (progress.best_score >= 50) return 1;
    return 0;
  };

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
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-4 text-white animate-slide-in" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs">学習を始めよう！</span>
          </div>
          <h2 className="text-white mb-1 text-lg">全{overall.total}単元</h2>
          <p className="text-xs mb-2">基本情報技術者試験の完全マスター</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Progress value={overall.percentage} className="h-2 bg-white/30" />
            </div>
            <span className="text-xs">{overall.completed}/{overall.total}</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Categories */}
      {syllabusData.大分類.map((category, idx) => {
        const categoryProgress = getCategoryProgress(category.id);
        const categoryColors: Record<string, string> = {
          tech: '#3b82f6',
          mgmt: '#10b981',
          strategy: '#f59e0b',
        };
        const color = categoryColors[category.id] || '#6b7280';

        return (
          <Card
            key={category.id}
            className="overflow-hidden border-2 shadow-lg animate-slide-in"
            style={{
              borderColor: color,
              animationDelay: `${idx * 0.1}s`
            }}
          >
            {/* Category Header */}
            <div
              className="px-3 py-2 text-white flex items-center justify-between"
              style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(category.id)}</span>
                <div>
                  <h3 className="text-white text-sm font-semibold">{category.名称}</h3>
                  <p className="text-xs text-white/80">{category.説明}</p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-0 text-xs px-1.5 py-0">
                {categoryProgress.completed}/{categoryProgress.total}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50">
              <Progress value={categoryProgress.percentage} className="h-1.5" />
            </div>

            {/* Units */}
            <div className="p-3 space-y-2">
              {category.中分類.map((midCategory) => (
                <div key={midCategory.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-medium">{midCategory.名称}</h4>
                  </div>

                  {midCategory.小分類.map((subCategory) => (
                    <div key={subCategory.id}>
                      <div className="text-xs text-muted-foreground mb-1 ml-3">
                        {subCategory.名称}
                      </div>
                      <div className="space-y-1 ml-3">
                        {subCategory.トピック.map((topic, topicIdx) => {
                          const prevTopic = topicIdx > 0 ? subCategory.トピック[topicIdx - 1] : undefined;
                          const status = getTopicStatus(topic, prevTopic);
                          const progress = getProgressPercentage(topic.id);
                          const stars = getStars(topic.id);

                          // Get mastery color for this topic
                          const mastery = masteryMap.get(topic.id);
                          const masteryColor = mastery?.tier.color || color;
                          const masteryBgColor = mastery?.tier.bgColor || 'transparent';
                          const masteryBorderColor = mastery?.tier.borderColor || color;

                          return (
                            <Card
                              key={topic.id}
                              className={`p-2 hover:shadow-md transition-all ${
                                status === 'locked'
                                  ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                  : 'cursor-pointer hover:scale-[1.01]'
                              }`}
                              style={
                                status !== 'locked' && mastery && mastery.totalCompletions > 0
                                  ? { borderLeft: `4px solid ${masteryColor}` }
                                  : {}
                              }
                              onClick={() => {
                                if (status !== 'locked') {
                                  onNavigate('unitDetail', { topicId: topic.id });
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                  {status === 'completed' ? (
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: masteryColor }}>
                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                  ) : status === 'in_progress' ? (
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: masteryBgColor }}>
                                      <PlayCircle className="w-4 h-4" style={{ color: masteryColor }} />
                                    </div>
                                  ) : status === 'locked' ? (
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-200">
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center border-2" style={{ borderColor: masteryColor }}>
                                      <PlayCircle className="w-4 h-4" style={{ color: masteryColor }} />
                                    </div>
                                  )}
                                </div>

                                {/* Topic Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                      <h5 className="text-xs truncate">{topic.タイトル}</h5>
                                      {mastery && mastery.totalCompletions > 0 && (
                                        <Badge
                                          className="text-xs px-1 py-0 shrink-0"
                                          style={{
                                            backgroundColor: mastery.tier.bgColor,
                                            color: mastery.tier.color,
                                            borderColor: mastery.tier.borderColor,
                                          }}
                                        >
                                          ×{mastery.totalCompletions}
                                        </Badge>
                                      )}
                                    </div>
                                    {stars > 0 && (
                                      <div className="flex gap-0.5 ml-2">
                                        {[...Array(3)].map((_, i) => (
                                          <span key={i} className={`text-xs ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}>
                                            ⭐
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {status !== 'locked' && progress > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <Progress value={progress} className="h-1" />
                                      <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Helper function to get category icon
function getCategoryIcon(categoryId: string): string {
  const icons: Record<string, string> = {
    tech: '💻',
    mgmt: '📊',
    strategy: '🎯',
  };
  return icons[categoryId] || '📚';
}
