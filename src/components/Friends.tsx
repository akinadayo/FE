"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Search, Check, X, Trophy, Clock } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useFriends, useSearchUsers, useFriendActions, useFriendActivities } from "@/lib/hooks/use-friends";
import { useSoundEffect } from "@/hooks/use-sound";
import { getTopicById } from "@/lib/syllabus";

interface FriendsProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
}

export function Friends({ }: FriendsProps) {
  const { user } = useAuth();
  const { friends, pendingRequests, loading } = useFriends(user?.id);
  const { results, searching, search } = useSearchUsers(user?.id);
  const { processing, sendRequest, acceptRequest, rejectRequest } = useFriendActions(user?.id);
  const { activities, loading: activitiesLoading } = useFriendActivities(user?.id);
  const playSound = useSoundEffect();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      search(searchQuery);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    const result = await sendRequest(friendId);
    if (result.success) {
      playSound('notification');
      setSearchDialogOpen(false);
      setSearchQuery("");
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    const result = await acceptRequest(friendshipId);
    if (result.success) {
      playSound('achievement');
      window.location.reload(); // リロードして最新データを取得
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    const result = await rejectRequest(friendshipId);
    if (result.success) {
      playSound('click');
      window.location.reload();
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // フレンドを学習時間でソート（ランキング用）
  const rankedFriends = [...friends].sort((a, b) => b.weekly_study_minutes - a.weekly_study_minutes);

  if (loading) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-4xl mx-auto">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">👥 フレンド</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {friends.length}人のフレンド
          </p>
        </div>
        <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
          <DialogTrigger asChild>
            <Button className="!opacity-100">
              <UserPlus className="w-4 h-4 mr-2" />
              フレンド追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>フレンドを検索</DialogTitle>
              <DialogDescription>
                ユーザー名で検索してフレンドリクエストを送信できます
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ユーザー名を入力..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching} className="!opacity-100">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {searching && (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((user) => (
                    <Card key={user.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            👤
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <div className="flex gap-3 text-xs text-muted-foreground">
                              <span>{formatTime(user.study_time)}</span>
                              <span>{user.completed_topics}単元完了</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(user.id)}
                          disabled={processing}
                          className="!opacity-100"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          追加
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!searching && results.length === 0 && searchQuery && (
                <p className="text-center text-muted-foreground py-4">
                  ユーザーが見つかりませんでした
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-4 border-2 border-blue-200 bg-blue-50/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Badge className="bg-blue-500">
              {pendingRequests.length}
            </Badge>
            フレンドリクエスト
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="font-medium">{request.requester_username}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={processing}
                    className="!opacity-100"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    承認
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={processing}
                    className="!opacity-100"
                  >
                    <X className="w-4 h-4 mr-1" />
                    拒否
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">フレンド一覧</TabsTrigger>
          <TabsTrigger value="activities">アクティビティ</TabsTrigger>
          <TabsTrigger value="ranking">ランキング</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-3 mt-4">
          {friends.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                まだフレンドがいません
              </p>
              <Button className="!opacity-100" onClick={() => setSearchDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                フレンドを探す
              </Button>
            </Card>
          ) : (
            friends.map((friend) => (
              <Card key={friend.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl">
                    👤
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{friend.username}</h3>
                      <Badge variant="outline" className="text-xs">
                        {friend.completed_topics}単元完了
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>今週: {formatTime(friend.weekly_study_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Trophy className="w-4 h-4" />
                        <span>正解率: {friend.average_accuracy}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-3 mt-4">
          {activitiesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : activities.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                まだアクティビティがありません
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                フレンドが学習を完了すると、ここに表示されます
              </p>
            </Card>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-2">
                フレンドの最近の学習アクティビティ（過去24時間）
              </div>
              {activities.map((activity) => {
                const topic = activity.topic_id ? getTopicById(activity.topic_id) : null;
                const timeAgo = getTimeAgo(activity.created_at);

                return (
                  <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{activity.friend_username}</span>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            単元完了
                          </Badge>
                        </div>
                        {topic && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {topic.タイトル} を完了しました
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </>
          )}
        </TabsContent>

        <TabsContent value="ranking" className="space-y-3 mt-4">
          {rankedFriends.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                フレンドがいないためランキングを表示できません
              </p>
            </Card>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-2">
                今週の学習時間ランキング（フレンドのみ）
              </div>
              {rankedFriends.map((friend, index) => {
                const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
                const isTopThree = index < 3;

                return (
                  <Card
                    key={friend.id}
                    className={`p-4 ${
                      isTopThree
                        ? index === 0
                          ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300"
                          : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-300"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {rankEmoji && <span className="text-2xl">{rankEmoji}</span>}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{friend.username}</p>
                          {isTopThree && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                              TOP 3
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span className="font-medium">{formatTime(friend.weekly_study_minutes)}</span>
                          <span>正解率: {friend.average_accuracy}%</span>
                          <span>{friend.completed_topics}単元完了</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to format time ago
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'たった今';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}時間前`;
  return `${Math.floor(seconds / 86400)}日前`;
}
