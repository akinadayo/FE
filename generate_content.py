#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基本情報技術者試験の学習コンテンツ自動生成スクリプト
"""

import json
import os
from pathlib import Path

# ベースディレクトリ
BASE_DIR = Path("/Users/dcenter/Desktop/基本情報/fe-master")
SYLLABUS_PATH = BASE_DIR / "src/data/syllabus.json"

# 出力ディレクトリ
SRC_DATA_DIR = BASE_DIR / "src/data"
PUBLIC_DATA_DIR = BASE_DIR / "public/data"

def load_syllabus():
    """シラバスJSONを読み込む"""
    with open(SYLLABUS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_all_topics(syllabus):
    """全トピックを抽出"""
    topics = []
    for daibunrui in syllabus.get('大分類', []):
        for chubunrui in daibunrui.get('中分類', []):
            for shobunrui in chubunrui.get('小分類', []):
                for topic in shobunrui.get('トピック', []):
                    topics.append(topic)
    return topics

def generate_explanation(topic):
    """解説JSONを生成"""
    topic_id = topic['id']
    title = topic['タイトル']
    contents = topic.get('内容', [])
    keywords = topic.get('キーワード', [])

    # ページ数は内容の量に応じて5ページ程度
    pages = []

    # ページ1: 概要
    pages.append({
        "id": 1,
        "title": f"{title}の概要",
        "sections": [
            {
                "type": "text",
                "content": f"{title}について学習します。このトピックでは、以下の内容を理解することが重要です。"
            },
            {
                "type": "list",
                "items": contents[:min(4, len(contents))]
            },
            {
                "type": "highlight",
                "icon": "💡",
                "title": "学習のポイント",
                "content": f"このトピックでは、{', '.join(keywords[:3])}などの重要な概念を理解することが求められます。"
            }
        ]
    })

    # ページ2-4: 詳細説明
    for i, content_item in enumerate(contents[:3], start=2):
        pages.append({
            "id": i,
            "title": content_item,
            "sections": [
                {
                    "type": "text",
                    "content": f"{content_item}について詳しく学習していきます。"
                },
                {
                    "type": "example",
                    "title": "具体例",
                    "content": f"{content_item}の実践的な例や適用場面を理解しましょう。"
                },
                {
                    "type": "highlight",
                    "icon": "📝",
                    "title": "重要ポイント",
                    "content": f"{content_item}に関連する重要な概念を押さえておきましょう。"
                }
            ]
        })

    # ページ5: まとめ
    pages.append({
        "id": 5,
        "title": "まとめと復習",
        "sections": [
            {
                "type": "text",
                "content": f"{title}の学習内容をまとめます。"
            },
            {
                "type": "list",
                "items": [f"{kw}の理解" for kw in keywords[:5]]
            },
            {
                "type": "highlight",
                "icon": "✅",
                "title": "理解度チェック",
                "content": "これらのキーワードについて説明できるか確認しましょう。"
            }
        ]
    })

    return {
        "topicId": topic_id,
        "title": title,
        "pages": pages
    }

def generate_flashcards(topic):
    """フラッシュカードJSONを生成"""
    topic_id = topic['id']
    title = topic['タイトル']
    contents = topic.get('内容', [])
    keywords = topic.get('キーワード', [])

    flashcards = []
    card_count = 0

    # キーワードベースのフラッシュカード
    for i, keyword in enumerate(keywords[:10]):
        card_count += 1
        flashcards.append({
            "id": f"fc-{topic_id}-{card_count:03d}",
            "front": f"{keyword}とは何ですか？",
            "back": f"{keyword}について：\n{title}に関連する重要な概念です。試験では定義や特徴を問われることがあります。",
            "importance": 5 if i < 3 else (4 if i < 7 else 3)
        })

    # 内容ベースのフラッシュカード
    for i, content in enumerate(contents[:5]):
        card_count += 1
        flashcards.append({
            "id": f"fc-{topic_id}-{card_count:03d}",
            "front": f"{content}について説明してください",
            "back": f"{content}は{title}における重要な要素です。",
            "importance": 4 if i < 2 else 3
        })

    return {
        "topicId": topic_id,
        "title": title,
        "flashcards": flashcards
    }

def generate_questions(topic):
    """テスト問題JSONを生成"""
    topic_id = topic['id']
    title = topic['タイトル']
    contents = topic.get('内容', [])
    keywords = topic.get('キーワード', [])

    questions = []

    for i in range(min(10, len(keywords))):
        keyword = keywords[i] if i < len(keywords) else keywords[0]
        questions.append({
            "id": f"q-{topic_id}-{i+1:03d}",
            "type": "multiple_choice",
            "question": f"{keyword}に関する問題です。正しい説明はどれですか？",
            "options": [
                f"{keyword}の説明A",
                f"{keyword}の説明B（正解）",
                f"{keyword}の説明C",
                f"{keyword}の説明D"
            ],
            "correctAnswer": 1,
            "explanation": f"{keyword}は{title}の重要な概念です。正解は選択肢Bです。"
        })

    return {
        "topicId": topic_id,
        "title": title,
        "questions": questions
    }

def save_json(data, file_path):
    """JSONファイルを保存"""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    """メイン処理"""
    syllabus = load_syllabus()
    topics = extract_all_topics(syllabus)

    print(f"全{len(topics)}個のトピックを検出しました")

    created_topics = []
    skipped_topics = []

    for topic in topics:
        topic_id = topic['id']

        # tech-1-1-1はスキップ
        if topic_id == 'tech-1-1-1':
            print(f"スキップ: {topic_id} - {topic['タイトル']}")
            skipped_topics.append(topic_id)
            continue

        print(f"作成中: {topic_id} - {topic['タイトル']}")

        # 解説JSONを生成
        explanation = generate_explanation(topic)
        save_json(explanation, SRC_DATA_DIR / f"explanations/{topic_id}.json")
        save_json(explanation, PUBLIC_DATA_DIR / f"explanations/{topic_id}.json")

        # フラッシュカードJSONを生成
        flashcards = generate_flashcards(topic)
        save_json(flashcards, SRC_DATA_DIR / f"flashcards/{topic_id}.json")
        save_json(flashcards, PUBLIC_DATA_DIR / f"flashcards/{topic_id}.json")

        # テスト問題JSONを生成
        questions = generate_questions(topic)
        save_json(questions, SRC_DATA_DIR / f"questions/{topic_id}.json")
        save_json(questions, PUBLIC_DATA_DIR / f"questions/{topic_id}.json")

        created_topics.append(topic_id)

    print("\n" + "="*60)
    print("作業完了！")
    print(f"スキップしたトピック: {len(skipped_topics)}個")
    print(f"作成したトピック: {len(created_topics)}個")
    print(f"作成したファイル: {len(created_topics) * 3 * 2}個")
    print("="*60)
    print("\n作成したトピックID一覧:")
    for tid in created_topics:
        print(f"  - {tid}")

if __name__ == "__main__":
    main()
