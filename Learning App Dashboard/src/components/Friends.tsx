import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { UserPlus } from "lucide-react";

interface FriendsProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function Friends({ onNavigate }: FriendsProps) {
  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-4xl mx-auto">
      {/* Weekly Ranking */}
      <Card className="p-4">
        <h2 className="mb-4">🏆 今週のランキング</h2>
        <div className="space-y-3">
          <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥇</span>
                  <span>1位</span>
                  <span>田中太郎</span>
                </div>
                <p className="text-sm text-muted-foreground">52h 15m</p>
                <div className="flex gap-1">
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                </div>
                <p className="text-xs text-muted-foreground">テクノロジ完了</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥈</span>
                  <span>2位</span>
                  <span>あなた</span>
                </div>
                <p className="text-sm text-muted-foreground">45h 23m</p>
                <div className="flex gap-1">
                  <span>⭐</span>
                  <span>⭐</span>
                </div>
                <p className="text-xs text-green-600">正解率トップ！</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥉</span>
                  <span>3位</span>
                  <span>佐藤花子</span>
                </div>
                <p className="text-sm text-muted-foreground">38h 42m</p>
                <div className="flex gap-1">
                  <span>⭐</span>
                </div>
                <p className="text-xs text-muted-foreground">継続日数No.1</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Friends List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2>👥 フレンドリスト (12)</h2>
          <Button size="sm" variant="outline">
            <UserPlus className="w-4 h-4 mr-1" />
            追加
          </Button>
        </div>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              👤
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span>山田一郎</span>
                <span className="text-xs text-green-600">🟢 オンライン</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>今週: 18h</span>
                <span>正解率82%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              👤
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span>鈴木美咲</span>
                <span className="text-xs text-muted-foreground">⚪ 30分前</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>今週: 12h</span>
                <span>正解率75%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Group Study */}
      <Card className="p-4">
        <h3 className="mb-3">📊 グループ学習</h3>
        <div className="space-y-2">
          <p>「基本情報合格目指す会」</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>メンバー: 8人</p>
            <p>今週の総学習: 156h</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
