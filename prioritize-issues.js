const fs = require('fs');

const results = JSON.parse(fs.readFileSync('evaluation-results.json', 'utf8'));

// 致命度別に分類
const priority = {
  critical: [],  // ファイル不存在、プレースホルダー
  high: [],      // 3つすべてに問題がある
  medium: [],    // 2つに問題がある
  low: []        // 1つだけ問題がある
};

results.needsRecreation.forEach(item => {
  const { topicId, issues } = item;
  const hasExplanationIssue = issues.explanation.length > 0;
  const hasFlashcardIssue = issues.flashcard.length > 0;
  const hasQuestionsIssue = issues.questions.length > 0;

  const issueCount = [hasExplanationIssue, hasFlashcardIssue, hasQuestionsIssue].filter(Boolean).length;

  // 致命的: ファイル不存在やプレースホルダー
  const isCritical = issues.explanation.some(i =>
    i.includes('ファイルが存在しない') || i.includes('プレースホルダー')
  );

  if (isCritical) {
    priority.critical.push({ topicId, issues, issueCount: 3 });
  } else if (issueCount === 3) {
    priority.high.push({ topicId, issues, issueCount });
  } else if (issueCount === 2) {
    priority.medium.push({ topicId, issues, issueCount });
  } else {
    priority.low.push({ topicId, issues, issueCount });
  }
});

console.log('='.repeat(80));
console.log('致命度別分類');
console.log('='.repeat(80));
console.log(`致命的（ファイル不存在・プレースホルダー）: ${priority.critical.length}トピック`);
console.log(`高（3つすべてに問題）: ${priority.high.length}トピック`);
console.log(`中（2つに問題）: ${priority.medium.length}トピック`);
console.log(`低（1つだけ問題）: ${priority.low.length}トピック`);
console.log('='.repeat(80));

console.log('\n【致命的】');
priority.critical.forEach(item => {
  console.log(`- ${item.topicId}:`, item.issues.explanation.join(', '));
});

console.log('\n【高（3つすべてに問題）】- 最初の20トピックのみ表示');
priority.high.slice(0, 20).forEach(item => {
  console.log(`- ${item.topicId}`);
});
if (priority.high.length > 20) {
  console.log(`  ... 他${priority.high.length - 20}トピック`);
}

// 優先順位付きリストを保存
fs.writeFileSync(
  'prioritized-issues.json',
  JSON.stringify(priority, null, 2),
  'utf8'
);

console.log('\n優先順位付きリストを prioritized-issues.json に保存しました。');
