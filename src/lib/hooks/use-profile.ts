'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ProfileData {
  username: string;
  bio: string | null;
  avatar_url: string | null;
  daily_goal_minutes: number;
  exam_date: string | null;
  notifications_enabled: boolean;
  friend_requests_enabled: boolean;
  achievements_enabled: boolean;
}

export interface ProfileUpdateData {
  username?: string;
  bio?: string;
  daily_goal_minutes?: number;
  exam_date?: string | null;
  notifications_enabled?: boolean;
  friend_requests_enabled?: boolean;
  achievements_enabled?: boolean;
}

/**
 * プロフィール更新機能
 */
export function useProfileUpdate(userId: string | undefined) {
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const updateProfile = async (updates: ProfileUpdateData) => {
    if (!userId) return { success: false, error: 'Not authenticated' };

    setUpdating(true);
    try {
      const supabase = createClient();

      // ユーザー名のバリデーション
      if (updates.username !== undefined) {
        if (updates.username.length < 3 || updates.username.length > 20) {
          return { success: false, error: 'ユーザー名は3〜20文字で設定してください' };
        }

        // ユーザー名の重複チェック
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', updates.username)
          .neq('id', userId)
          .single();

        if (existing) {
          return { success: false, error: 'このユーザー名は既に使用されています' };
        }
      }

      // プロフィール更新
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: (err as Error).message };
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!userId) return { success: false, error: 'Not authenticated' };

    setUploading(true);
    try {
      const supabase = createClient();

      // ファイルサイズチェック（2MB以下）
      if (file.size > 2 * 1024 * 1024) {
        return { success: false, error: 'ファイルサイズは2MB以下にしてください' };
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: '対応していないファイル形式です（JPEG、PNG、GIF、WebPのみ）' };
      }

      // ファイル名を生成（ユーザーIDとタイムスタンプ）
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 古いアバターを削除
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`avatars/${oldPath}`]);
        }
      }

      // 新しいアバターをアップロード
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // プロフィールを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { success: true, url: urlData.publicUrl };
    } catch (err) {
      console.error('Error uploading avatar:', err);
      return { success: false, error: (err as Error).message };
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
      const supabase = createClient();

      // 現在のアバターを取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profile?.avatar_url) {
        const filePath = profile.avatar_url.split('/').pop();
        if (filePath) {
          await supabase.storage.from('avatars').remove([`avatars/${filePath}`]);
        }
      }

      // プロフィールのavatar_urlをnullに更新
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error deleting avatar:', err);
      return { success: false, error: (err as Error).message };
    }
  };

  return {
    updating,
    uploading,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  };
}

/**
 * プロフィールデータ取得
 */
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data as ProfileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    fetchProfile,
  };
}
