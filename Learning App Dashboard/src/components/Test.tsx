import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Clock, Zap, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface TestProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function Test({ onNavigate }: TestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [inputAnswer, setInputAnswer] = useState("");
  const totalQuestions = 10;
  const timeRemaining = "12:35";

  const questions = [
    {
      type: 'multiple-choice',
      question: 'AND回路とOR回路を組み合わせた以下の回路の出力は？',
      diagram: true,
      input: 'A=1, B=0, C=1',
      options: ['0', '1', 'A AND B', 'わからない']
    },
    {
      type: 'input',
      question: '以下の真理値表を持つ論理回路の名称を答えなさい。',
      table: [
        ['A', 'B', '出力'],
        ['0', '0', '1'],
        ['0', '1', '1'],
        ['1', '0', '1'],
        ['1', '1', '0']
      ],
      hint: 'NOT + AND'
    }
  ];

  const question = questions[(currentQuestion - 1) % questions.length];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Exit Button */}
      <div className="flex justify-end p-4 pb-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-red-100 text-red-600">
              <X className="w-5 h-5 mr-2" />
              終了
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>問題演習を終了しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                まだ問題が残っています。終了すると、進捗は保存されません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={() => onNavigate('learning')} className="bg-red-600 hover:bg-red-700">
                終了する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
          {/* Header Card */}
          <Card className="p-4 text-white border-0 shadow-lg" style={{ background: 'linear-gradient(90deg, #6DBFF2, #85D3F2)' }}>
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-white/20 text-white border-0 backdrop-blur">
            問題 {currentQuestion}/{totalQuestions}
          </Badge>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{timeRemaining}</span>
          </div>
        </div>
        
        <Progress value={(currentQuestion / totalQuestions) * 100} className="h-3 bg-white/30 mb-2" />
        
        <div className="flex gap-1">
          {[...Array(totalQuestions)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < currentQuestion ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </Card>

      {/* Question Card */}
      <Card className="p-6 space-y-4 shadow-lg border-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 text-shadow" style={{ background: '#3B9DD9' }}>
            Q{currentQuestion}
          </div>
          <div className="flex-1">
            <h2 className="text-lg">{question.question}</h2>
          </div>
        </div>

        {question.type === 'multiple-choice' && (
          <>
            {question.diagram && (
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <p className="text-sm text-muted-foreground mb-2">回路図</p>
                <pre className="text-sm font-mono">
{`A ──┐
    ├─AND─┐
B ──┘      │
           ├─OR─ 出力
C ─────────┘`}
                </pre>
              </Card>
            )}

            {question.input && (
              <Card className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <p className="text-sm">
                  <span className="text-muted-foreground">入力:</span> {question.input}
                </p>
              </Card>
            )}

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-2">
                {question.options?.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const colors = [
                    'from-red-50 to-rose-50 border-red-200',
                    'from-blue-50 to-cyan-50 border-blue-200',
                    'from-green-50 to-emerald-50 border-green-200',
                    'from-blue-50 to-cyan-50 border-blue-200',
                  ];
                  
                  return (
                    <Card 
                      key={idx}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br ${
                        isSelected 
                          ? 'border-4 border-purple-500 shadow-lg scale-105' 
                          : `${colors[idx]} border-2`
                      }`}
                      onClick={() => setSelectedAnswer(option)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isSelected 
                            ? 'text-white scale-110' 
                            : 'border-gray-300 bg-white'
                        }`}
                        style={isSelected ? { background: '#6DBFF2', borderColor: '#6DBFF2' } : undefined}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-base">
                          {option}
                        </Label>
                        <RadioGroupItem value={option} id={`option-${idx}`} className="sr-only" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </RadioGroup>
          </>
        )}

        {question.type === 'input' && (
          <>
            {question.table && (
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <table className="w-full border-collapse">
                  {question.table.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx === 0 ? 'border-b-2 border-blue-300' : 'border-b border-blue-200'}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className={`p-3 text-center ${rowIdx === 0 ? 'font-medium' : ''}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </table>
              </Card>
            )}

            <div className="space-y-2">
              <Label className="text-base">答え:</Label>
              <Input
                placeholder="回答を入力してください"
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                className="h-12 text-lg border-2"
                style={{ focusBorderColor: '#6DBFF2' }}
              />
            </div>

            {question.hint && (
              <Card className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <div className="flex items-start gap-2">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm">ヒント</p>
                    <p className="text-sm text-muted-foreground">{question.hint}</p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </Card>

      {/* Action Button */}
      <Button 
        className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all text-lg"
        disabled={
          question.type === 'multiple-choice' 
            ? !selectedAnswer 
            : !inputAnswer
        }
        onClick={() => {
          if (currentQuestion === totalQuestions) {
            onNavigate('testResult');
          } else {
            setCurrentQuestion(c => c + 1);
            setSelectedAnswer("");
            setInputAnswer("");
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span>回答を確定</span>
          <Zap className="w-5 h-5" />
        </div>
      </Button>

          {/* XP Badge */}
          <Card className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 text-center" style={{ borderColor: '#6DBFF2' }}>
            <p className="text-sm text-muted-foreground">正解すると</p>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-yellow-400 text-yellow-900 border-0 text-lg px-3 py-1">
                +10 XP
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
