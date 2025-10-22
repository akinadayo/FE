const fs = require('fs');
const path = require('path');

const BASE_DIR = '/Users/dcenter/Desktop/基本情報/fe-master/public/data';

// トピックID一覧を取得
function getAllTopicIds() {
  const explanationsDir = path.join(BASE_DIR, 'explanations');
  const files = fs.readdirSync(explanationsDir);
  return files
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort();
}

// ファイルを読み込む
function loadJSON(type, topicId) {
  try {
    const filePath = path.join(BASE_DIR, type, `${topicId}.json`);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return null;
  }
}

// 致命的な問題を検出
function evaluateExplanation(data, topicId) {
  const issues = [];

  if (!data) {
    issues.push('ファイルが存在しない');
    return { hasCriticalIssue: true, issues };
  }

  if (!data.pages || data.pages.length === 0) {
    issues.push('ページが存在しない');
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: ページ数が1のみ
  if (data.pages.length === 1) {
    issues.push('ページ数が1のみ（3-5ページあるべき）');
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: セクション数が極端に少ない
  const totalSections = data.pages.reduce((sum, page) =>
    sum + (page.sections ? page.sections.length : 0), 0
  );

  if (totalSections < 5) {
    issues.push(`セクション数が極端に少ない（合計${totalSections}）`);
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: プレースホルダーが含まれる
  const jsonStr = JSON.stringify(data);
  if (jsonStr.includes('準備中') || jsonStr.includes('仮コンテンツ') ||
      jsonStr.includes('TODO') || jsonStr.includes('Coming soon')) {
    issues.push('プレースホルダーが含まれる');
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: 内容が極端に薄い（平均セクションコンテンツ長が50文字未満）
  let totalContentLength = 0;
  let contentSections = 0;

  data.pages.forEach(page => {
    if (page.sections) {
      page.sections.forEach(section => {
        if (section.content) {
          totalContentLength += section.content.length;
          contentSections++;
        }
      });
    }
  });

  const avgContentLength = contentSections > 0 ? totalContentLength / contentSections : 0;
  if (avgContentLength < 50) {
    issues.push(`内容が極端に薄い（平均${Math.round(avgContentLength)}文字/セクション）`);
    return { hasCriticalIssue: true, issues };
  }

  return { hasCriticalIssue: false, issues };
}

function evaluateFlashcard(data, topicId) {
  const issues = [];

  if (!data) {
    issues.push('ファイルが存在しない');
    return { hasCriticalIssue: true, issues };
  }

  if (!data.flashcards || data.flashcards.length === 0) {
    issues.push('フラッシュカードが存在しない');
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: カード枚数が3枚以下
  if (data.flashcards.length <= 3) {
    issues.push(`カード枚数が${data.flashcards.length}枚のみ（7-14枚あるべき）`);
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: frontとbackが同じカードがある
  const sameFrontBack = data.flashcards.filter(fc => fc.front === fc.back);
  if (sameFrontBack.length > 0) {
    issues.push('frontとbackが同じカードが存在');
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: 抽象的すぎる（平均文字数が30文字未満）
  const avgFrontLength = data.flashcards.reduce((sum, fc) =>
    sum + fc.front.length, 0) / data.flashcards.length;
  const avgBackLength = data.flashcards.reduce((sum, fc) =>
    sum + fc.back.length, 0) / data.flashcards.length;

  if (avgFrontLength < 15 || avgBackLength < 30) {
    issues.push(`内容が薄い（front平均${Math.round(avgFrontLength)}文字、back平均${Math.round(avgBackLength)}文字）`);
    return { hasCriticalIssue: true, issues };
  }

  return { hasCriticalIssue: false, issues };
}

function evaluateQuestions(data, topicId) {
  const issues = [];

  if (!data) {
    issues.push('ファイルが存在しない');
    return { hasCriticalIssue: true, issues };
  }

  if (!data.questions || data.questions.length === 0) {
    issues.push('問題が存在しない');
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: 問題数が3問以下
  if (data.questions.length <= 3) {
    issues.push(`問題数が${data.questions.length}問のみ（5-10問あるべき）`);
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: 抽象的な問題文
  const abstractQuestions = data.questions.filter(q => {
    const question = q.question.toLowerCase();
    return question.includes('正しいものは') && question.length < 40 ||
           question.includes('適切なものは') && question.length < 40 ||
           question.includes('間違っているものは') && question.length < 40;
  });

  if (abstractQuestions.length > data.questions.length / 2) {
    issues.push('抽象的な問題が多い（具体的なシナリオが不足）');
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: 解説が薄い（平均50文字未満）
  const avgExplanationLength = data.questions.reduce((sum, q) =>
    sum + (q.explanation ? q.explanation.length : 0), 0) / data.questions.length;

  if (avgExplanationLength < 50) {
    issues.push(`解説が薄い（平均${Math.round(avgExplanationLength)}文字）`);
    return { hasCriticalIssue: true, issues };
  }

  // 致命的: 「正解です」だけの解説が多い
  const simpleExplanations = data.questions.filter(q =>
    q.explanation && (
      q.explanation.includes('正解です') && q.explanation.length < 30 ||
      q.explanation.includes('が正しい') && q.explanation.length < 30
    )
  );

  if (simpleExplanations.length > data.questions.length / 3) {
    issues.push('「〇〇が正解です」のみの解説が多い');
    return { hasCriticalIssue: true, issues };
  }

  return { hasCriticalIssue: false, issues };
}

// メイン評価
function evaluateAllTopics() {
  const topicIds = getAllTopicIds();
  console.log(`全${topicIds.length}トピックを評価中...\n`);

  const results = {
    highQuality: [],
    needsRecreation: []
  };

  topicIds.forEach(topicId => {
    const explanation = loadJSON('explanations', topicId);
    const flashcard = loadJSON('flashcards', topicId);
    const questions = loadJSON('questions', topicId);

    const evalExplanation = evaluateExplanation(explanation, topicId);
    const evalFlashcard = evaluateFlashcard(flashcard, topicId);
    const evalQuestions = evaluateQuestions(questions, topicId);

    const hasCriticalIssue =
      evalExplanation.hasCriticalIssue ||
      evalFlashcard.hasCriticalIssue ||
      evalQuestions.hasCriticalIssue;

    if (hasCriticalIssue) {
      results.needsRecreation.push({
        topicId,
        issues: {
          explanation: evalExplanation.issues,
          flashcard: evalFlashcard.issues,
          questions: evalQuestions.issues
        }
      });
    } else {
      results.highQuality.push(topicId);
    }
  });

  return results;
}

// 実行
const results = evaluateAllTopics();

console.log('='.repeat(80));
console.log('評価結果サマリー');
console.log('='.repeat(80));
console.log(`高品質: ${results.highQuality.length}トピック`);
console.log(`作り直し必要: ${results.needsRecreation.length}トピック`);
console.log(`合計: ${results.highQuality.length + results.needsRecreation.length}トピック`);
console.log('='.repeat(80));

if (results.needsRecreation.length > 0) {
  console.log('\n作り直しが必要なトピック:');
  console.log('-'.repeat(80));

  results.needsRecreation.forEach(item => {
    console.log(`\n[${item.topicId}]`);

    if (item.issues.explanation.length > 0) {
      console.log('  【解説】');
      item.issues.explanation.forEach(issue => console.log(`    - ${issue}`));
    }

    if (item.issues.flashcard.length > 0) {
      console.log('  【フラッシュカード】');
      item.issues.flashcard.forEach(issue => console.log(`    - ${issue}`));
    }

    if (item.issues.questions.length > 0) {
      console.log('  【テスト問題】');
      item.issues.questions.forEach(issue => console.log(`    - ${issue}`));
    }
  });
}

// 結果をJSONで出力
fs.writeFileSync(
  '/Users/dcenter/Desktop/基本情報/fe-master/evaluation-results.json',
  JSON.stringify(results, null, 2),
  'utf8'
);

console.log('\n評価結果を evaluation-results.json に保存しました。');
