import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, BookOpen, Target, Flame, Zap, Star } from "lucide-react";

interface HomeProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="space-y-6 pb-4 md:pb-6">
      {/* Hero Card with Daily Goal */}
      <Card className="overflow-hidden text-white border-0 shadow-xl" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)' }}>
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5" />
                <span className="text-sm">今日の目標</span>
              </div>
              <h2 className="text-white text-3xl">2時間</h2>
            </div>
            <div className="text-5xl animate-float">🎯</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>1h 36m / 2h 00m</span>
              <span>80%</span>
            </div>
            <Progress value={80} className="h-3 bg-white/30" />
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            <span>あと24分で目標達成！</span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="text-2xl md:text-3xl mb-1">⏱️</div>
          <p className="text-xs md:text-sm text-muted-foreground mb-1">総学習時間</p>
          <p className="text-base md:text-xl lg:text-2xl">45h 23m</p>
        </Card>
        
        <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
          <div className="text-2xl md:text-3xl mb-1">✅</div>
          <p className="text-xs md:text-sm text-muted-foreground mb-1">完了単元</p>
          <p className="text-base md:text-xl lg:text-2xl">12/48</p>
        </Card>
        
        <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-lg transition-shadow">
          <div className="text-2xl md:text-3xl mb-1">📊</div>
          <p className="text-xs md:text-sm text-muted-foreground mb-1">平均正解率</p>
          <p className="text-base md:text-xl lg:text-2xl">78%</p>
        </Card>
      </div>

      {/* Today's Recommendation */}
      <Card 
        className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-blue-50"
        style={{ borderColor: '#6DBFF2' }}
        onClick={() => onNavigate('unitDetail', { unitId: 'database-3nf' })}
      >
        <div className="px-4 py-2 text-white" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)' }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">今日のおすすめ</span>
            <Badge className="ml-auto bg-yellow-400 text-yellow-900 border-0">
              <Zap className="w-3 h-3 mr-1" />
              人気
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="text-4xl animate-float">📘</div>
            <div className="flex-1 space-y-2">
              <h3>データベース - 第3正規形</h3>
              <p className="text-sm text-muted-foreground">基礎から学べる重要単元</p>
              
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-white`} style={{ background: i < 3 ? '#3b82f6' : '#e5e7eb' }}>
                      {i < 3 && '✓'}
                    </div>
                  ))}
                </div>
                <span className="text-sm">60%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Streak */}
      <Card className="overflow-hidden border-2 shadow-lg" style={{ borderColor: '#99F2E9' }}>
        <div className="px-4 py-2 text-white" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)' }}>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span className="text-sm">学習ストリーク</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-center space-y-3">
            <div className="text-4xl">🔥</div>
            <div>
              <p className="text-2xl mb-1">7日連続！</p>
              <p className="text-sm text-muted-foreground">このまま継続しよう！</p>
            </div>
            <div className="flex gap-1 justify-center">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-lg flex items-center justify-center text-lg animate-slide-in" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', animationDelay: `${i * 0.1}s` }}>
                  🔥
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Friend Ranking */}
      <Card className="overflow-hidden border-2 shadow-lg" style={{ borderColor: '#85D3F2' }}>
        <div className="px-4 py-2 text-white" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)' }}>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">フレンドランキング</span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {/* 1st Place */}
          <Card className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🥇</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>田中さん</span>
                  <Badge className="bg-yellow-400 text-yellow-900 border-0">
                    <Star className="w-3 h-3" />
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">52h 学習中</p>
              </div>
            </div>
          </Card>
          
          {/* 2nd Place - You */}
          <Card className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🥈</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>あなた</span>
                  <Badge className="text-white border-0" style={{ background: '#6DBFF2' }}>自分</Badge>
                </div>
                <p className="text-sm text-muted-foreground">45h 学習中</p>
              </div>
            </div>
          </Card>
          
          {/* 3rd Place */}
          <Card className="p-3 bg-gradient-to-r from-orange-50 to-rose-50 border-2 border-orange-300">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🥉</div>
              <div className="flex-1">
                <span>佐藤さん</span>
                <p className="text-sm text-muted-foreground">38h 学習中</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50" style={{ borderColor: '#85D3F2' }}>
        <div className="flex items-center gap-4">
          <div className="text-5xl">⭐</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span>レベル 15</span>
              <span className="text-sm text-muted-foreground">次のレベルまで 230 XP</span>
            </div>
            <Progress value={65} className="h-3" />
          </div>
        </div>
      </Card>
    </div>
  );
}
