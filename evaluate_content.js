const fs = require('fs');
const path = require('path');

const BASE_PATH = '/Users/dcenter/Desktop/基本情報/fe-master/public/data';

// 全トピックリスト
const ALL_TOPICS = [
  // テクノロジ系 - 基礎理論
  'tech-1-1-1', 'tech-1-1-2', 'tech-1-1-3', 'tech-1-1-4',
  'tech-1-2-1', 'tech-1-2-2', 'tech-1-2-3',
  'tech-1-3-1', 'tech-1-3-2', 'tech-1-3-3',
  'tech-1-4-1', 'tech-1-4-2',
  // テクノロジ系 - コンピュータシステム
  'tech-2-1-1', 'tech-2-1-2', 'tech-2-1-3',
  'tech-2-2-1', 'tech-2-2-2', 'tech-2-2-3',
  'tech-2-3-1', 'tech-2-3-2', 'tech-2-3-3', 'tech-2-3-4', 'tech-2-3-5', 'tech-2-3-6',
  'tech-2-4-1', 'tech-2-4-2', 'tech-2-4-3',
  // テクノロジ系 - 技術要素
  'tech-3-1-1', 'tech-3-1-2',
  'tech-3-2-1', 'tech-3-2-2',
  'tech-3-3-1', 'tech-3-3-2', 'tech-3-3-3', 'tech-3-3-4', 'tech-3-3-5',
  'tech-3-4-1', 'tech-3-4-2', 'tech-3-4-3', 'tech-3-4-4',
  'tech-3-5-1', 'tech-3-5-2', 'tech-3-5-3', 'tech-3-5-4', 'tech-3-5-5',
  // テクノロジ系 - 開発技術
  'tech-4-1-1', 'tech-4-1-2', 'tech-4-1-3', 'tech-4-1-4', 'tech-4-1-5',
  'tech-4-2-1', 'tech-4-2-2', 'tech-4-2-3',
  'tech-4-3-1', 'tech-4-3-2', 'tech-4-3-3', 'tech-4-3-4', 'tech-4-3-5', 'tech-4-3-6',
  // マネジメント系
  'mgmt-1-1-1', 'mgmt-1-1-2', 'mgmt-1-1-3', 'mgmt-1-1-4', 'mgmt-1-1-5',
  'mgmt-2-1-1', 'mgmt-2-1-2', 'mgmt-2-1-3', 'mgmt-2-1-4', 'mgmt-2-1-5',
  'mgmt-2-2-1', 'mgmt-2-2-2',
  // ストラテジ系
  'strat-1-1-1', 'strat-1-1-2', 'strat-1-1-3', 'strat-1-1-4',
  'strat-1-2-1', 'strat-1-2-2',
  'strat-2-1-1', 'strat-2-1-2', 'strat-2-1-3',
  'strat-2-2-1',
  'strat-2-3-1', 'strat-2-3-2',
  'strat-3-1-1', 'strat-3-1-2', 'strat-3-1-3',
  'strat-3-2-1', 'strat-3-2-2',
  'strat-3-3-1', 'strat-3-3-2', 'strat-3-3-3', 'strat-3-3-4', 'strat-3-3-5',
  'strat-3-4-1'
];

function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function evaluateExplanation(data) {
  if (!data || !data.pages) return { score: 0, issues: ['ファイルが存在しないか読み込めません'] };

  const issues = [];
  const pages = data.pages;

  // ページ数チェック（2ページ以下は致命的）
  if (pages.length <= 2) {
    issues.push(`ページ数が少なすぎ（${pages.length}ページ）`);
  }

  // 各ページのセクション数チェック
  let avgSections = 0;
  let exampleCount = 0;
  let tableCount = 0;
  let highlightCount = 0;

  pages.forEach((page, idx) => {
    const sections = page.sections || [];
    avgSections += sections.length;

    if (sections.length <= 3) {
      issues.push(`ページ${idx + 1}のセクションが少ない（${sections.length}個）`);
    }

    sections.forEach(section => {
      if (section.type === 'example') exampleCount++;
      if (section.type === 'table') tableCount++;
      if (section.type === 'highlight') highlightCount++;
    });
  });

  avgSections = avgSections / pages.length;

  // example/tableがほとんどない
  if (exampleCount === 0) {
    issues.push('exampleが1つもない');
  }
  if (exampleCount + tableCount < 2) {
    issues.push('exampleとtableの合計が少なすぎ');
  }

  // スコア計算（5点満点）
  let score = 5;
  if (pages.length <= 2) score -= 2;
  else if (pages.length <= 3) score -= 1;

  if (avgSections <= 3) score -= 2;
  else if (avgSections <= 4) score -= 1;

  if (exampleCount + tableCount === 0) score -= 2;
  else if (exampleCount + tableCount < 3) score -= 1;

  return { score: Math.max(0, score), issues, pages: pages.length, avgSections, exampleCount, tableCount, highlightCount };
}

function evaluateFlashcards(data) {
  if (!data || !data.flashcards) return { score: 0, issues: ['ファイルが存在しないか読み込めません'] };

  const issues = [];
  const cards = data.flashcards;

  // カード枚数チェック（5枚以下は致命的）
  if (cards.length <= 5) {
    issues.push(`カード枚数が少なすぎ（${cards.length}枚）`);
  }

  // 内容の品質チェック
  let abstractCount = 0;
  let similarCount = 0;

  cards.forEach((card, idx) => {
    const front = card.front || '';
    const back = card.back || '';

    // frontとbackが似すぎている
    if (front.length > 10 && back.includes(front.substring(0, 20))) {
      similarCount++;
    }

    // 抽象的すぎるチェック（具体例や数値が少ない）
    const hasExample = back.includes('例:') || back.includes('例：') || /\d/.test(back);
    if (!hasExample && back.length < 100) {
      abstractCount++;
    }
  });

  if (abstractCount > cards.length * 0.3) {
    issues.push(`抽象的なカードが多い（${abstractCount}/${cards.length}枚）`);
  }

  if (similarCount > 2) {
    issues.push(`frontとbackが似すぎているカードがある（${similarCount}枚）`);
  }

  // スコア計算（5点満点）
  let score = 5;
  if (cards.length <= 5) score -= 2;
  else if (cards.length <= 7) score -= 1;

  if (abstractCount > cards.length * 0.4) score -= 2;
  else if (abstractCount > cards.length * 0.2) score -= 1;

  if (similarCount > 3) score -= 1;

  return { score: Math.max(0, score), issues, cardCount: cards.length, abstractCount, similarCount };
}

function evaluateQuestions(data) {
  if (!data || !data.questions) return { score: 0, issues: ['ファイルが存在しないか読み込めません'] };

  const issues = [];
  const questions = data.questions;

  // 問題数チェック（5問未満は致命的）
  if (questions.length < 5) {
    issues.push(`問題数が少なすぎ（${questions.length}問）`);
  }

  // 内容の品質チェック
  let abstractQuestions = 0;
  let abstractOptions = 0;
  let weakExplanations = 0;
  let duplicatePatterns = 0;

  const questionPatterns = [];

  questions.forEach((q, idx) => {
    const question = q.question || '';
    const options = q.options || [];
    const explanation = q.explanation || '';

    // 抽象的な問題文チェック
    if (question.includes('正しい説明は') || question.includes('適切なもの') ||
        question.includes('正しいもの') && !question.includes('どれですか')) {
      if (question.length < 50) {
        abstractQuestions++;
      }
    }

    // 選択肢が抽象的すぎる
    const concreteOptions = options.filter(opt =>
      opt.includes('例') || /\d/.test(opt) || opt.length > 30
    );
    if (concreteOptions.length < 2) {
      abstractOptions++;
    }

    // 解説が弱い（「〇〇が正解です」だけ）
    if (explanation.length < 80 ||
        (explanation.includes('正解') && !explanation.includes('理由') && !explanation.includes('なぜなら'))) {
      weakExplanations++;
    }

    // 類似パターンチェック
    const pattern = question.substring(0, 20);
    if (questionPatterns.includes(pattern)) {
      duplicatePatterns++;
    } else {
      questionPatterns.push(pattern);
    }
  });

  if (abstractQuestions > questions.length * 0.3) {
    issues.push(`抽象的な問題が多い（${abstractQuestions}/${questions.length}問）`);
  }

  if (abstractOptions > questions.length * 0.3) {
    issues.push(`選択肢が抽象的な問題が多い（${abstractOptions}/${questions.length}問）`);
  }

  if (weakExplanations > questions.length * 0.3) {
    issues.push(`解説が弱い問題が多い（${weakExplanations}/${questions.length}問）`);
  }

  if (duplicatePatterns > 2) {
    issues.push(`似たような問題の繰り返しがある（${duplicatePatterns}問）`);
  }

  // スコア計算（5点満点）
  let score = 5;
  if (questions.length < 5) score -= 2;
  else if (questions.length < 8) score -= 1;

  if (abstractQuestions > questions.length * 0.4) score -= 1;
  if (abstractOptions > questions.length * 0.4) score -= 1;
  if (weakExplanations > questions.length * 0.4) score -= 1;
  if (duplicatePatterns > 3) score -= 1;

  return {
    score: Math.max(0, score),
    issues,
    questionCount: questions.length,
    abstractQuestions,
    abstractOptions,
    weakExplanations,
    duplicatePatterns
  };
}

function getJudgment(expScore, fcScore, qScore) {
  const avgScore = (expScore + fcScore + qScore) / 3;
  if (avgScore >= 4) return '✅ 良好';
  if (avgScore >= 3) return '⚠️ 改善推奨';
  return '❌ 作り直し必須';
}

// メイン処理
const results = [];

console.log('全94トピックの品質評価を開始します...\n');

ALL_TOPICS.forEach(topicId => {
  const expPath = path.join(BASE_PATH, 'explanations', `${topicId}.json`);
  const fcPath = path.join(BASE_PATH, 'flashcards', `${topicId}.json`);
  const qPath = path.join(BASE_PATH, 'questions', `${topicId}.json`);

  const expData = readJSON(expPath);
  const fcData = readJSON(fcPath);
  const qData = readJSON(qPath);

  const expEval = evaluateExplanation(expData);
  const fcEval = evaluateFlashcards(fcData);
  const qEval = evaluateQuestions(qData);

  const judgment = getJudgment(expEval.score, fcEval.score, qEval.score);

  results.push({
    topicId,
    title: expData?.title || fcData?.title || qData?.title || '不明',
    explanation: expEval,
    flashcards: fcEval,
    questions: qEval,
    judgment
  });
});

// レポート生成
console.log('# 学習コンテンツ品質評価レポート\n');
console.log('## サマリー');
const goodCount = results.filter(r => r.judgment.includes('良好')).length;
const warningCount = results.filter(r => r.judgment.includes('改善推奨')).length;
const badCount = results.filter(r => r.judgment.includes('作り直し必須')).length;

console.log(`- 総トピック数: ${results.length}`);
console.log(`- 高品質（修正不要）: ${goodCount} トピック`);
console.log(`- 改善推奨: ${warningCount} トピック`);
console.log(`- 作り直し必要: ${badCount} トピック\n`);

// 作り直し必要なトピック一覧
console.log('## 作り直し必要なトピック一覧\n');

const techBad = results.filter(r => r.topicId.startsWith('tech-') && r.judgment.includes('作り直し'));
const mgmtBad = results.filter(r => r.topicId.startsWith('mgmt-') && r.judgment.includes('作り直し'));
const stratBad = results.filter(r => r.topicId.startsWith('strat-') && r.judgment.includes('作り直し'));

console.log('### テクノロジ系');
techBad.forEach((r, idx) => {
  const mainIssue = [...r.explanation.issues, ...r.flashcards.issues, ...r.questions.issues][0] || '品質が低い';
  console.log(`${idx + 1}. ${r.topicId} (${r.title}) - 理由: ${mainIssue}`);
});

console.log('\n### マネジメント系');
mgmtBad.forEach((r, idx) => {
  const mainIssue = [...r.explanation.issues, ...r.flashcards.issues, ...r.questions.issues][0] || '品質が低い';
  console.log(`${idx + 1}. ${r.topicId} (${r.title}) - 理由: ${mainIssue}`);
});

console.log('\n### ストラテジ系');
stratBad.forEach((r, idx) => {
  const mainIssue = [...r.explanation.issues, ...r.flashcards.issues, ...r.questions.issues][0] || '品質が低い';
  console.log(`${idx + 1}. ${r.topicId} (${r.title}) - 理由: ${mainIssue}`);
});

// 詳細評価
console.log('\n\n## 詳細評価\n');
results.forEach(r => {
  console.log(`### ${r.topicId} - ${r.title}`);
  console.log(`- 解説の品質: ${'⭐'.repeat(r.explanation.score)}${'☆'.repeat(5 - r.explanation.score)} (${r.explanation.score}/5)`);
  console.log(`  - ページ数: ${r.explanation.pages || 0}, 平均セクション数: ${r.explanation.avgSections?.toFixed(1) || 0}`);
  console.log(`  - Example: ${r.explanation.exampleCount || 0}, Table: ${r.explanation.tableCount || 0}`);
  if (r.explanation.issues.length > 0) {
    console.log(`  - 問題点: ${r.explanation.issues.join(', ')}`);
  }

  console.log(`- フラッシュカードの品質: ${'⭐'.repeat(r.flashcards.score)}${'☆'.repeat(5 - r.flashcards.score)} (${r.flashcards.score}/5)`);
  console.log(`  - カード枚数: ${r.flashcards.cardCount || 0}`);
  if (r.flashcards.issues.length > 0) {
    console.log(`  - 問題点: ${r.flashcards.issues.join(', ')}`);
  }

  console.log(`- テスト問題の品質: ${'⭐'.repeat(r.questions.score)}${'☆'.repeat(5 - r.questions.score)} (${r.questions.score}/5)`);
  console.log(`  - 問題数: ${r.questions.questionCount || 0}`);
  if (r.questions.issues.length > 0) {
    console.log(`  - 問題点: ${r.questions.issues.join(', ')}`);
  }

  console.log(`- **判定: ${r.judgment}**\n`);
});

// CSV出力（後で使える）
const csvLines = ['トピックID,タイトル,解説スコア,FCスコア,問題スコア,判定'];
results.forEach(r => {
  csvLines.push(`${r.topicId},${r.title},${r.explanation.score},${r.flashcards.score},${r.questions.score},${r.judgment}`);
});

fs.writeFileSync('/Users/dcenter/Desktop/基本情報/fe-master/evaluation_results.csv', csvLines.join('\n'), 'utf8');
console.log('\n評価結果をCSVに出力しました: evaluation_results.csv');
