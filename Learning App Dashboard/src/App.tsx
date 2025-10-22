import { useState } from "react";
import { Home } from "./components/Home";
import { Learning } from "./components/Learning";
import { UnitDetail } from "./components/UnitDetail";
import { Explanation } from "./components/Explanation";
import { Flashcard } from "./components/Flashcard";
import { Test } from "./components/Test";
import { TestResult } from "./components/TestResult";
import { Statistics } from "./components/Statistics";
import { Friends } from "./components/Friends";
import { Settings } from "./components/Settings";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { useIsMobile } from "./components/ui/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./components/ui/sheet";

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
  | 'settings';

interface NavigationState {
  screen: Screen;
  data?: any;
  history: Array<{ screen: Screen; data?: any }>;
}

export default function App() {
  const isMobile = useIsMobile();
  const [navigation, setNavigation] = useState<NavigationState>({
    screen: 'home',
    history: []
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = (screen: Screen, data?: any) => {
    setNavigation(prev => ({
      screen,
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
      case 'settings': return '設定';
      default: return 'FE学習アプリ';
    }
  };

  const showBackButton = () => {
    return ['unitDetail', 'explanation', 'flashcard', 'test', 'testResult', 'settings'].includes(navigation.screen);
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
            {navigation.screen === 'unitDetail' && <UnitDetail onNavigate={navigate} unitData={navigation.data} />}
            {navigation.screen === 'explanation' && <Explanation onNavigate={navigate} />}
            {navigation.screen === 'flashcard' && <Flashcard onNavigate={navigate} />}
            {navigation.screen === 'test' && <Test onNavigate={navigate} />}
            {navigation.screen === 'testResult' && <TestResult onNavigate={navigate} />}
            {navigation.screen === 'statistics' && <Statistics onNavigate={navigate} />}
            {navigation.screen === 'friends' && <Friends onNavigate={navigate} />}
            {navigation.screen === 'settings' && <Settings onNavigate={navigate} />}
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
