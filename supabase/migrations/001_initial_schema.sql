-- ============================================================================
-- FE Master - Initial Database Schema
-- 基本情報技術者試験対策アプリ データベーススキーマ
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (ユーザープロフィール)
-- ============================================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  study_goal_minutes INTEGER DEFAULT 120, -- 1日の目標学習時間（分）
  target_exam_date DATE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- インデックス
CREATE INDEX idx_profiles_username ON profiles(username);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 2. TOPIC_PROGRESS TABLE (学習進捗)
-- ============================================================================

CREATE TABLE topic_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL, -- 'tech-1-1-1' などシラバスJSONのID

  -- 各ステップの完了状態
  explanation_completed BOOLEAN DEFAULT FALSE,
  explanation_completed_at TIMESTAMP WITH TIME ZONE,

  flashcard_completed BOOLEAN DEFAULT FALSE,
  flashcard_completed_at TIMESTAMP WITH TIME ZONE,
  flashcard_mastery_level INTEGER DEFAULT 0, -- 0-5の習熟度

  test_completed BOOLEAN DEFAULT FALSE,
  test_completed_at TIMESTAMP WITH TIME ZONE,

  -- 統計情報
  total_tests_taken INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0, -- 最高得点（%）
  latest_score INTEGER DEFAULT 0, -- 最新得点（%）
  average_score DECIMAL(5,2) DEFAULT 0, -- 平均得点

  -- メタ情報
  last_studied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_study_time_seconds INTEGER DEFAULT 0, -- 累計学習時間
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, topic_id)
);

-- インデックス
CREATE INDEX idx_topic_progress_user ON topic_progress(user_id);
CREATE INDEX idx_topic_progress_topic ON topic_progress(topic_id);
CREATE INDEX idx_topic_progress_last_studied ON topic_progress(last_studied_at);

-- RLS
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON topic_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON topic_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON topic_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TEST_RESULTS TABLE (テスト結果)
-- ============================================================================

CREATE TABLE test_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,

  -- テスト情報
  test_type TEXT NOT NULL, -- 'initial' or 'review'
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score INTEGER NOT NULL, -- パーセンテージ (0-100)

  -- 時間情報
  time_spent_seconds INTEGER NOT NULL,

  -- 詳細な解答データ（JSONB）
  answers JSONB NOT NULL,
  /*
  {
    "questions": [
      {
        "question_id": "q1",
        "question_text": "AND回路の説明として正しいものは？",
        "question_type": "multiple_choice",
        "user_answer": "A",
        "correct_answer": "A",
        "is_correct": true,
        "time_spent": 15
      }
    ]
  }
  */

  -- 間違えた問題のトピック（復習用）
  incorrect_subtopics TEXT[], -- 配列で複数の小トピックを保存

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_test_results_topic ON test_results(topic_id);
CREATE INDEX idx_test_results_date ON test_results(created_at);
CREATE INDEX idx_test_results_score ON test_results(score);

-- RLS
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test results"
  ON test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results"
  ON test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. STUDY_SESSIONS TABLE (学習セッション)
-- ============================================================================

CREATE TABLE study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  topic_id TEXT,

  -- セッション情報
  session_type TEXT NOT NULL, -- 'explanation', 'flashcard', 'test'
  duration_seconds INTEGER NOT NULL,

  -- 日付情報（集計用）
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end_time TIMESTAMP WITH TIME ZONE NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(session_date);
CREATE INDEX idx_study_sessions_topic ON study_sessions(topic_id);

-- RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. FLASHCARD_REVIEWS TABLE (フラッシュカード復習記録)
-- ============================================================================

CREATE TABLE flashcard_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  flashcard_id TEXT NOT NULL, -- フラッシュカード固有ID

  -- 復習情報
  confidence_level INTEGER NOT NULL, -- 1-4 (わからない/微妙/理解した/完璧)
  review_count INTEGER DEFAULT 1,

  -- 間隔反復学習用（オプション）
  easiness_factor DECIMAL(3,2) DEFAULT 2.5, -- SuperMemo アルゴリズム用
  interval_days INTEGER DEFAULT 1,
  next_review_date DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_flashcard_reviews_user ON flashcard_reviews(user_id);
CREATE INDEX idx_flashcard_reviews_card ON flashcard_reviews(flashcard_id);
CREATE INDEX idx_flashcard_reviews_next ON flashcard_reviews(next_review_date);

-- RLS
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
  ON flashcard_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON flashcard_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. FRIENDSHIPS TABLE (フレンド関係)
-- ============================================================================

CREATE TABLE friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'blocked'

  -- リクエスト送信者を記録
  requester_id UUID REFERENCES auth.users NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 同じペアの重複を防ぐ
  CONSTRAINT unique_friendship UNIQUE(user_id, friend_id),
  -- 自分自身をフレンドにできないようにする
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- インデックス
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can update their friendships"
  ON friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================================================
-- 7. ACHIEVEMENTS TABLE (達成バッジ)
-- ============================================================================

CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  achievement_key TEXT UNIQUE NOT NULL, -- 'streak_7_days', 'perfect_score_10', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- アイコンのURL or 絵文字
  category TEXT NOT NULL, -- 'streak', 'accuracy', 'completion', 'social'
  requirement JSONB NOT NULL, -- 達成条件の詳細
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_key TEXT REFERENCES achievements(achievement_key) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, achievement_key)
);

-- インデックス
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "User achievements are viewable by everyone"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can only insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. VIEWS (集計用ビュー)
-- ============================================================================

-- 週間ランキングビュー
CREATE OR REPLACE VIEW weekly_ranking AS
SELECT
  u.id as user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  COALESCE(SUM(ss.duration_seconds), 0) / 60 as total_minutes,
  COUNT(DISTINCT ss.session_date) as study_days,
  COALESCE(AVG(tp.average_score), 0) as avg_accuracy
FROM
  auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  LEFT JOIN study_sessions ss ON u.id = ss.user_id
    AND ss.session_date >= CURRENT_DATE - INTERVAL '7 days'
  LEFT JOIN topic_progress tp ON u.id = tp.user_id
WHERE
  u.id IN (
    SELECT id FROM auth.users WHERE id IN (SELECT id FROM profiles WHERE username IS NOT NULL)
  )
GROUP BY
  u.id, p.username, p.display_name, p.avatar_url
ORDER BY
  total_minutes DESC;

-- ユーザー統計ビュー
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  u.id as user_id,
  COUNT(DISTINCT tp.topic_id) FILTER (WHERE tp.test_completed = true) as completed_topics,
  COALESCE(SUM(ss.duration_seconds), 0) / 3600 as total_hours,
  COALESCE(AVG(tr.score), 0) as avg_test_score,
  COUNT(tr.id) as total_tests_taken,
  COUNT(DISTINCT DATE(ss.session_date)) as total_study_days,
  MAX(ss.session_date) as last_study_date
FROM
  auth.users u
  LEFT JOIN topic_progress tp ON u.id = tp.user_id
  LEFT JOIN study_sessions ss ON u.id = ss.user_id
  LEFT JOIN test_results tr ON u.id = tr.user_id
GROUP BY
  u.id;

-- ============================================================================
-- 9. FUNCTIONS (ヘルパー関数)
-- ============================================================================

-- プロフィール自動作成トリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー登録時にプロフィール自動作成
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at自動更新トリガー
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_progress_updated_at
  BEFORE UPDATE ON topic_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. INITIAL DATA (初期データ)
-- ============================================================================

-- 基本的な達成バッジ
INSERT INTO achievements (achievement_key, name, description, icon, category, requirement) VALUES
  ('first_test', '初テスト完了', '最初のテストを完了しました', '🎯', 'completion', '{"tests_completed": 1}'::jsonb),
  ('streak_7', '継続は力なり', '7日連続で学習しました', '🔥', 'streak', '{"consecutive_days": 7}'::jsonb),
  ('streak_30', '習慣化マスター', '30日連続で学習しました', '⭐', 'streak', '{"consecutive_days": 30}'::jsonb),
  ('perfect_score', 'パーフェクト！', 'テストで満点を取りました', '💯', 'accuracy', '{"perfect_scores": 1}'::jsonb),
  ('perfect_score_10', 'パーフェクトマスター', 'テストで10回満点を取りました', '👑', 'accuracy', '{"perfect_scores": 10}'::jsonb),
  ('completed_10', '学習者', '10単元を完了しました', '📚', 'completion', '{"topics_completed": 10}'::jsonb),
  ('completed_50', '上級学習者', '50単元を完了しました', '🎓', 'completion', '{"topics_completed": 50}'::jsonb),
  ('first_friend', '友達ゲット', '最初のフレンドができました', '👥', 'social', '{"friends_count": 1}'::jsonb),
  ('study_10h', '10時間達成', '累計10時間学習しました', '⏱️', 'completion', '{"total_hours": 10}'::jsonb),
  ('study_100h', '100時間達成', '累計100時間学習しました', '🏆', 'completion', '{"total_hours": 100}'::jsonb)
ON CONFLICT (achievement_key) DO NOTHING;

-- ============================================================================
-- スキーマ作成完了
-- ============================================================================

COMMENT ON TABLE profiles IS 'ユーザープロフィール情報';
COMMENT ON TABLE topic_progress IS '学習トピックごとの進捗状況';
COMMENT ON TABLE test_results IS 'テスト結果の詳細記録';
COMMENT ON TABLE study_sessions IS '学習セッションの時間記録';
COMMENT ON TABLE flashcard_reviews IS 'フラッシュカード復習履歴';
COMMENT ON TABLE friendships IS 'ユーザー間のフレンド関係';
COMMENT ON TABLE achievements IS '達成可能なバッジ定義';
COMMENT ON TABLE user_achievements IS 'ユーザーが獲得したバッジ';
