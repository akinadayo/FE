import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Progress } from "./ui/progress";

interface StatisticsProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function Statistics({ onNavigate }: StatisticsProps) {
  const weeklyData = [
    { day: '月', hours: 1 },
    { day: '火', hours: 2.5 },
    { day: '水', hours: 3 },
    { day: '木', hours: 2.5 },
    { day: '金', hours: 1 },
    { day: '土', hours: 2.5 },
    { day: '日', hours: 1.5 },
  ];

  const accuracyData = [
    { week: 'W1', accuracy: 45 },
    { week: 'W2', accuracy: 60 },
    { week: 'W3', accuracy: 70 },
    { week: 'W4', accuracy: 78 },
  ];

  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-5xl mx-auto">
      {/* Period Selector */}
      <div className="flex items-center justify-end">
        <Select defaultValue="month">
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">週</SelectItem>
            <SelectItem value="month">月</SelectItem>
            <SelectItem value="year">年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <h2>📊 今月の学習状況</h2>

      {/* Weekly Hours Chart */}
      <Card className="p-4 md:p-6">
        <h3 className="mb-3">学習時間グラフ</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>総学習時間:</span>
            <span>12h 45m</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>平均/日:</span>
            <span>1h 49m</span>
          </div>
        </div>
      </Card>

      {/* Accuracy Trend */}
      <Card className="p-4 md:p-6">
        <h3 className="mb-3">📈 正解率の推移</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Category Proficiency */}
      <Card className="p-4">
        <h3 className="mb-3">🎯 分野別習熟度</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>テクノロジ系</span>
              <span>78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>マネジメント系</span>
              <span>45%</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>ストラテジ系</span>
              <span>23%</span>
            </div>
            <Progress value={23} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-4">
        <h3 className="mb-3">🏆 達成バッジ</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center text-2xl">
              🔥
            </div>
            <span className="text-xs">7日連続</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <span className="text-xs">100時間</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-950 rounded-full flex items-center justify-center text-2xl">
              👑
            </div>
            <span className="text-xs">正解王</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
