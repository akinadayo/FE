"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ChevronRight, Volume2, VolumeX, X, Save, Camera } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { useAuth } from "@/lib/contexts/auth-context";
import { useProfile, useProfileUpdate } from "@/lib/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useSoundEffect } from "@/hooks/use-sound";

interface SettingsProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const { user, signOut } = useAuth();
  const { profile, loading, fetchProfile } = useProfile(user?.id);
  const { updating, uploading, updateProfile, uploadAvatar, deleteAvatar } = useProfileUpdate(user?.id);
  const { isMuted, toggleMute, volume, changeVolume, play } = useSound();
  const playSound = useSoundEffect();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [dailyGoal, setDailyGoal] = useState(120); // 分
  const [examDate, setExamDate] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [friendRequestsEnabled, setFriendRequestsEnabled] = useState(true);
  const [achievementsEnabled, setAchievementsEnabled] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setDailyGoal(profile.daily_goal_minutes || 120);
      setExamDate(profile.exam_date || "");
      setNotificationsEnabled(profile.notifications_enabled ?? true);
      setFriendRequestsEnabled(profile.friend_requests_enabled ?? true);
      setAchievementsEnabled(profile.achievements_enabled ?? true);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    const result = await updateProfile({
      username,
      bio,
      daily_goal_minutes: dailyGoal,
      exam_date: examDate || null,
      notifications_enabled: notificationsEnabled,
      friend_requests_enabled: friendRequestsEnabled,
      achievements_enabled: achievementsEnabled,
    });

    if (result.success) {
      playSound('complete');
      setEditMode(false);
      fetchProfile();
    } else {
      alert(result.error || 'プロフィールの更新に失敗しました');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadAvatar(file);
    if (result.success) {
      playSound('achievement');
      fetchProfile();
    } else {
      alert(result.error || 'アバター画像のアップロードに失敗しました');
    }
  };

  const handleDeleteAvatar = async () => {
    if (confirm('アバター画像を削除しますか？')) {
      const result = await deleteAvatar();
      if (result.success) {
        playSound('click');
        fetchProfile();
      }
    }
  };

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
      onNavigate('home');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const dailyGoalHours = Math.floor(dailyGoal / 60);
  const dailyGoalMinutes = dailyGoal % 60;

  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
      {/* Profile */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">👤 プロフィール</h2>
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (editMode) {
                handleSaveProfile();
              } else {
                setEditMode(true);
              }
            }}
            disabled={updating}
          >
            {editMode ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存
              </>
            ) : (
              "編集"
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl">
                  👤
                </div>
              )}
              {editMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-2">
                  <Label htmlFor="username">ユーザー名</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ユーザー名（3〜20文字）"
                    maxLength={20}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  {profile?.avatar_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4 mr-1" />
                      画像を削除
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <p className="font-semibold text-lg">{profile?.username || "未設定"}</p>
                  <p className="text-sm text-muted-foreground">ID: {user?.id.slice(0, 8)}...</p>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {editMode && (
            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="自己紹介を入力..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/200
              </p>
            </div>
          )}

          {!editMode && bio && (
            <div>
              <Label className="text-sm text-muted-foreground">自己紹介</Label>
              <p className="mt-1 text-sm">{bio}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Study Goals */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🎯 学習目標</h2>
        <div className="space-y-4">
          {editMode ? (
            <>
              <div className="space-y-2">
                <Label>1日の目標時間: {dailyGoalHours}時間{dailyGoalMinutes}分</Label>
                <Slider
                  value={[dailyGoal]}
                  onValueChange={(values) => setDailyGoal(values[0])}
                  min={30}
                  max={480}
                  step={30}
                  className="py-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examDate">試験予定日</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>1日の目標時間:</span>
                <span className="font-semibold">{dailyGoalHours}時間{dailyGoalMinutes}分</span>
              </div>
              <div className="flex items-center justify-between">
                <span>試験予定日:</span>
                <span className="font-semibold">
                  {examDate ? new Date(examDate).toLocaleDateString('ja-JP') : "未設定"}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🔔 通知設定</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">学習リマインダー</span>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              disabled={!editMode}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">フレンド通知</span>
            <Switch
              checked={friendRequestsEnabled}
              onCheckedChange={setFriendRequestsEnabled}
              disabled={!editMode}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">達成バッジ</span>
            <Switch
              checked={achievementsEnabled}
              onCheckedChange={setAchievementsEnabled}
              disabled={!editMode}
            />
          </div>
        </div>
      </Card>

      {/* Sound Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🔊 サウンド設定</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">効果音</span>
            </div>
            <Switch
              checked={!isMuted}
              onCheckedChange={toggleMute}
            />
          </div>

          {!isMuted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">音量</span>
                <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[volume * 100]}
                  onValueChange={(values) => changeVolume(values[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => play('notification')}
                className="w-full mt-2"
              >
                テスト再生
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Account */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🔐 アカウント</h2>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <span className="text-sm">ログアウト</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Other */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">ℹ️ その他</h2>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-between" disabled>
            <span className="text-sm">利用規約</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-between" disabled>
            <span className="text-sm">プライバシーポリシー</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-between" disabled>
            <span className="text-sm">アプリについて</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
