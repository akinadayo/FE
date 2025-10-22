interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'ホーム', emoji: '🏠', color: '#3b82f6' },
    { id: 'learning', label: '学習', emoji: '📚', color: '#2563eb' },
    { id: 'statistics', label: '統計', emoji: '📊', color: '#10b981' },
    { id: 'friends', label: '友達', emoji: '👥', color: '#f59e0b' },
  ];

  const isActive = (itemId: string) => {
    if (itemId === currentScreen) return true;
    if (itemId === 'learning' && ['unitDetail', 'explanation', 'flashcard', 'test', 'testResult'].includes(currentScreen)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t shadow-lg">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-1 py-3 px-4 flex-1 transition-all duration-300"
            >
              {active && (
                <div className="absolute inset-0 opacity-10 rounded-lg" 
                     style={{ background: item.color }} />
              )}
              
              <div className={`relative text-3xl transition-all duration-300 ${
                active ? 'scale-110 animate-float' : 'scale-100'
              }`}>
                {item.emoji}
              </div>
              
              <span className={`text-xs transition-all duration-300 ${
                active ? 'font-medium' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
              
              {active && (
                <div className={`absolute -bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full`} style={{ background: item.color }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
