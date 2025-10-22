import { checkAndAwardAchievements } from './checker';

/**
 * テスト完了後にバッジをチェック
 */
export async function triggerAchievementCheckAfterTest(userId: string) {
  try {
    const newAchievements = await checkAndAwardAchievements(userId);

    if (newAchievements.length > 0) {
      console.log(`🎉 ${newAchievements.length}個の新しいバッジを獲得しました:`,
        newAchievements.map(a => a.name).join(', ')
      );
    }

    return newAchievements;
  } catch (error) {
    console.error('Error triggering achievement check after test:', error);
    return [];
  }
}

/**
 * トピック完了後にバッジをチェック
 */
export async function triggerAchievementCheckAfterTopicComplete(userId: string) {
  try {
    const newAchievements = await checkAndAwardAchievements(userId);

    if (newAchievements.length > 0) {
      console.log(`🎉 ${newAchievements.length}個の新しいバッジを獲得しました:`,
        newAchievements.map(a => a.name).join(', ')
      );
    }

    return newAchievements;
  } catch (error) {
    console.error('Error triggering achievement check after topic complete:', error);
    return [];
  }
}

/**
 * 学習セッション終了後にバッジをチェック
 */
export async function triggerAchievementCheckAfterStudySession(userId: string) {
  try {
    const newAchievements = await checkAndAwardAchievements(userId);

    if (newAchievements.length > 0) {
      console.log(`🎉 ${newAchievements.length}個の新しいバッジを獲得しました:`,
        newAchievements.map(a => a.name).join(', ')
      );
    }

    return newAchievements;
  } catch (error) {
    console.error('Error triggering achievement check after study session:', error);
    return [];
  }
}

/**
 * フレンド追加後にバッジをチェック
 */
export async function triggerAchievementCheckAfterFriendAdd(userId: string) {
  try {
    const newAchievements = await checkAndAwardAchievements(userId);

    if (newAchievements.length > 0) {
      console.log(`🎉 ${newAchievements.length}個の新しいバッジを獲得しました:`,
        newAchievements.map(a => a.name).join(', ')
      );
    }

    return newAchievements;
  } catch (error) {
    console.error('Error triggering achievement check after friend add:', error);
    return [];
  }
}

/**
 * バッジ獲得通知をトーストで表示
 * (フロントエンドコンポーネントで使用)
 */
export function showAchievementToast(achievementName: string, achievementIcon: string) {
  // この関数はフロントエンドで呼び出される
  // 実際のトースト実装は後で追加可能
  console.log(`🎊 新しいバッジを獲得: ${achievementIcon} ${achievementName}`);
}
