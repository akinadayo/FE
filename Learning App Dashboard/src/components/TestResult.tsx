import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Trophy, TrendingUp, Home, RotateCw, BookOpen } from "lucide-react";

interface TestResultProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function TestResult({ onNavigate }: TestResultProps) {
  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
      {/* Celebration Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white border-0 shadow-xl">
        <div className="p-8 text-center space-y-4">
          <div className="text-6xl animate-float">🎉</div>
          <h1 className="text-white text-3xl">お疲れ様！</h1>
          <p className="text-white/90">テストを完了しました</p>
        </div>
      </Card>

      {/* Score Card */}
      <Card className="p-8 text-center space-y-4 shadow-xl border-4 bg-gradient-to-br from-white to-blue-50" style={{ borderColor: '#6DBFF2' }}>
        <Badge className="text-white border-0 text-lg px-4 py-1" style={{ background: '#6DBFF2' }}>
          スコア
        </Badge>
        
        <div className="relative">
          <div className="text-7xl bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #3B9DD9, #6DBFF2)' }}>
            75%
          </div>
          <div className="absolute inset-0 blur-2xl opacity-20" style={{ background: 'linear-gradient(90deg, #3B9DD9, #6DBFF2)' }} />
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl">15/20 正解</p>
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-green-600">前回より +30% アップ！</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-3 md:p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-1">⏱️</div>
            <p className="text-sm text-muted-foreground">所要時間</p>
            <p>8分32秒</p>
          </div>
          <div className="p-3 md:p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-1">⭐</div>
            <p className="text-sm text-muted-foreground">獲得XP</p>
            <p className="text-yellow-600">+150 XP</p>
          </div>
          <div className="p-3 md:p-4 bg-green-50 rounded-lg hidden md:block">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-sm text-muted-foreground">正解数</p>
            <p className="text-green-600">15問</p>
          </div>
          <div className="p-3 md:p-4 bg-blue-50 rounded-lg hidden md:block">
            <div className="text-2xl mb-1">📈</div>
            <p className="text-sm text-muted-foreground">成長率</p>
            <p style={{ color: '#6DBFF2' }}>+30%</p>
          </div>
        </div>
      </Card>

      {/* Category Stats */}
      <Card className="p-4 shadow-lg border-2">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-purple-500" />
          <h2>分野別正解率</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span>基本回路</span>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                100%
              </Badge>
            </div>
            <Progress value={100} className="h-3" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">👍</span>
                <span>組合せ回路</span>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                80%
              </Badge>
            </div>
            <Progress value={80} className="h-3" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <span>加算器</span>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                50%
              </Badge>
            </div>
            <Progress value={50} className="h-3" />
          </div>
        </div>
      </Card>

      {/* Wrong Answers */}
      <Card className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
        <h2 className="mb-3 flex items-center gap-2">
          <span className="text-xl">❌</span>
          間違えた問題
        </h2>
        <div className="space-y-2">
          {[
            { id: 3, name: 'NAND回路' },
            { id: 7, name: '全加算器' },
            { id: 12, name: 'XOR回路' },
            { id: 18, name: '半加算器' }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm">
                {item.id}
              </div>
              <span className="flex-1">問{item.id}: {item.name}</span>
              <Badge variant="outline" className="border-red-200 text-red-600">
                復習推奨
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg text-lg"
          onClick={() => onNavigate('explanation')}
        >
          <BookOpen className="w-5 h-5 mr-2" />
          解説を確認
        </Button>
        
        <Button 
          className="w-full h-14 text-white border-0 shadow-lg text-lg"
          style={{ background: 'linear-gradient(90deg, #85D3F2, #99F2E9)' }}
          onClick={() => onNavigate('test')}
        >
          <RotateCw className="w-5 h-5 mr-2" />
          間違いを復習
        </Button>
        
        <Button 
          className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg text-lg"
          onClick={() => onNavigate('home')}
        >
          <Home className="w-5 h-5 mr-2" />
          ホームに戻る
        </Button>
      </div>

      {/* Motivational Message */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 text-center" style={{ borderColor: '#6DBFF2' }}>
        <div className="text-4xl mb-3">💪</div>
        <p className="text-lg mb-2">素晴らしい結果です！</p>
        <p className="text-sm text-muted-foreground">
          この調子で学習を続けて、完璧を目指しましょう
        </p>
      </Card>
    </div>
  );
}
