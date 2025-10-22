import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";

interface SettingsProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
      {/* Profile */}
      <Card className="p-4">
        <h2 className="mb-3">👤 プロフィール</h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
            👤
          </div>
          <div className="space-y-1">
            <p>山田太郎</p>
            <p className="text-sm text-muted-foreground">ID: yamada_2025</p>
            <div className="flex items-center gap-1">
              <span className="text-sm">レベル: 15</span>
              <span>⭐⭐⭐</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Study Goals */}
      <Card className="p-4">
        <h2 className="mb-3">🎯 学習目標</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>1日の目標時間:</span>
            <span>2時間</span>
          </div>
          <div className="flex items-center justify-between">
            <span>試験予定日:</span>
            <span>2025/04/15</span>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-4">
        <h2 className="mb-3">🔔 通知設定</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">└ 学習リマインダー</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">└ フレンド通知</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">└ 達成バッジ</span>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* App Settings */}
      <Card className="p-4">
        <h2 className="mb-3">📱 アプリ設定</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">└ ダークモード</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">└ 音声読み上げ</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">└ データ同期</span>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card className="p-4">
        <h2 className="mb-3">🔐 アカウント</h2>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-between">
            <span className="text-sm">└ パスワード変更</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-between">
            <span className="text-sm">└ データのエクスポート</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-between text-red-600">
            <span className="text-sm">└ ログアウト</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Other */}
      <Card className="p-4">
        <h2 className="mb-3">ℹ️ その他</h2>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-between">
            <span className="text-sm">└ 利用規約</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-between">
            <span className="text-sm">└ プライバシーポリシー</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-between">
            <span className="text-sm">└ アプリについて</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-between">
            <span className="text-sm">└ お問い合わせ</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
