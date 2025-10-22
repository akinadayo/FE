import syllabusData from '@/data/syllabus.json'
import { SyllabusData, Topic } from './types'

export function getSyllabusData(): SyllabusData {
  return syllabusData as SyllabusData
}

export function getAllTopics(): Topic[] {
  const syllabus = getSyllabusData()
  const topics: Topic[] = []

  syllabus.大分類.forEach((category) => {
    category.中分類.forEach((midCategory) => {
      midCategory.小分類.forEach((subCategory) => {
        topics.push(...subCategory.トピック)
      })
    })
  })

  return topics
}

export function getTopicById(topicId: string): Topic | null {
  const topics = getAllTopics()
  return topics.find((topic) => topic.id === topicId) || null
}

export function getTopicPath(topicId: string): {
  category: string
  midCategory: string
  subCategory: string
} | null {
  const syllabus = getSyllabusData()

  for (const category of syllabus.大分類) {
    for (const midCategory of category.中分類) {
      for (const subCategory of midCategory.小分類) {
        const topic = subCategory.トピック.find((t) => t.id === topicId)
        if (topic) {
          return {
            category: category.名称,
            midCategory: midCategory.名称,
            subCategory: subCategory.名称,
          }
        }
      }
    }
  }

  return null
}
