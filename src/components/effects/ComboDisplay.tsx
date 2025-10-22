"use client";

interface ComboDisplayProps {
  combo: number;
}

export function ComboDisplay({ combo }: ComboDisplayProps) {
  if (combo < 2) return null;

  const getComboMessage = () => {
    if (combo >= 10) return '神連続！';
    if (combo >= 5) return '素晴らしい連続！';
    if (combo >= 3) return '連続正解！';
    return '連続中！';
  };

  const getComboColor = () => {
    if (combo >= 10) return 'from-yellow-400 via-orange-400 to-red-500';
    if (combo >= 5) return 'from-purple-400 via-pink-400 to-red-400';
    if (combo >= 3) return 'from-blue-400 via-cyan-400 to-teal-400';
    return 'from-green-400 via-emerald-400 to-teal-400';
  };

  return (
    <div className="combo-display fixed top-32 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className={`combo-content bg-gradient-to-r ${getComboColor()} text-white px-6 py-3 rounded-full shadow-2xl`}>
        <div className="flex items-center gap-3">
          <div className="text-4xl font-black combo-number">
            {combo}
          </div>
          <div className="text-sm font-semibold">
            <div>{getComboMessage()}</div>
            <div className="text-xs opacity-90">COMBO</div>
          </div>
        </div>
      </div>
    </div>
  );
}
