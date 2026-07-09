import { Link } from 'react-router-dom'
import type { ChapterSummary } from '../types'
import { chapterProgress, isChapterRead, getLastPosition } from '../progress'

interface ChapterCardProps {
  chapter: ChapterSummary
  exerciseIds: string[]
}

export function ChapterCard({ chapter, exerciseIds }: ChapterCardProps) {
  const isReading = chapter.type === 'reading'
  const progress = chapterProgress(chapter.slug, exerciseIds, isReading)
  const done = isReading ? isChapterRead(chapter.slug) : progress === 100
  const lastPosition = getLastPosition(chapter.slug)
  const linkTo = lastPosition ? `/chapter/${chapter.slug}#${lastPosition}` : `/chapter/${chapter.slug}`

  return (
    <Link to={linkTo} className={`chapter-card ${done ? 'done' : ''}`}>
      <div className="chapter-card-top">
        <span className="chapter-id">{chapter.id}</span>
        <span className={`chapter-type ${chapter.type}`}>
          {isReading ? '📖 概念阅读' : `📝 ${chapter.exercises} 题`}
        </span>
      </div>
      <h3 className="chapter-title">{chapter.title}</h3>
      <p className="chapter-summary">{chapter.summary}</p>
      <div className="chapter-meta">
        <span>⏱ {chapter.minutes} 分钟</span>
        {!isReading && <span>进度 {progress}%</span>}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </Link>
  )
}
