"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { getTopicById, getNextTopic } from "@/lib/syllabus";
import { useAuth } from "@/lib/contexts/auth-context";
import { useStudySession } from "@/lib/hooks/use-study-session";
import { useTopicActions } from "@/lib/hooks/use-topic-actions";
import { triggerAchievementCheckAfterTopicComplete } from "@/lib/achievements/trigger";
import { AIChat } from "@/components/AIChat";

interface ExplanationProps {
  onNavigate: (screen: string, data?: Record<string, unknown>) => void;
  unitData?: { topicId: string };
}

interface ExplanationSection {
  type: 'text' | 'highlight' | 'list' | 'table' | 'example' | 'formula';
  content?: string;
  icon?: string;
  title?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

interface ExplanationPage {
  id: number;
  title: string;
  sections: ExplanationSection[];
}

interface ExplanationData {
  topicId: string;
  title: string;
  pages: ExplanationPage[];
}

// Helper function to convert simple markdown to HTML
const convertMarkdown = (text: string) => {
  // Convert **text** to <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

export function Explanation({ onNavigate, unitData }: ExplanationProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [topicStatus, setTopicStatus] = useState<string | null>(null);

  const { startSession, endSession } = useStudySession(user?.id, unitData?.topicId);
  const { markExplanationCompleted } = useTopicActions(user?.id);

  const topic = unitData?.topicId ? getTopicById(unitData.topicId) : null;
  const nextTopic = unitData?.topicId ? getNextTopic(unitData.topicId) : null;

  // Load topic status
  useEffect(() => {
    async function loadTopicStatus() {
      if (!unitData?.topicId) return;

      try {
        const response = await fetch('/data/topic-status.json');
        if (response.ok) {
          const data = await response.json();
          const status = data.topics[unitData.topicId]?.status;
          setTopicStatus(status || null);
        }
      } catch (error) {
        console.error('Error loading topic status:', error);
      }
    }

    loadTopicStatus();
  }, [unitData?.topicId]);

  // Load explanation data
  useEffect(() => {
    async function loadExplanation() {
      if (!unitData?.topicId) return;

      try {
        const response = await fetch(`/data/explanations/${unitData.topicId}.json`);
        if (!response.ok) {
          throw new Error('Explanation not found');
        }
        const data = await response.json();
        setExplanationData(data);
      } catch (error) {
        console.error('Error loading explanation:', error);
        // Use fallback data
        const currentTopic = getTopicById(unitData.topicId);
        setExplanationData({
          topicId: unitData.topicId,
          title: currentTopic?.タイトル || '解説',
          pages: [{
            id: 1,
            title: '解説準備中',
            sections: [{
              type: 'text',
              content: 'この単元の解説は現在準備中です。しばらくお待ちください。'
            }]
          }]
        });
      } finally {
        setLoading(false);
      }
    }

    loadExplanation();
  }, [unitData?.topicId]);

  // Start study session on mount (エラーが発生してもアプリを停止させない)
  useEffect(() => {
    startSession().catch(() => {
      // Ignore session errors - session tracking is optional
    });
    return () => {
      endSession().catch(() => {
        // Ignore session errors
      });
    };
  }, [startSession, endSession]);

  const handleComplete = async () => {
    if (!unitData?.topicId) {
      console.error('No topicId found');
      return;
    }

    console.log('Starting handleComplete for topic:', unitData.topicId);
    setCompleting(true);
    try {
      console.log('Calling markExplanationCompleted...');
      await markExplanationCompleted(unitData.topicId);
      console.log('markExplanationCompleted completed successfully');

      // Check for new achievements
      if (user?.id) {
        await triggerAchievementCheckAfterTopicComplete(user.id).catch((error) => {
          console.error('Failed to check achievements:', error);
        });
      }

      await endSession().catch(() => {
        // Ignore session errors
      });

      // Show completion screen
      setCompleted(true);
    } catch (error) {
      console.error('Error completing explanation:', error);
      alert('解説の完了処理でエラーが発生しました。もう一度お試しください。');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-muted-foreground">解説を読み込み中...</p>
      </div>
    );
  }

  if (!explanationData) {
    return (
      <div className="space-y-6 pb-4 md:pb-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">解説データが見つかりません</p>
          <Button onClick={() => onNavigate('unitDetail', { topicId: unitData?.topicId })} className="mt-4">
            単元詳細に戻る
          </Button>
        </Card>
      </div>
    );
  }

  // Check if content is not ready
  if (topicStatus === 'coming_soon' || topicStatus === 'not_created') {
    return (
      <div className="flex flex-col h-full pb-4 md:pb-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">解説</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl mb-1">{explanationData.title}</h1>
        </div>

        <Card className="p-8 text-center bg-yellow-50 border-yellow-200 border-2">
          <div className="space-y-4">
            <div className="text-6xl">🚧</div>
            <h3 className="text-xl font-semibold text-yellow-800">
              このコンテンツは現在準備中です
            </h3>
            <p className="text-yellow-700">
              近日公開予定です。しばらくお待ちください。
            </p>
            <Button
              onClick={() => onNavigate('unitDetail', { topicId: unitData?.topicId })}
              className="mt-6 bg-yellow-600 hover:bg-yellow-700"
            >
              単元詳細に戻る
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show completion screen
  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 max-w-2xl mx-auto">
        <Card className="p-8 text-center w-full">
          <div className="space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold">解説を完了しました！</h2>
            <p className="text-muted-foreground">
              {explanationData.title}の解説を完了しました。
            </p>

            <div className="space-y-3 pt-4">
              {nextTopic && (
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  onClick={() => onNavigate('explanation', { topicId: nextTopic.id })}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  次のトピック: {nextTopic.タイトル}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('unitDetail', { topicId: unitData?.topicId })}
              >
                単元詳細に戻る
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onNavigate('home')}
              >
                ホームに戻る
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const totalPages = explanationData.pages.length;
  const currentPageData = explanationData.pages[currentPage - 1];

  const renderSection = (section: ExplanationSection, index: number) => {
    switch (section.type) {
      case 'text':
        return (
          <p
            key={index}
            className="text-base leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: convertMarkdown(section.content || '') }}
          />
        );

      case 'highlight':
        return (
          <Card key={index} className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              {section.icon && <span className="text-2xl">{section.icon}</span>}
              <div className="flex-1">
                {section.title && <p className="font-medium mb-1">{section.title}</p>}
                <p
                  className="text-sm whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: convertMarkdown(section.content || '') }}
                />
              </div>
            </div>
          </Card>
        );

      case 'list':
        return (
          <ul key={index} className="space-y-2 ml-6">
            {section.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span dangerouslySetInnerHTML={{ __html: convertMarkdown(item) }} />
              </li>
            ))}
          </ul>
        );

      case 'table':
        return (
          <div key={index} className="overflow-x-auto">
            {section.title && <p className="font-medium mb-2">{section.title}</p>}
            <table className="w-full border-collapse border border-border">
              {section.headers && (
                <thead>
                  <tr className="bg-muted">
                    {section.headers.map((header, i) => (
                      <th key={i} className="p-3 text-left border border-border font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {section.rows?.map((row, i) => (
                  <tr key={i} className="border-b border-border">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="p-3 border border-border"
                        dangerouslySetInnerHTML={{ __html: convertMarkdown(cell) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'example':
        return (
          <Card key={index} className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <div className="space-y-2">
              {section.title && (
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  📋 {section.title}
                </p>
              )}
              <pre className="text-sm font-mono whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-3 rounded">
                {section.content}
              </pre>
            </div>
          </Card>
        );

      case 'formula':
        return (
          <Card key={index} className="p-4 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
            <pre className="text-center font-mono text-base">
              {section.content}
            </pre>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col h-full pb-0 md:pb-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">解説</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl mb-1">{explanationData.title}</h1>
          <p className="text-sm text-muted-foreground">
            ページ {currentPage} / {totalPages}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2 overflow-auto md:max-h-[calc(100vh-16rem)] pb-1">
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">
              {currentPageData.title}
            </h2>

            {currentPageData.sections.map((section, index) => renderSection(section, index))}
          </Card>

          {/* Navigation - Mobile: inline */}
          <div className="md:hidden bg-white dark:bg-gray-900 border rounded-lg p-4 space-y-4">
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
              <p className="text-center text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </p>
            </div>

            {currentPage === totalPages && (
              <Button
                className="w-full"
                onClick={handleComplete}
                disabled={completing}
              >
                {completing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    完了処理中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    解説を完了する
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation - Desktop: fixed */}
        <div className="hidden md:block md:static bg-white dark:bg-gray-900 border-t p-4 space-y-4 max-w-4xl mx-auto">
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
            <p className="text-center text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </p>
          </div>

          {currentPage === totalPages && (
            <Button
              className="w-full"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  完了処理中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  解説を完了する
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* AI Chat */}
      {explanationData && currentPageData && (
        <AIChat
          topicTitle={explanationData.title}
          currentContent={JSON.stringify(currentPageData.sections)}
        />
      )}
    </>
  );
}
