import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Lock, CheckCircle2, PlayCircle, Trophy, Sparkles } from "lucide-react";

interface LearningProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function Learning({ onNavigate }: LearningProps) {
  const categories = [
    {
      id: 'tech',
      name: 'テクノロジ系',
      icon: '💻',
      color: '#3b82f6',
      progress: 25,
      total: 40,
      units: [
        {
          id: 'basic-theory',
          name: '基礎理論',
          icon: '🧮',
          status: 'completed',
          lessons: [
            { id: 'n-ary', name: 'n進数', progress: 100, stars: 3 },
            { id: 'logic-operation', name: '論理演算', progress: 100, stars: 3 },
            { id: 'logic-circuit', name: '論理回路', progress: 45, stars: 1 },
          ]
        },
        {
          id: 'computer-system',
          name: 'コンピュータシステム',
          icon: '🖥️',
          status: 'locked',
          lessons: [
            { id: 'cpu', name: 'CPU', progress: 0, stars: 0 },
            { id: 'memory', name: 'メモリ', progress: 0, stars: 0 },
            { id: 'os', name: 'OS', progress: 0, stars: 0 },
          ]
        },
        {
          id: 'tech-elements',
          name: '技術要素',
          icon: '⚙️',
          status: 'locked',
          lessons: []
        }
      ]
    },
    {
      id: 'management',
      name: 'マネジメント系',
      icon: '📊',
      color: '#10b981',
      progress: 0,
      total: 10,
      units: [
        { id: 'project', name: 'プロジェクトMGT', icon: '📋', status: 'locked', lessons: [] },
        { id: 'service', name: 'サービスMGT', icon: '🔧', status: 'locked', lessons: [] }
      ]
    },
    {
      id: 'strategy',
      name: 'ストラテジ系',
      icon: '🎯',
      color: '#f59e0b',
      progress: 0,
      total: 15,
      units: [
        { id: 'system-strategy', name: 'システム戦略', icon: '💡', status: 'locked', lessons: [] },
        { id: 'business-strategy', name: '経営戦略', icon: '📈', status: 'locked', lessons: [] }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-4 md:pb-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white animate-slide-in" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">学習を始めよう！</span>
          </div>
          <h2 className="text-white mb-1">全48単元</h2>
          <p className="text-sm mb-3">基本情報技術者試験の完全マスター</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={37.5} className="h-3 bg-white/30" />
            </div>
            <span className="text-sm">18/48</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Categories */}
      {categories.map((category, idx) => (
        <div key={category.id} className="animate-slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
          <Card className={`overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300`}>
            {/* Category Header */}
            <div className={`p-4 text-white`} style={{ background: category.color }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{category.icon}</div>
                  <div>
                    <h3 className="text-white">{category.name}</h3>
                    <p className="text-sm">
                      {category.progress}/{category.total} 単元完了
                    </p>
                  </div>
                </div>
                <Trophy className="w-6 h-6 opacity-70" />
              </div>
              <Progress value={(category.progress / category.total) * 100} className="h-2 bg-white/30" />
            </div>

            {/* Units Grid */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
              {category.units.map((unit) => (
                <Card
                  key={unit.id}
                  className={`p-4 md:p-5 transition-all duration-300 ${
                    unit.status === 'locked'
                      ? 'opacity-60 bg-gray-50'
                      : 'hover:shadow-md hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-gray-50'
                  }`}
                  onClick={() => unit.status !== 'locked' && onNavigate('unitDetail', { unitId: unit.id })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl ${unit.status === 'locked' ? 'grayscale' : ''}`}>
                      {unit.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{unit.name}</span>
                        {unit.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                        {unit.status === 'locked' && (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Lessons */}
                      {unit.lessons.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {unit.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (unit.status !== 'locked') {
                                  onNavigate('unitDetail', { unitId: lesson.id });
                                }
                              }}
                            >
                              <div className="flex items-center gap-1.5 flex-1">
                                {lesson.progress === 100 ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : lesson.progress > 0 ? (
                                  <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}
                                <span className="text-sm">{lesson.name}</span>
                              </div>
                              
                              {/* Stars */}
                              <div className="flex gap-0.5">
                                {[...Array(3)].map((_, i) => (
                                  <span key={i} className="text-xs">
                                    {i < lesson.stars ? '⭐' : '☆'}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Progress Badge */}
                              {lesson.progress > 0 && (
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs px-2 ${
                                    lesson.progress === 100 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {lesson.progress}%
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      ))}

      {/* Motivational Footer */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="text-center space-y-2">
          <div className="text-3xl">🎉</div>
          <p>毎日コツコツ続けて合格を目指そう！</p>
          <p className="text-sm text-muted-foreground">あと30単元で全体の80%達成です</p>
        </div>
      </Card>
    </div>
  );
}
