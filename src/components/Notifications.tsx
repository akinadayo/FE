"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useNotifications, Notification as NotificationType } from "@/lib/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { useSoundEffect } from "@/hooks/use-sound";

interface NotificationsProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
}

export function Notifications({ onNavigate }: NotificationsProps) {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications(user?.id);
  const playSound = useSoundEffect();

  const handleNotificationClick = async (notification: NotificationType) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
      playSound('click');
    }

    // Navigate to link screen if available
    if (notification.link_screen) {
      onNavigate(notification.link_screen, notification.link_data);
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      playSound('complete');
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    const result = await deleteNotification(notificationId);
    if (result.success) {
      playSound('click');
    }
  };

  const handleClearAll = async () => {
    if (confirm('すべての通知を削除しますか？')) {
      const result = await clearAll();
      if (result.success) {
        playSound('click');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return '👥';
      case 'friend_accepted':
        return '🤝';
      case 'achievement':
        return '🏆';
      case 'test_score':
        return '📝';
      case 'streak':
        return '🔥';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4 md:pb-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🔔 通知</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              未読 {unreadCount}件
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="!opacity-100"
                  style={{ opacity: 1 }}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  すべて既読
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                すべて削除
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-12 text-center" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">通知はありません</h3>
          <p className="text-sm text-muted-foreground">
            新しい通知が届くとここに表示されます
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                notification.read ? 'bg-white' : 'bg-blue-50/50 border-l-4 border-l-blue-500'
              }`}
              style={{
                backgroundColor: notification.read ? '#ffffff' : '#eff6ff',
                opacity: 1
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-2xl shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge className="bg-blue-500 text-white border-0 text-xs px-2 py-0 shrink-0" style={{ backgroundColor: '#3b82f6' }}>
                        未読
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notification.created_at)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="h-auto p-1 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
