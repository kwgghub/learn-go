import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCatalog } from '../api'
import { Layout } from '../components/Layout'
import { ChapterCard } from '../components/ChapterCard'
import { getProgress } from '../progress'
import type { Catalog } from '../types'

export function HomePage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCatalog()
      .then(setCatalog)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <Layout>
        <div className="error-box">
          <h2>无法加载课程</h2>
          <p>{error}</p>
          <p className="hint">请确认后端已启动：<code>cd backend && go run .</code></p>
        </div>
      </Layout>
    )
  }

  if (!catalog) {
    return (
      <Layout>
        <div className="loading">加载中...</div>
      </Layout>
    )
  }

  const firstCoding = catalog.chapters.find((c) => c.type === 'coding')
  const progress = getProgress()

  const isChapterDone = (chapter: typeof catalog.chapters[0]) => {
    const allExerciseIds = chapter.exerciseIds ?? []
    if (allExerciseIds.length === 0) return true
    const doneCount = allExerciseIds.filter((id) => progress.completedExercises.includes(id)).length
    return doneCount >= allExerciseIds.length
  }

  let continueChapter = null
  let continueFromLastPosition = false

  if (progress.lastPosition) {
    const lastChapter = catalog.chapters.find((c) => c.slug === progress.lastPosition!.slug)
    if (lastChapter && !isChapterDone(lastChapter)) {
      continueChapter = lastChapter
      continueFromLastPosition = true
    }
  }

  if (!continueChapter) {
    for (const chapter of catalog.chapters) {
      if (!isChapterDone(chapter) && (chapter.exerciseIds ?? []).length > 0) {
        continueChapter = chapter
        break
      }
    }
  }
  
  const displayChapter = continueChapter || firstCoding

  return (
    <Layout>
      <section className="hero">
        <div className="hero-badge">浏览器里就能跑</div>
        <h1>学 Go，从零到能用</h1>
        <p className="hero-desc">
          在浏览器里学 Go，一题一题练。代码当场跑、判分秒回，做对一题解锁下一题。掌握并发编程，构建高性能服务。
        </p>
        <div className="hero-stats">
        </div>
        {displayChapter && (
          <Link
            to={`/chapter/${displayChapter.slug}${continueFromLastPosition && progress.lastPosition?.sectionId ? `#${progress.lastPosition.sectionId}` : ''}`}
            className="btn-primary"
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{continueChapter ? '继续学习' : '开始第一节'} →</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.8 }}>{displayChapter.id} {displayChapter.title}</div>
          </Link>
        )}
      </section>

      <section className="catalog">
        <h2>课程目录</h2>
        <p className="catalog-desc">{catalog.chapters.length} 章分三段循序渐进，每章配渐进练习题。</p>

        {catalog.sections.map((section) => {
          const chapters = catalog.chapters.filter((c) => c.section === section.id)
          if (chapters.length === 0) return null
          return (
            <div key={section.id} className="section-block">
              <div className="section-header">
                <h3>{section.title}</h3>
                <span className="section-range">{section.range}</span>
              </div>
              <p className="section-desc">{section.description}</p>
              <div className="chapter-grid">
                {chapters.map((ch) => (
                  <ChapterCard
                    key={ch.slug}
                    chapter={ch}
                    exerciseIds={ch.exerciseIds ?? []}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </Layout>
  )
}
