"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number; // 学習時間（分）
  level: number; // 0-4のレベル
}

export function useHeatmapData(userId: string | undefined, days: number = 365) {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchHeatmapData() {
      setLoading(true);
      try {

        // 指定された日数分の日付範囲を計算
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // study_sessionsから日別の学習時間を取得
        const { data: sessions, error } = await supabase
          .from('study_sessions')
          .select('session_date, duration_seconds')
          .eq('user_id', userId)
          .gte('session_date', startDate.toISOString().split('T')[0])
          .lte('session_date', endDate.toISOString().split('T')[0]);

        if (error) throw error;

        // 日付ごとに集計
        const dailyData = new Map<string, number>();

        sessions?.forEach(session => {
          const date = session.session_date;
          const minutes = Math.round((session.duration_seconds || 0) / 60);
          dailyData.set(date, (dailyData.get(date) || 0) + minutes);
        });

        // HeatmapData形式に変換
        const heatmapData: HeatmapData[] = [];

        // すべての日付を生成
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const minutes = dailyData.get(dateStr) || 0;

          // レベルを計算（0-4）
          let level = 0;
          if (minutes > 0) {
            if (minutes < 30) level = 1;       // 30分未満
            else if (minutes < 60) level = 2;  // 1時間未満
            else if (minutes < 120) level = 3; // 2時間未満
            else level = 4;                    // 2時間以上
          }

          heatmapData.push({
            date: dateStr,
            count: minutes,
            level,
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        setData(heatmapData);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHeatmapData();
  }, [userId, days, supabase]);

  return {
    data,
    loading,
  };
}
