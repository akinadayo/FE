"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MessageCircle, Send, X as CloseIcon } from 'lucide-react';
import { chatWithAI, ChatMessage } from '@/lib/openrouter';
import { useSoundEffect } from '@/hooks/use-sound';

interface AIChatProps {
  topicTitle: string;
  currentContent: string;
}

// Helper function to convert markdown to HTML
const convertMarkdown = (text: string) => {
  let html = text;

  // Convert **text** to <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert ### heading to <h3>heading</h3>
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>');

  // Convert #### heading to <h4>heading</h4>
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-sm font-semibold mt-2 mb-1">$1</h4>');

  // Convert --- to <hr>
  html = html.replace(/^---$/gm, '<hr class="my-2 border-gray-300">');

  // Convert markdown tables to HTML tables
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a table row (contains |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // Check if it's a separator line (:---:, :---, ---:, etc.)
      if (/^\|[\s:|-]+\|$/.test(line.trim())) {
        // Skip separator lines
        continue;
      }

      if (inList) {
        processedLines.push(renderList(listItems));
        listItems = [];
        inList = false;
      }

      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      // List item
      if (inTable) {
        processedLines.push(renderTable(tableRows));
        tableRows = [];
        inTable = false;
      }

      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(line.trim().substring(2)); // Remove "* " or "- "
    } else {
      if (inTable) {
        // End of table, render it
        processedLines.push(renderTable(tableRows));
        tableRows = [];
        inTable = false;
      }
      if (inList) {
        processedLines.push(renderList(listItems));
        listItems = [];
        inList = false;
      }
      processedLines.push(line);
    }
  }

  // Handle table/list at end of text
  if (inTable && tableRows.length > 0) {
    processedLines.push(renderTable(tableRows));
  }
  if (inList && listItems.length > 0) {
    processedLines.push(renderList(listItems));
  }

  html = processedLines.join('\n');

  // Remove LaTeX commands that don't have direct HTML equivalents
  html = html.replace(/\\underbrace\{([^}]+)\}/g, '$1');
  html = html.replace(/\\overbrace\{([^}]+)\}/g, '$1');
  html = html.replace(/\\quad/g, ' ');
  html = html.replace(/\\rightarrow/g, '→');
  html = html.replace(/\\leftarrow/g, '←');
  html = html.replace(/\\Rightarrow/g, '⇒');
  html = html.replace(/\\Leftarrow/g, '⇐');
  html = html.replace(/\\times/g, '×');
  html = html.replace(/\\div/g, '÷');
  html = html.replace(/\\pm/g, '±');
  html = html.replace(/\\cdot/g, '·');

  // Remove LaTeX \text{} commands
  html = html.replace(/\\text\{([^}]+)\}/g, '$1');

  // Convert LaTeX subscripts _{text} to <sub>text</sub>
  html = html.replace(/\_\{([^}]+)\}/g, '<sub>$1</sub>');

  // Convert LaTeX superscripts ^{text} to <sup>text</sup>
  html = html.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');

  // Convert simple subscripts _x to <sub>x</sub> (single character or digit)
  html = html.replace(/\_([0-9a-zA-Z])/g, '<sub>$1</sub>');

  // Convert simple superscripts ^x to <sup>x</sup> (single character or digit)
  html = html.replace(/\^([0-9a-zA-Z])/g, '<sup>$1</sup>');

  // Convert $$ formula $$ to formatted block
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="my-2 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">$1</div>');

  // Convert inline $ formula $ to inline code
  html = html.replace(/\$([^\$]+?)\$/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">$1</code>');

  return html;
};

function renderTable(rows: string[]): string {
  const tableHtml: string[] = [];
  tableHtml.push('<table class="my-3 w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">');

  rows.forEach((row, index) => {
    const cells = row.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);

    if (index === 0) {
      // First row is header
      tableHtml.push('<thead class="bg-gray-100 dark:bg-gray-800">');
      tableHtml.push('<tr>');
      cells.forEach(cell => {
        tableHtml.push(`<th class="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold">${cell}</th>`);
      });
      tableHtml.push('</tr>');
      tableHtml.push('</thead>');
      tableHtml.push('<tbody>');
    } else {
      // Data rows
      tableHtml.push('<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">');
      cells.forEach(cell => {
        tableHtml.push(`<td class="border border-gray-300 dark:border-gray-600 px-3 py-2">${cell}</td>`);
      });
      tableHtml.push('</tr>');
    }
  });

  tableHtml.push('</tbody>');
  tableHtml.push('</table>');
  return tableHtml.join('');
}

function renderList(items: string[]): string {
  const listHtml: string[] = [];
  listHtml.push('<ul class="my-2 ml-4 list-disc space-y-1">');
  items.forEach(item => {
    listHtml.push(`<li class="text-sm">${item}</li>`);
  });
  listHtml.push('</ul>');
  return listHtml.join('');
}

export function AIChat({ topicTitle, currentContent }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const playSound = useSoundEffect();

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    // 初回オープン時にシステムプロンプトを設定
    if (messages.length === 0) {
      const systemPrompt: ChatMessage = {
        role: 'system',
        content: `あなたは基本情報技術者試験の優秀な先生です。

現在ユーザーが学習しているトピック: ${topicTitle}

学習内容の概要:
${currentContent.substring(0, 500)}...

ユーザーからの質問に対して、以下の点に注意して回答してください：
1. 分かりやすく、丁寧な日本語で説明する
2. 具体例を交えて説明する
3. 基本情報技術者試験の出題範囲に沿った内容にする
4. 必要に応じて関連する用語も説明する
5. 回答は簡潔に、要点を押さえる`,
      };
      setMessages([systemPrompt]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    playSound('click');

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await chatWithAI(allMessages);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      playSound('notification');
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Floating button */}
      <Button
        onClick={handleOpen}
        className="rounded-full w-14 h-14 shadow-lg text-white"
        size="icon"
        style={{
          position: 'fixed',
          bottom: isMobile ? '5rem' : '1.5rem',
          right: '1.5rem',
          left: 'auto',
          zIndex: 9999,
          background: 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))',
        }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>

      {/* Chat sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 z-50 bg-white dark:bg-gray-900" style={{ zIndex: 9999 }}>
          <SheetHeader className="p-4 border-b bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <SheetTitle>AI先生に質問</SheetTitle>
                  <p className="text-xs text-muted-foreground">{topicTitle}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <CloseIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
            </div>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
            {messages
              .filter((m) => m.role !== 'system')
              .map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`max-w-[85%] p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <div
                      className="text-sm whitespace-pre-wrap leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: convertMarkdown(message.content) }}
                    />
                  </Card>
                </div>
              ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="max-w-[85%] p-3 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="質問を入力..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              EnterキーまたはShift+Enterで送信
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>,
    document.body
  );
}
