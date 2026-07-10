import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchChapter } from '../api'
import { Layout } from '../components/Layout'
import { LessonContent } from '../components/LessonContent'
import { chapterProgress, isChapterRead, isExerciseDone, markChapterRead, setLastPosition } from '../progress'
import type { Chapter } from '../types'

export function ChapterPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [error, setError] = useState('')
  const [currentSection, setCurrentSection] = useState<string>('')

  useEffect(() => {
    if (!slug) return
    fetchChapter(slug)
      .then(setChapter)
      .catch((e) => setError(e.message))
  }, [slug])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const element = document.getElementById(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [chapter])

  useEffect(() => {
    if (!chapter?.sections || chapter.sections.length === 0 || !slug) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            if (sectionId) {
              setLastPosition(slug!, sectionId)
              setCurrentSection(sectionId)
            }
          }
        })
      },
      { threshold: 0.3 }
    )

    chapter.sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [chapter, slug])

  if (error || !slug) {
    return (
      <Layout>
        <div className="error-box">
          <p>{error || '章节不存在'}</p>
          <Link to="/">返回首页</Link>
        </div>
      </Layout>
    )
  }

  if (!chapter) {
    return (
      <Layout>
        <div className="loading">加载中...</div>
      </Layout>
    )
  }

  const isReading = chapter.type === 'reading'
  const allExerciseIds = chapter.exerciseList?.map((e) => e.id) ?? []
  chapter.sections?.forEach((s) => {
    s.exerciseList?.forEach((e) => allExerciseIds.push(e.id))
  })
  const progress = chapterProgress(slug, allExerciseIds, isReading)

  const handleMarkRead = () => {
    markChapterRead(slug)
    navigate('/')
  }

  const isSectionUnlocked = (sectionIndex: number): boolean => {
    if (sectionIndex === 0) return true
    const prevSection = chapter.sections![sectionIndex - 1]
    return prevSection.exerciseList?.every((ex) => isExerciseDone(ex.id)) ?? true
  }

  const isSectionDone = (sectionIndex: number): boolean => {
    const section = chapter.sections![sectionIndex]
    return section.exerciseList?.every((ex) => isExerciseDone(ex.id)) ?? true
  }

  const getSectionExerciseCount = (sectionIndex: number): number => {
    return chapter.sections![sectionIndex].exerciseList?.length ?? 0
  }

  const getSectionDoneCount = (sectionIndex: number): number => {
    const section = chapter.sections![sectionIndex]
    return section.exerciseList?.filter((ex) => isExerciseDone(ex.id)).length ?? 0
  }

  return (
    <Layout mainClass="main-wide">
      <div className="chapter-page">
        <Link to="/" className="back-link">← 课程目录</Link>

        <div className="chapter-layout">
          {chapter.sections && chapter.sections.length > 0 && (
            <aside className="chapter-sidebar">
              <div className="sidebar-section">
                <h4>本章目录</h4>
                <h3 className="sidebar-title">{chapter.title}</h3>
              </div>
              <nav className="sidebar-nav">
                {chapter.sections!.map((section, sectionIndex) => {
                  const unlocked = isSectionUnlocked(sectionIndex)
                  const done = isSectionDone(sectionIndex)
                  const isActive = currentSection === section.id
                  return (
                    <div key={section.id} className="sidebar-section-group">
                      <a
                        href={`#${section.id}`}
                        className={`sidebar-link ${isActive ? 'active' : ''} ${!unlocked ? 'locked' : ''} ${done ? 'done' : ''}`}
                        onClick={(e) => !unlocked && e.preventDefault()}
                      >
                        <span className="sidebar-num">教学 {String(sectionIndex + 1).padStart(2, '0')}</span>
                        <span className="sidebar-text">{section.title}</span>
                        {isActive && <span className="sidebar-indicator"></span>}
                      </a>
                      {section.exerciseList && section.exerciseList.length > 0 && (
                        <div className="sidebar-exercise-list">
                          {section.exerciseList.map((ex, exIndex) => {
                            const exDone = isExerciseDone(ex.id)
                            const withinSectionUnlocked = exIndex === 0 || isExerciseDone(section.exerciseList![exIndex - 1].id)
                            const exUnlocked = unlocked && withinSectionUnlocked
                            return (
                              <Link
                                key={ex.id}
                                to={exUnlocked ? `/chapter/${slug}/exercise/${ex.id}` : '#'}
                                className={`sidebar-exercise-link ${exDone ? 'done' : ''} ${!exUnlocked ? 'locked' : ''}`}
                                onClick={(e) => !exUnlocked && e.preventDefault()}
                              >
                                <span className="sidebar-exercise-num">{exIndex + 1}</span>
                                <span className="sidebar-exercise-text">{ex.title}</span>
                                {exDone && <span className="sidebar-exercise-check">✓</span>}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </aside>
          )}

          <main className="chapter-main">
          <header className="chapter-header">
          <div className="chapter-badge">
            <span className="badge-dot"></span>
            <span>{isReading ? '📖 概念阅读' : '📝 教学练习'}</span>
            <span className="badge-num">{chapter.id}</span>
            <span>/</span>
            <span>{chapter.exercises}</span>
            {isChapterRead(slug) && <span className="badge-status">· 已读</span>}
          </div>
          <h1>{chapter.title}</h1>
          <p>{chapter.summary}</p>
          <div className="chapter-meta-row">
            <span>{isReading ? '📖 概念阅读' : `📝 ${chapter.exercises} 题`}</span>
            <span>⏱ 约 {chapter.minutes} 分钟</span>
            <span>进度 {progress}%</span>
          </div>
        </header>

        {chapter.sections && chapter.sections.length > 0 && (
          <div className="section-learning-list">
            {chapter.sections!.map((section, sectionIndex) => {
              const unlocked = isSectionUnlocked(sectionIndex)
              const done = isSectionDone(sectionIndex)
              const exerciseCount = getSectionExerciseCount(sectionIndex)
              const doneCount = getSectionDoneCount(sectionIndex)

              return (
                <div key={section.id} id={section.id} className="section-learning-item">
                  {/* 小节标题 */}
                  <div className="section-learning-header">
                    <span className="section-learning-num">{String(sectionIndex + 1).padStart(2, '0')}</span>
                    <h2>{section.title}</h2>
                    <span className="section-learning-status">
                      {!unlocked ? '🔒 未解锁' : done ? '✓ 已完成' : '▶ 进行中'}
                    </span>
                  </div>

                  {/* 小节教程内容 */}
                  {section.content && unlocked && (
                    <div className="reading-content section-reading-content">
                      <LessonContent content={section.content} sectionId={section.id} />
                    </div>
                  )}

                  {!unlocked && (
                    <div className="section-locked-overlay">
                      <div className="section-locked-box">
                        <span className="section-locked-icon">
                          <span className="lock-closed">🔒</span>
                          <span className="lock-open">🔓</span>
                        </span>
                        <p>完成上一小节的所有练习后解锁</p>
                      </div>
                    </div>
                  )}

                  {/* 小节练习题 */}
                  {section.exerciseList && section.exerciseList.length > 0 && unlocked && (
                    <div className="section-exercises-inline">
                      <div className="section-exercises-header">
                        <span className="section-exercises-title">✏️ 本节练习</span>
                        <span className="section-exercises-count">{doneCount}/{exerciseCount} 题</span>
                      </div>
                      <div className="section-exercises">
                        {section.exerciseList.map((ex, exIndex) => {
                          const exUnlocked = exIndex === 0 || isExerciseDone(section.exerciseList![exIndex - 1].id)
                          const exDone = isExerciseDone(ex.id)
                          return (
                            <Link
                              key={ex.id}
                              to={exUnlocked ? `/chapter/${slug}/exercise/${ex.id}` : '#'}
                              className={`exercise-item ${exDone ? 'done' : ''} ${!exUnlocked ? 'locked' : ''}`}
                              onClick={(e) => !exUnlocked && e.preventDefault()}
                            >
                              <span className="exercise-num">{exIndex + 1}</span>
                              <div>
                                <h4>{ex.title}</h4>
                                <p>{ex.description}</p>
                              </div>
                              <span className="exercise-status">
                                {!exUnlocked ? '🔒' : exDone ? '✓' : '→'}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {isReading && (
          <div className="chapter-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleMarkRead}
              disabled={isChapterRead(slug)}
            >
              {isChapterRead(slug) ? '已读完 ✓' : '标记为已读，回到目录'}
            </button>
          </div>
        )}
          </main>
        </div>
      </div>
    </Layout>
  )
}
