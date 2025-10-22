"use client";

import { useState } from "react";

interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number; // 学習時間（分）
  level: number; // 0-4のレベル
}

interface HeatmapProps {
  data: HeatmapData[];
  startDate?: Date;
  endDate?: Date;
}

export function Heatmap({ data, startDate, endDate }: HeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<HeatmapData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 日付範囲を設定（デフォルトは過去1年）
  const end = endDate || new Date();
  const start = startDate || new Date(end.getFullYear() - 1, end.getMonth(), end.getDate());

  // 日付をYYYY-MM-DD形式に変換
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // データをマップに変換
  const dataMap = new Map<string, HeatmapData>();
  data.forEach(item => {
    dataMap.set(item.date, item);
  });

  // レベルに応じた色を返す
  const getLevelColor = (level: number): string => {
    const colors = [
      '#ebedf0', // Level 0: なし
      '#9be9a8', // Level 1: 少ない
      '#40c463', // Level 2: 普通
      '#30a14e', // Level 3: 多い
      '#216e39', // Level 4: とても多い
    ];
    return colors[Math.min(level, 4)];
  };

  // 週ごとにグループ化したデータを生成
  const weeks: Date[][] = [];
  let currentDate = new Date(start);

  // 最初の週の開始日（日曜日）を見つける
  const firstDayOfWeek = currentDate.getDay();
  if (firstDayOfWeek !== 0) {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() - firstDayOfWeek);
  }

  while (currentDate <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  // 月ラベルを生成
  const monthLabels: { month: string; x: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    const month = firstDay.getMonth();
    if (month !== lastMonth && weekIndex > 0) {
      monthLabels.push({
        month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][month],
        x: weekIndex * 14,
      });
      lastMonth = month;
    }
  });

  // 時間フォーマット
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}分`;
    if (mins === 0) return `${hours}時間`;
    return `${hours}時間${mins}分`;
  };

  return (
    <div className="relative">
      {/* 月ラベル */}
      <div className="flex gap-0 mb-1 text-xs text-muted-foreground" style={{ marginLeft: '20px' }}>
        {monthLabels.map((label, index) => (
          <div
            key={index}
            className="absolute"
            style={{ left: label.x + 20 }}
          >
            {label.month}
          </div>
        ))}
      </div>

      {/* ヒートマップグリッド */}
      <div className="flex gap-0.5" style={{ marginTop: '20px' }}>
        {/* 曜日ラベル */}
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground" style={{ width: '20px' }}>
          <div style={{ height: '10px' }}></div>
          <div style={{ height: '10px' }}>月</div>
          <div style={{ height: '10px' }}></div>
          <div style={{ height: '10px' }}>水</div>
          <div style={{ height: '10px' }}></div>
          <div style={{ height: '10px' }}>金</div>
          <div style={{ height: '10px' }}></div>
        </div>

        {/* 週ごとの列 */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5">
            {week.map((date, dayIndex) => {
              const dateStr = formatDate(date);
              const dayData = dataMap.get(dateStr);
              const level = dayData?.level || 0;
              const isInRange = date >= start && date <= end;

              return (
                <div
                  key={dayIndex}
                  className="w-2.5 h-2.5 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-blue-400"
                  style={{
                    backgroundColor: isInRange ? getLevelColor(level) : '#ebedf0',
                    opacity: isInRange ? 1 : 0.3,
                  }}
                  onMouseEnter={(e) => {
                    if (isInRange) {
                      setHoveredDate(dayData || { date: dateStr, count: 0, level: 0 });
                      setMousePosition({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseMove={(e) => {
                    setMousePosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => {
                    setHoveredDate(null);
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>少ない</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: getLevelColor(level) }}
            />
          ))}
        </div>
        <span>多い</span>
      </div>

      {/* ツールチップ */}
      {hoveredDate && (
        <div
          className="fixed z-50 px-3 py-2 text-xs bg-gray-900 text-white rounded shadow-lg pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 40,
          }}
        >
          <div className="font-semibold">{hoveredDate.date}</div>
          <div>{hoveredDate.count > 0 ? formatMinutes(hoveredDate.count) : '学習なし'}</div>
        </div>
      )}
    </div>
  );
}
