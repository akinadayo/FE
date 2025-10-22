import { createClient } from '@/lib/supabase/client';

/**
 * バッジ獲得条件の型定義
 */
interface AchievementRequirement {
  days?: number;       // 連続学習日数
  score?: number;      // 必要なスコア
  count?: number;      // 必要な回数
  avg_score?: number;  // 平均正解率
  topics?: number;     // 完了単元数
  friends?: number;    // フレンド数
}

interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'completion' | 'social';
  requirement: AchievementRequirement;
}

interface UserStats {
  total_study_days: number;
  completed_topics: number;
  avg_test_score: number;
  perfect_score_count: number;
}

/**
 * 全バッジの獲得条件をチェックして、新しく獲得したバッジを返す
 */
export async function checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
  const supabase = createClient();
  const newlyEarnedAchievements: Achievement[] = [];

  try {
    // 1. すべてのバッジ定義を取得
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('category');

    if (achievementsError) throw achievementsError;
    if (!achievements) return [];

    // 2. 既に獲得済みのバッジを取得
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_key')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    const earnedAchievementKeys = new Set(
      userAchievements?.map(ua => ua.achievement_key) || []
    );

    // 3. ユーザーの統計情報を取得
    const stats = await getUserStats(userId);
    const friendCount = await getFriendCount(userId);

    // 4. 各バッジの獲得条件をチェック
    for (const achievement of achievements) {
      // 既に獲得済みならスキップ
      if (earnedAchievementKeys.has(achievement.achievement_key)) {
        continue;
      }

      const earned = await checkAchievementCondition(
        achievement,
        stats,
        friendCount,
        userId
      );

      if (earned) {
        // バッジを獲得
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_key: achievement.achievement_key,
          });

        if (!insertError) {
          newlyEarnedAchievements.push(achievement);

          // 通知を送信
          await supabase.rpc('create_achievement_notification', {
            p_user_id: userId,
            p_achievement_key: achievement.achievement_key,
            p_achievement_name: achievement.name,
          });
        }
      }
    }

    return newlyEarnedAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * ユーザーの統計情報を取得
 */
async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_stats')
    .select('total_study_days, completed_topics, avg_test_score')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return {
      total_study_days: 0,
      completed_topics: 0,
      avg_test_score: 0,
      perfect_score_count: 0,
    };
  }

  // 満点回数を取得
  const { count } = await supabase
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('score', 100);

  return {
    total_study_days: data.total_study_days || 0,
    completed_topics: data.completed_topics || 0,
    avg_test_score: data.avg_test_score || 0,
    perfect_score_count: count || 0,
  };
}

/**
 * フレンド数を取得
 */
async function getFriendCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'accepted');

  return count || 0;
}

/**
 * 個別のバッジ獲得条件をチェック
 */
async function checkAchievementCondition(
  achievement: Achievement,
  stats: UserStats,
  friendCount: number,
  userId: string
): Promise<boolean> {
  const req = achievement.requirement;

  switch (achievement.category) {
    case 'streak':
      return checkStreakAchievement(req, stats);

    case 'accuracy':
      return checkAccuracyAchievement(req, stats);

    case 'completion':
      return checkCompletionAchievement(req, stats);

    case 'social':
      return checkSocialAchievement(req, friendCount);

    default:
      return false;
  }
}

/**
 * 連続学習バッジの条件チェック
 */
function checkStreakAchievement(
  req: AchievementRequirement,
  stats: UserStats
): boolean {
  if (!req.days) return false;
  return stats.total_study_days >= req.days;
}

/**
 * 正解率バッジの条件チェック
 */
function checkAccuracyAchievement(
  req: AchievementRequirement,
  stats: UserStats
): boolean {
  // 満点回数バッジ
  if (req.score === 100 && req.count) {
    return stats.perfect_score_count >= req.count;
  }

  // 平均正解率バッジ
  if (req.avg_score) {
    return stats.avg_test_score >= req.avg_score;
  }

  return false;
}

/**
 * 完了バッジの条件チェック
 */
function checkCompletionAchievement(
  req: AchievementRequirement,
  stats: UserStats
): boolean {
  if (!req.topics) return false;
  return stats.completed_topics >= req.topics;
}

/**
 * ソーシャルバッジの条件チェック
 */
function checkSocialAchievement(
  req: AchievementRequirement,
  friendCount: number
): boolean {
  if (!req.friends) return false;
  return friendCount >= req.friends;
}

/**
 * 特定のイベント後にバッジをチェック
 */
export async function checkAchievementsAfterEvent(
  userId: string,
  eventType: 'test_complete' | 'topic_complete' | 'study_session' | 'friend_add'
): Promise<Achievement[]> {
  // イベントタイプに応じて関連するバッジのみチェック
  // パフォーマンス最適化のため
  return checkAndAwardAchievements(userId);
}
