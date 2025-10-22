# 基本情報技術者試験アプリ - 実装タスクリスト

## 🎯 優先度A（高優先度）- ユーザー体験に直結

### ✅ Task A-1: 今日の学習時間トラッキング ✅ **完了**
**ファイル**: `src/components/Home.tsx`, `src/lib/hooks/use-user-stats.ts`

**実装内容**:
- [x] `use-user-stats.ts`に当日の学習時間を取得する関数を追加
- [x] `study_sessions`テーブルから当日（`session_date = CURRENT_DATE`）のデータを集計
- [x] Home.tsxで実際の学習時間を表示
- [x] リアルタイム更新（学習中に時間が増える）

**実装完了日**: 2025年10月22日

---

### ✅ Task A-2: 通知データベーステーブルの作成 ✅ **完了**
**ファイル**: `supabase/migrations/002_notifications.sql`

**実装内容**:
- [x] `notifications`テーブルを作成
- [x] RLSポリシーの設定
- [x] インデックスの作成（user_id, read, created_at）
- [x] ヘルパー関数とトリガーの作成
- [x] 初期バッジデータの挿入

**実装完了日**: 2025年10月22日

---

### ✅ Task A-3: 通知システムのフック作成 ✅ **完了**
**ファイル**: `src/lib/hooks/use-notifications.ts`

**実装内容**:
- [x] `useNotifications`フックの作成
- [x] 未読通知数の取得
- [x] 通知一覧の取得
- [x] 通知を既読にする機能
- [x] Supabase Realtimeでリアルタイム更新

**実装完了日**: 2025年10月22日

---

### ✅ Task A-4: 通知UIの実装 ✅ **完了**
**ファイル**: `src/components/Header.tsx`, `src/components/Notifications.tsx`

**実装内容**:
- [x] Headerの通知バッジを動的に更新
- [x] 通知一覧画面の作成
- [x] 通知タイプ別のアイコン・スタイル
- [x] 既読/未読の切り替え
- [x] 通知クリック時の画面遷移

**実装完了日**: 2025年10月22日

---

### ✅ Task A-5: 達成バッジUIの実装 ✅ **完了**
**ファイル**: `src/components/Achievements.tsx`, `src/lib/hooks/use-achievements.ts`, `src/components/Home.tsx`

**実装内容**:
- [x] 達成バッジ一覧画面の作成
- [x] `useAchievements`フックの作成
- [x] 獲得済み/未獲得バッジの表示
- [x] 進捗バー（あと〇〇で獲得）
- [x] Homeページにバッジセクションを追加

**実装完了日**: 2025年10月22日

---

## 🎯 優先度B（中優先度）- 機能拡張

### ✅ Task B-1: 達成バッジ獲得ロジック ✅ **完了**
**ファイル**: `src/lib/achievements/checker.ts`, `src/lib/achievements/trigger.ts`

**実装内容**:
- [x] バッジ獲得条件チェック関数（`checker.ts`）
- [x] 連続学習日数バッジ（`checkStreakAchievement`）
- [x] 正解率バッジ（`checkAccuracyAchievement`）
- [x] 完了単元数バッジ（`checkCompletionAchievement`）
- [x] フレンド関連バッジ（`checkSocialAchievement`）
- [x] バッジ獲得時に通知を送信（`create_achievement_notification`）
- [x] テスト完了時のバッジチェック統合（`Test.tsx`）
- [x] トピック完了時のバッジチェック統合（`Explanation.tsx`, `Flashcard.tsx`）
- [x] フレンド追加時のバッジチェック統合（`use-friends.ts`）

**実装完了日**: 2025年10月22日

---

### ✅ Task B-2: おすすめコンテンツのパーソナライゼーション ✅ **完了**
**ファイル**: `src/lib/recommendations.ts`, `src/lib/hooks/use-recommendations.ts`, `src/lib/hooks/use-topic-mastery.ts`, `src/components/Home.tsx`, `src/components/Learning.tsx`, `src/components/UnitDetail.tsx`

**実装内容**:
- [x] ユーザーの進捗に基づくおすすめロジック
- [x] 弱点分野の検出（テスト正解率が70%未満）
- [x] 次に学ぶべきトピックの提案
- [x] 復習が必要なトピックの検出（7日以上学習していない完了済みトピック）
- [x] Home.tsxに動的なおすすめを表示（優先度・理由・アイコン付き）
- [x] トピック習熟度計算システム（0-100レベル、0-4段階のティア）
- [x] 学習回数に応じた色分けシステム（未学習→初級→中級→上級→マスター）
- [x] Learning.tsxにトピックの色分けを適用（左ボーダー、アイコン色、回数バッジ）
- [x] UnitDetail.tsxに習熟度バッジを追加（ティア名、回数表示）

**実装完了日**: 2025年10月22日

---

### Task B-3: 検索機能の実装
**ファイル**: `src/components/Search.tsx`, `src/lib/hooks/use-search.ts`

**実装内容**:
- [ ] 検索画面の作成
- [ ] トピック検索機能（タイトル、キーワードで検索）
- [ ] 検索結果の表示
- [ ] 検索履歴の保存（LocalStorage）
- [ ] Headerの検索ボタンと連携

**推定工数**: 3-4時間

---

### Task B-4: カレンダーヒートマップ
**ファイル**: `src/components/Statistics.tsx`, `src/components/ui/heatmap.tsx`

**実装内容**:
- [ ] ヒートマップコンポーネントの作成
- [ ] 学習日データの取得（過去1年分）
- [ ] GitHub風のヒートマップ表示
- [ ] 日付ホバーで詳細表示
- [ ] Statistics画面に統合

**推定工数**: 4-5時間

---

### Task B-5: フレンドの学習状況リアルタイム更新
**ファイル**: `src/components/Friends.tsx`, `src/lib/hooks/use-friends.ts`

**実装内容**:
- [ ] Supabase Realtimeでフレンドの進捗を監視
- [ ] フレンドがトピックを完了したら通知
- [ ] フレンドの現在学習中のトピック表示
- [ ] フレンドとの比較グラフ

**推定工数**: 3-4時間

---

## 🎯 優先度C（低優先度）- Nice to have

### Task C-1: 学習目標管理ダッシュボード
**ファイル**: `src/components/Goals.tsx`

**実装内容**:
- [ ] 目標達成状況のダッシュボード
- [ ] 進捗予測（試験日までの必要学習時間）
- [ ] 週間・月間目標の設定
- [ ] 目標達成時の通知

**推定工数**: 5-6時間

---

### Task C-2: ダークモード
**ファイル**: `src/styles/globals.css`, `src/components/*`

**実装内容**:
- [ ] Tailwind CSS ダークモードの設定
- [ ] テーマ切り替えの実装
- [ ] 設定画面にダークモード切り替えボタン
- [ ] LocalStorageに設定を保存

**推定工数**: 3-4時間

---

### Task C-3: 学習メモ・ノート機能
**ファイル**: `src/components/Notes.tsx`, `supabase/migrations/003_notes.sql`

**実装内容**:
- [ ] `notes`テーブルの作成
- [ ] トピックごとにメモを保存
- [ ] Markdown対応のエディタ
- [ ] メモ一覧表示
- [ ] 検索機能

**推定工数**: 6-8時間

---

### Task C-4: データのエクスポート
**ファイル**: `src/lib/export.ts`, `src/components/Settings.tsx`

**実装内容**:
- [ ] 学習履歴のCSVエクスポート
- [ ] 統計レポートのPDFエクスポート
- [ ] 設定画面にエクスポートボタンを追加

**推定工数**: 4-5時間

---

### Task C-5: 学習リマインダー
**ファイル**: `src/lib/reminders.ts`

**実装内容**:
- [ ] ブラウザ通知APIの使用
- [ ] 指定時刻にリマインダー
- [ ] 通知許可の取得
- [ ] 設定画面でリマインダー時刻を設定

**推定工数**: 2-3時間

---

## 📊 実装優先順位（推奨）

1. **Task A-1**: 今日の学習時間トラッキング（既存コードにTODOあり、すぐ実装可能）
2. **Task A-2 → A-3 → A-4**: 通知システム（段階的に実装）
3. **Task A-5**: 達成バッジUI（データベースは準備済み）
4. **Task B-1**: 達成バッジ獲得ロジック（A-5の後）
5. **Task B-2**: おすすめコンテンツ
6. **Task B-3**: 検索機能
7. **Task B-4**: カレンダーヒートマップ
8. その他はニーズに応じて

---

## 📝 メモ

- 各タスクは独立して実装可能
- データベースマイグレーションが必要なタスクは先に実行
- フロントエンドとバックエンドを分けて実装可能
