-- ============================================================================
-- FE Master - Notifications System
-- 通知システム用テーブル
-- ============================================================================

-- ============================================================================
-- NOTIFICATIONS TABLE (通知)
-- ============================================================================

CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- 通知情報
  type TEXT NOT NULL, -- 'friend_request', 'friend_accepted', 'achievement', 'reminder', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- 追加のデータ（トピックID、フレンドIDなど）

  -- リンク先（オプション）
  link_screen TEXT, -- 'friends', 'achievements', 'unitDetail', etc.
  link_data JSONB, -- Screen navigation data

  -- 状態
  read BOOLEAN DEFAULT FALSE,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_notification_type CHECK (type IN (
    'friend_request',
    'friend_accepted',
    'achievement',
    'reminder',
    'test_score',
    'streak',
    'system'
  ))
);

-- インデックス
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS (通知作成用のヘルパー関数)
-- ============================================================================

-- フレンドリクエスト通知を作成
CREATE OR REPLACE FUNCTION create_friend_request_notification(
  p_user_id UUID,
  p_requester_id UUID,
  p_requester_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    link_screen,
    link_data
  ) VALUES (
    p_user_id,
    'friend_request',
    'フレンドリクエスト',
    p_requester_name || 'さんからフレンドリクエストが届きました',
    jsonb_build_object('requester_id', p_requester_id, 'requester_name', p_requester_name),
    'friends',
    jsonb_build_object('tab', 'requests')
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- フレンド承認通知を作成
CREATE OR REPLACE FUNCTION create_friend_accepted_notification(
  p_user_id UUID,
  p_friend_id UUID,
  p_friend_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    link_screen,
    link_data
  ) VALUES (
    p_user_id,
    'friend_accepted',
    'フレンドリクエストが承認されました',
    p_friend_name || 'さんとフレンドになりました',
    jsonb_build_object('friend_id', p_friend_id, 'friend_name', p_friend_name),
    'friends',
    NULL
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 達成バッジ通知を作成
CREATE OR REPLACE FUNCTION create_achievement_notification(
  p_user_id UUID,
  p_achievement_key TEXT,
  p_achievement_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    link_screen,
    link_data
  ) VALUES (
    p_user_id,
    'achievement',
    '達成バッジを獲得しました！',
    '「' || p_achievement_name || '」バッジを獲得しました',
    jsonb_build_object('achievement_key', p_achievement_key),
    'achievements',
    NULL
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 高得点通知を作成
CREATE OR REPLACE FUNCTION create_high_score_notification(
  p_user_id UUID,
  p_topic_id TEXT,
  p_topic_title TEXT,
  p_score INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    link_screen,
    link_data
  ) VALUES (
    p_user_id,
    'test_score',
    '素晴らしい成績です！',
    '「' || p_topic_title || '」のテストで' || p_score || '点を獲得しました',
    jsonb_build_object('topic_id', p_topic_id, 'score', p_score),
    'unitDetail',
    jsonb_build_object('topicId', p_topic_id)
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS (自動通知生成)
-- ============================================================================

-- フレンドリクエスト作成時に通知を送信
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_name TEXT;
BEGIN
  IF NEW.status = 'pending' THEN
    -- Get requester's username
    SELECT username INTO v_requester_name
    FROM profiles
    WHERE id = NEW.requester_id;

    -- Create notification for the friend (not the requester)
    IF NEW.friend_id != NEW.requester_id THEN
      PERFORM create_friend_request_notification(
        NEW.friend_id,
        NEW.requester_id,
        COALESCE(v_requester_name, 'ユーザー')
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friendship_created
  AFTER INSERT ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();

-- フレンドリクエスト承認時に通知を送信
CREATE OR REPLACE FUNCTION notify_friend_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_friend_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Get friend's username
    SELECT username INTO v_friend_name
    FROM profiles
    WHERE id = NEW.friend_id;

    -- Create notification for the requester
    PERFORM create_friend_accepted_notification(
      NEW.requester_id,
      NEW.friend_id,
      COALESCE(v_friend_name, 'ユーザー')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friendship_accepted
  AFTER UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_accepted();

-- 達成バッジ獲得時に通知を送信
CREATE OR REPLACE FUNCTION notify_achievement_earned()
RETURNS TRIGGER AS $$
DECLARE
  v_achievement_name TEXT;
BEGIN
  -- Get achievement name
  SELECT name INTO v_achievement_name
  FROM achievements
  WHERE achievement_key = NEW.achievement_key;

  -- Create notification
  PERFORM create_achievement_notification(
    NEW.user_id,
    NEW.achievement_key,
    COALESCE(v_achievement_name, 'バッジ')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_achievement_earned
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_earned();

-- ============================================================================
-- INITIAL DATA (初期バッジデータ)
-- ============================================================================

INSERT INTO achievements (achievement_key, name, description, icon, category, requirement) VALUES
  ('streak_3_days', '3日連続学習', '3日連続で学習しました', '🔥', 'streak', '{"days": 3}'),
  ('streak_7_days', '1週間連続学習', '7日連続で学習しました', '🔥🔥', 'streak', '{"days": 7}'),
  ('streak_30_days', '1ヶ月連続学習', '30日連続で学習しました', '🔥🔥🔥', 'streak', '{"days": 30}'),
  ('perfect_score_1', '初めての満点', 'テストで初めて満点を取りました', '💯', 'accuracy', '{"score": 100, "count": 1}'),
  ('perfect_score_10', '満点マスター', '10回満点を取りました', '💯💯', 'accuracy', '{"score": 100, "count": 10}'),
  ('high_accuracy', '正解率90%超え', '平均正解率が90%を超えました', '🎯', 'accuracy', '{"avg_score": 90}'),
  ('complete_10_topics', '10単元完了', '10個の単元を完了しました', '📚', 'completion', '{"topics": 10}'),
  ('complete_30_topics', '30単元完了', '30個の単元を完了しました', '📚📚', 'completion', '{"topics": 30}'),
  ('complete_all', '全単元完了', 'すべての単元を完了しました', '🎓', 'completion', '{"topics": 48}'),
  ('first_friend', '初めてのフレンド', 'フレンドができました', '👥', 'social', '{"friends": 1}'),
  ('social_butterfly', 'フレンド10人', '10人のフレンドができました', '👥👥', 'social', '{"friends": 10}')
ON CONFLICT (achievement_key) DO NOTHING;
