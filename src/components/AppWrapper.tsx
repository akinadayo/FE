"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/contexts/auth-context";
import { Home } from "@/components/Home";
import { Learning } from "@/components/Learning";
import { UnitDetail } from "@/components/UnitDetail";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useIsMobile } from "@/components/ui/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Dynamically import heavy components to reduce initial bundle size
const Explanation = dynamic(() => import("@/components/Explanation").then(mod => ({ default: mod.Explanation })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const Flashcard = dynamic(() => import("@/components/Flashcard").then(mod => ({ default: mod.Flashcard })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const Test = dynamic(() => import("@/components/Test").then(mod => ({ default: mod.Test })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const TestResult = dynamic(() => import("@/components/TestResult").then(mod => ({ default: mod.TestResult })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const Statistics = dynamic(() => import("@/components/Statistics").then(mod => ({ default: mod.Statistics })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const Friends = dynamic(() => import("@/components/Friends").then(mod => ({ default: mod.Friends })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const Settings = dynamic(() => import("@/components/Settings").then(mod => ({ default: mod.Settings })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const Notifications = dynamic(() => import("@/components/Notifications").then(mod => ({ default: mod.Notifications })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const Achievements = dynamic(() => import("@/components/Achievements").then(mod => ({ default: mod.Achievements })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

const Goals = dynamic(() => import("@/components/Goals").then(mod => ({ default: mod.Goals })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

type Screen =
  | 'home'
  | 'learning'
  | 'unitDetail'
  | 'explanation'
  | 'flashcard'
  | 'test'
  | 'testResult'
  | 'statistics'
  | 'friends'
  | 'goals'
  | 'settings'
  | 'notifications'
  | 'achievements';

interface NavigationState {
  screen: Screen;
  data?: Record<string, unknown>;
  history: Array<{ screen: Screen; data?: Record<string, unknown> }>;
}

export function AppWrapper() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [navigation, setNavigation] = useState<NavigationState>({
    screen: 'home',
    history: []
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    window.location.href = '/login';
    return null;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Temporary: Allow access without auth
  // if (!user) {
  //   return null;
  // }

  const navigate = (screen: string, data?: Record<string, unknown>) => {
    setNavigation(prev => ({
      screen: screen as Screen,
      data,
      history: [...prev.history, { screen: prev.screen, data: prev.data }]
    }));
  };

  const goBack = () => {
    setNavigation(prev => {
      const newHistory = [...prev.history];
      const previous = newHistory.pop();
      if (previous) {
        return {
          screen: previous.screen,
          data: previous.data,
          history: newHistory
        };
      }
      return prev;
    });
  };

  const getHeaderTitle = () => {
    switch (navigation.screen) {
      case 'home': return 'FE学習アプリ';
      case 'learning': return '学習コンテンツ';
      case 'unitDetail': return '論理回路';
      case 'explanation': return '論理回路 - 解説';
      case 'flashcard': return 'フラッシュカード';
      case 'test': return '論理回路 テスト';
      case 'testResult': return 'テスト結果';
      case 'statistics': return '学習統計';
      case 'friends': return 'フレンド';
      case 'goals': return '学習目標';
      case 'settings': return '設定';
      case 'notifications': return '通知';
      case 'achievements': return '達成バッジ';
      default: return 'FE学習アプリ';
    }
  };

  const showBackButton = () => {
    return ['unitDetail', 'explanation', 'flashcard', 'test', 'testResult', 'settings', 'notifications', 'achievements'].includes(navigation.screen);
  };

  const showSearchButton = () => {
    return navigation.screen === 'learning';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ background: '#3b82f6' }} />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ background: '#10b981', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ background: '#60a5fa', animationDelay: '4s' }} />
      </div>

      <div className={`relative ${isMobile ? '' : 'mx-auto flex max-w-7xl'}`}>
        {/* Desktop Sidebar Navigation */}
        {!isMobile && (
          <div className="hidden md:block w-64 lg:w-80 flex-shrink-0">
            <div className="sticky top-0 h-screen overflow-y-auto p-6 space-y-4">
              <div className="mb-8">
                <h1 className="text-2xl mb-2">FE学習アプリ</h1>
                <p className="text-sm text-muted-foreground">基本情報技術者試験対策</p>
              </div>

              {[
                { id: 'home', label: 'ホーム', emoji: '🏠', color: '#3b82f6' },
                { id: 'learning', label: '学習', emoji: '📚', color: '#2563eb' },
                { id: 'statistics', label: '統計', emoji: '📊', color: '#10b981' },
                { id: 'goals', label: '目標', emoji: '🎯', color: '#a855f7' },
                { id: 'friends', label: '友達', emoji: '👥', color: '#f59e0b' },
                { id: 'settings', label: '設定', emoji: '⚙️', color: '#6b7280' },
              ].map((item) => {
                const isActive = navigation.screen === item.id ||
                  (item.id === 'learning' && ['unitDetail', 'explanation', 'flashcard', 'test', 'testResult'].includes(navigation.screen));

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id as Screen)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'text-white shadow-lg scale-105'
                        : 'bg-white/60 hover:bg-white/80 hover:shadow-md'
                    }`}
                    style={isActive ? { background: item.color } : undefined}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-lg">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {navigation.screen !== 'test' && (
            <Header
              title={getHeaderTitle()}
              showBack={showBackButton()}
              showSearch={showSearchButton()}
              onBack={goBack}
              onNavigate={navigate}
              onMenuClick={() => setIsMenuOpen(true)}
            />
          )}

          <div className={`${navigation.screen === 'test' ? 'h-full' : isMobile ? 'px-4 pt-4 pb-24 max-w-2xl mx-auto' : 'p-6 lg:p-8'}`}>
            {navigation.screen === 'home' && <Home onNavigate={navigate} />}
            {navigation.screen === 'learning' && <Learning onNavigate={navigate} />}
            {navigation.screen === 'unitDetail' && <UnitDetail onNavigate={navigate} unitData={navigation.data as { topicId: string }} />}
            {navigation.screen === 'explanation' && <Explanation onNavigate={navigate} unitData={navigation.data as { topicId: string }} />}
            {navigation.screen === 'flashcard' && <Flashcard onNavigate={navigate} unitData={navigation.data as { topicId: string }} />}
            {navigation.screen === 'test' && <Test onNavigate={navigate} unitData={navigation.data as { topicId: string }} />}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {navigation.screen === 'testResult' && <TestResult onNavigate={navigate} resultData={navigation.data as any} />}
            {navigation.screen === 'statistics' && <Statistics onNavigate={navigate} />}
            {navigation.screen === 'goals' && <Goals onNavigate={navigate} />}
            {navigation.screen === 'friends' && <Friends onNavigate={navigate} />}
            {navigation.screen === 'settings' && <Settings onNavigate={navigate} />}
            {navigation.screen === 'notifications' && <Notifications onNavigate={navigate} />}
            {navigation.screen === 'achievements' && <Achievements onNavigate={navigate} />}
          </div>

          {/* Mobile Bottom Nav */}
          {isMobile && navigation.screen !== 'test' && <BottomNav currentScreen={navigation.screen} onNavigate={navigate} />}
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {isMobile && (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetContent side="left" className="w-80 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
            <SheetHeader>
              <SheetTitle className="text-2xl mb-2">FE学習アプリ</SheetTitle>
              <p className="text-sm text-muted-foreground text-left">基本情報技術者試験対策</p>
            </SheetHeader>

            <div className="mt-8 space-y-3">
              {[
                { id: 'home', label: 'ホーム', emoji: '🏠', color: '#3b82f6' },
                { id: 'learning', label: '学習', emoji: '📚', color: '#2563eb' },
                { id: 'statistics', label: '統計', emoji: '📊', color: '#10b981' },
                { id: 'goals', label: '目標', emoji: '🎯', color: '#a855f7' },
                { id: 'friends', label: '友達', emoji: '👥', color: '#f59e0b' },
                { id: 'settings', label: '設定', emoji: '⚙️', color: '#6b7280' },
              ].map((item) => {
                const isActive = navigation.screen === item.id ||
                  (item.id === 'learning' && ['unitDetail', 'explanation', 'flashcard', 'test', 'testResult'].includes(navigation.screen));

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.id as Screen);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'text-white shadow-lg scale-105'
                        : 'bg-white/60 hover:bg-white/80 hover:shadow-md'
                    }`}
                    style={isActive ? { background: item.color } : undefined}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-lg">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
