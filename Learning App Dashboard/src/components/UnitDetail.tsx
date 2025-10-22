import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { BookOpen, RotateCw, PenLine, Star, Trophy, Clock, Target } from "lucide-react";

interface UnitDetailProps {
  onNavigate: (screen: string, data?: any) => void;
  unitData?: any;
}

export function UnitDetail({ onNavigate, unitData }: UnitDetailProps) {
  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-4xl mx-auto">
      {/* Hero Section */}
      <Card className="overflow-hidden text-white border-0 shadow-xl" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)' }}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="bg-white/30 text-white border-0 mb-2">基礎理論</Badge>
              <h1 className="text-white text-3xl mb-2">論理回路</h1>
              <p className="text-sm">基本から応用まで完全マスター</p>
            </div>
            <div className="text-5xl animate-float">⚡</div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 md:gap-4 mt-4">
            <div className="bg-white/20 rounded-lg p-3 md:p-4 text-center backdrop-blur">
              <div className="text-2xl mb-1">⏱️</div>
              <p className="text-xs">学習時間</p>
              <p className="text-sm">2h 30m</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur">
              <div className="text-2xl mb-1">📝</div>
              <p className="text-xs">問題数</p>
              <p className="text-sm">20問</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur">
              <div className="text-2xl mb-1">⭐</div>
              <p className="text-xs">難易度</p>
              <p className="text-sm">★★☆</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      <Card className="p-4 border-2 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-500" />
          <h2>あなたの進捗</h2>
          <Badge className="ml-auto bg-blue-100 text-blue-700 border-0">進行中</Badge>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border-2 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                ✓
              </div>
              <div>
                <p>解説</p>
                <p className="text-xs text-muted-foreground">完了</p>
              </div>
            </div>
            <Star className="w-5 h-5 text-green-500 fill-green-500" />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border-2 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                ✓
              </div>
              <div>
                <p>練習</p>
                <p className="text-xs text-muted-foreground">完了</p>
              </div>
            </div>
            <Star className="w-5 h-5 text-green-500 fill-green-500" />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white animate-pulse">
                <RotateCw className="w-5 h-5" />
              </div>
              <div>
                <p>テスト</p>
                <p className="text-xs text-muted-foreground">9/20問 完了</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm">45%</p>
              <Progress value={45} className="w-20 h-2 mt-1" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">正解率</p>
            <p className="text-xl">45%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">最終学習</p>
            <p className="text-xl">2h前</p>
          </div>
        </div>
      </Card>

      {/* Learning Content */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="mb-3">📝 学習内容</h2>
        <div className="space-y-2">
          {['基本論理回路', '組み合わせ論理回路', '半加算器と全加算器'].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
                {idx + 1}
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Learning Actions */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          学習を始める
        </h2>
        
        <Button 
          className="w-full justify-start gap-4 h-auto py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
          onClick={() => onNavigate('explanation')}
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            📖
          </div>
          <div className="text-left flex-1">
            <p className="text-white">解説を読む</p>
            <p className="text-xs text-white/90">基礎から学ぶ</p>
          </div>
          <Badge className="bg-white/30 text-white border-0">5ページ</Badge>
        </Button>
        
        <Button 
          className="w-full justify-start gap-4 h-auto py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
          onClick={() => onNavigate('flashcard')}
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            🎴
          </div>
          <div className="text-left flex-1">
            <p className="text-white">フラッシュカード</p>
            <p className="text-xs text-white/90">記憶力チェック</p>
          </div>
          <Badge className="bg-white/30 text-white border-0">15枚</Badge>
        </Button>
        
        <Button 
          className="w-full justify-start gap-4 h-auto py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
          onClick={() => onNavigate('test')}
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl animate-pulse-glow">
            ✏️
          </div>
          <div className="text-left flex-1">
            <p className="text-white">テストを受ける</p>
            <p className="text-xs text-white/90">実力を試す</p>
          </div>
          <Badge className="bg-yellow-400 text-yellow-900 border-0">+50 XP</Badge>
        </Button>
      </div>

      {/* Next Units */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <h2 className="mb-3">➡️ 次の単元</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow border-2 border-blue-200">
            <span className="text-xl">🖥️</span>
            <div className="flex-1">
              <p className="text-sm">組み合わせ回路</p>
              <p className="text-xs text-muted-foreground">推奨：次の学習</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-0">学習可能</Badge>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-xl">⚡</span>
            <div className="flex-1">
              <p className="text-sm">順序回路</p>
              <p className="text-xs text-muted-foreground">その後の学習</p>
            </div>
            <Badge className="bg-gray-100 text-gray-700 border-0">未学習</Badge>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-xl">💾</span>
            <div className="flex-1">
              <p className="text-sm">半加算器・全加算器</p>
              <p className="text-xs text-muted-foreground">応用学習</p>
            </div>
            <Badge className="bg-gray-100 text-gray-700 border-0">未学習</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
