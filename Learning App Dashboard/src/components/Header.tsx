import { ArrowLeft, Menu, Bell, User, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  onBack?: () => void;
  onNavigate: (screen: string) => void;
  onMenuClick?: () => void;
}

export function Header({ title, showBack, showSearch, onBack, onNavigate, onMenuClick }: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b shadow-sm">
      <div className="flex items-center justify-between p-4 max-w-2xl mx-auto md:px-6 lg:px-8 md:max-w-none">
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-purple-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="hover:bg-purple-100" onClick={onMenuClick}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg">{title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="sm" className="hover:bg-blue-50">
              <Search className="w-5 h-5" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('settings')}
            className="relative hover:bg-blue-50"
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs border-2 border-white">
              3
            </Badge>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('settings')}
            className="hover:bg-blue-50"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: '#3b82f6' }}>
              <User className="w-4 h-4" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
