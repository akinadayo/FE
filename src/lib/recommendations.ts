import { createClient } from '@/lib/supabase/client';
import { getAllTopicsWithCategory, type TopicWithCategory } from '@/lib/syllabus';
import type { TopicProgress } from '@/lib/types';

export interface RecommendedTopic {
  topicId: string;
  title: string;
  reason: 'weak_area' | 'next_to_learn' | 'review_needed' | 'continue_learning';
  reasonText: string;
  priority: number; // 1-5, 5が最高優先度
  category?: string;
  averageScore?: number;
  lastStudiedDays?: number;
  masteryLevel?: number; // 0-100
}

/**
 * ユーザーにおすすめのトピックを取得
 */
export async function getRecommendedTopics(
  userId: string | undefined,
  limit: number = 3
): Promise<RecommendedTopic[]> {
  if (!userId) return [];

  const supabase = createClient();
  const recommendations: RecommendedTopic[] = [];

  try {
    // 1. ユーザーの進捗データを取得
    const { data: progress, error: progressError } = await supabase
      .from('topic_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // 2. 全トピックを取得
    const allTopics = getAllTopicsWithCategory();

    // 3. 弱点分野を検出（テスト正解率が低い）
    const weakAreas = detectWeakAreas(progress || [], allTopics);
    recommendations.push(...weakAreas);

    // 4. 復習が必要なトピックを検出（7日以上学習していない完了済みトピック）
    const reviewNeeded = detectReviewNeeded(progress || [], allTopics);
    recommendations.push(...reviewNeeded);

    // 5. 次に学ぶべきトピックを提案（未完了トピック）
    const nextToLearn = suggestNextTopics(progress || [], allTopics);
    recommendations.push(...nextToLearn);

    // 6. 優先度でソートして上位を返す
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recommended topics:', error);
    return [];
  }
}

/**
 * 弱点分野を検出（正解率が70%未満）
 */
function detectWeakAreas(
  progress: TopicProgress[],
  allTopics: TopicWithCategory[]
): RecommendedTopic[] {
  return progress
    .filter(p => {
      // テストを受けているが正解率が70%未満
      return p.total_tests_taken > 0 && (p.average_score || 0) < 70;
    })
    .map(p => {
      const topic = allTopics.find(t => t.id === p.topic_id);
      if (!topic) return null;

      return {
        topicId: p.topic_id,
        title: topic.タイトル,
        reason: 'weak_area' as const,
        reasonText: `正解率${Math.round(p.average_score || 0)}%（目標: 70%以上）`,
        priority: 5, // 最高優先度
        category: topic.大分類,
        averageScore: p.average_score || 0,
        masteryLevel: calculateMasteryLevel(p),
      };
    })
    .filter((r): r is RecommendedTopic => r !== null);
}

/**
 * 復習が必要なトピックを検出（7日以上学習していない）
 */
function detectReviewNeeded(
  progress: TopicProgress[],
  allTopics: TopicWithCategory[]
): RecommendedTopic[] {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return progress
    .filter(p => {
      // 完了済みで、7日以上更新がない
      const isCompleted = p.explanation_completed && p.flashcard_completed && p.test_completed;
      if (!isCompleted) return false;

      const lastUpdated = new Date(p.updated_at);
      return lastUpdated < sevenDaysAgo;
    })
    .map(p => {
      const topic = allTopics.find(t => t.id === p.topic_id);
      if (!topic) return null;

      const lastUpdated = new Date(p.updated_at);
      const daysSinceLastStudy = Math.floor(
        (now.getTime() - lastUpdated.getTime()) / (24 * 60 * 60 * 1000)
      );

      return {
        topicId: p.topic_id,
        title: topic.タイトル,
        reason: 'review_needed' as const,
        reasonText: `${daysSinceLastStudy}日前に学習`,
        priority: 4,
        category: topic.大分類,
        lastStudiedDays: daysSinceLastStudy,
        averageScore: p.average_score || 0,
        masteryLevel: calculateMasteryLevel(p),
      };
    })
    .filter((r): r is RecommendedTopic => r !== null);
}

/**
 * 次に学ぶべきトピックを提案
 */
function suggestNextTopics(
  progress: TopicProgress[],
  allTopics: TopicWithCategory[]
): RecommendedTopic[] {
  const completedTopicIds = new Set(
    progress
      .filter(p => p.explanation_completed && p.flashcard_completed && p.test_completed)
      .map(p => p.topic_id)
  );

  const inProgressTopicIds = new Set(
    progress
      .filter(p => {
        const isCompleted = p.explanation_completed && p.flashcard_completed && p.test_completed;
        const hasStarted = p.explanation_completed || p.flashcard_completed || p.test_completed;
        return hasStarted && !isCompleted;
      })
      .map(p => p.topic_id)
  );

  // 学習中のトピックを最優先
  const continueTopics = Array.from(inProgressTopicIds)
    .map(topicId => {
      const topic = allTopics.find(t => t.id === topicId);
      if (!topic) return null;

      const prog = progress.find(p => p.topic_id === topicId);

      return {
        topicId,
        title: topic.タイトル,
        reason: 'continue_learning' as const,
        reasonText: '学習を続けましょう',
        priority: 4,
        category: topic.大分類,
        masteryLevel: calculateMasteryLevel(prog),
      };
    })
    .filter((r): r is RecommendedTopic => r !== null);

  // 未開始のトピックを次に学ぶべきトピックとして提案（順序順）
  const nextTopics = allTopics
    .filter(topic => !completedTopicIds.has(topic.id) && !inProgressTopicIds.has(topic.id))
    .slice(0, 3)
    .map(topic => ({
      topicId: topic.id,
      title: topic.タイトル,
      reason: 'next_to_learn' as const,
      reasonText: '次に学ぶのにおすすめ',
      priority: 3,
      category: topic.大分類,
      masteryLevel: 0,
    }));

  return [...continueTopics, ...nextTopics];
}

/**
 * 習熟度を計算（0-100）
 */
export function calculateMasteryLevel(progress: TopicProgress): number {
  if (!progress) return 0;

  let score = 0;

  // 解説完了: +20点
  if (progress.explanation_completed) score += 20;

  // フラッシュカード完了: +20点
  if (progress.flashcard_completed) score += 20;

  // テスト完了: +20点
  if (progress.test_completed) score += 20;

  // テスト正解率: 最大40点
  if (progress.average_score) {
    score += Math.min(40, (progress.average_score / 100) * 40);
  }

  return Math.min(100, Math.round(score));
}

/**
 * 習熟度レベルを取得（回数ベース）
 * 0: 未学習
 * 1-2: 初級（青）
 * 3-4: 中級（緑）
 * 5-7: 上級（黄色）
 * 8+: マスター（金色）
 */
export function getMasteryTier(totalCompletions: number): {
  tier: number;
  tierName: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  if (totalCompletions === 0) {
    return {
      tier: 0,
      tierName: '未学習',
      color: '#9ca3af',
      bgColor: '#f3f4f6',
      borderColor: '#e5e7eb',
    };
  } else if (totalCompletions <= 2) {
    return {
      tier: 1,
      tierName: '初級',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
    };
  } else if (totalCompletions <= 4) {
    return {
      tier: 2,
      tierName: '中級',
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0',
    };
  } else if (totalCompletions <= 7) {
    return {
      tier: 3,
      tierName: '上級',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#fde68a',
    };
  } else {
    return {
      tier: 4,
      tierName: 'マスター',
      color: '#eab308',
      bgColor: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)',
      borderColor: '#fde047',
    };
  }
}

/**
 * トピックの総完了回数を計算
 */
export function calculateTotalCompletions(progress: TopicProgress): number {
  if (!progress) return 0;

  let count = 0;

  // 解説完了回数（最大1回としてカウント）
  if (progress.explanation_completed) count += 1;

  // フラッシュカード完了回数（最大1回としてカウント）
  if (progress.flashcard_completed) count += 1;

  // テスト完了回数（実際の受験回数）
  if (progress.total_tests_taken) count += progress.total_tests_taken;

  return count;
}
