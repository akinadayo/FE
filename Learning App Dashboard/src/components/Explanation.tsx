import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Slider } from "./ui/slider";

interface ExplanationProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function Explanation({ onNavigate }: ExplanationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <div className="flex flex-col h-full pb-4 md:pb-6 max-w-4xl mx-auto">
      <div className="flex-1 space-y-6 overflow-auto md:max-h-[calc(100vh-12rem)]">
        <Card className="p-6 space-y-4">
          <h1>基本論理回路</h1>
          
          <p>
            論理回路は、0と1の2値で情報を処理する電子回路です。
          </p>

          <div className="bg-muted p-6 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">[図: AND回路のイメージ]</p>
            <div className="inline-flex gap-4 items-center">
              <div className="space-y-1">
                <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center">A</div>
                <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center">B</div>
              </div>
              <div className="w-16 h-16 border-2 border-foreground rounded flex items-center justify-center">
                AND
              </div>
              <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center">
                Y
              </div>
            </div>
          </div>

          <div>
            <h2>AND回路（論理積）</h2>
            <p>両方の入力が1のときのみ出力が1になります。</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-center">A</th>
                  <th className="p-2 text-center">B</th>
                  <th className="p-2 text-center">出力</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 text-center">0</td>
                  <td className="p-2 text-center">0</td>
                  <td className="p-2 text-center">0</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-center">0</td>
                  <td className="p-2 text-center">1</td>
                  <td className="p-2 text-center">0</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-center">1</td>
                  <td className="p-2 text-center">0</td>
                  <td className="p-2 text-center">0</td>
                </tr>
                <tr>
                  <td className="p-2 text-center">1</td>
                  <td className="p-2 text-center">1</td>
                  <td className="p-2 text-center">1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <span>💡</span>
              <div>
                <p className="text-sm">ポイント</p>
                <p className="text-sm">「かつ」を表す回路です。</p>
              </div>
            </div>
          </Card>
        </Card>
      </div>

      {/* Navigation */}
      <div className="md:static fixed bottom-16 md:bottom-0 left-0 right-0 bg-background border-t p-4 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            前へ
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            次へ
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Slider 
            value={[currentPage]} 
            min={1} 
            max={totalPages} 
            step={1}
            onValueChange={(v) => setCurrentPage(v[0])}
          />
          <p className="text-center text-sm text-muted-foreground">{currentPage} / {totalPages}</p>
        </div>

        {currentPage === totalPages && (
          <Button 
            className="w-full"
            onClick={() => onNavigate('flashcard')}
          >
            解説を完了する
          </Button>
        )}
      </div>
    </div>
  );
}
