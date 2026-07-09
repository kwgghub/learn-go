import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchChapter, runCode, submitAnswer, fetchCatalog } from '../api'
import { CodeEditor } from '../components/CodeEditor'
import { Layout } from '../components/Layout'
import { LessonContent } from '../components/LessonContent'
import { Confetti } from '../components/Confetti'
import { TypewriterText } from '../components/TypewriterText'
import { isExerciseDone, markExerciseDone } from '../progress'
import type { Chapter, Exercise, RunResult, Validation, Catalog } from '../types'

export function ExercisePage() {
  const { slug, exerciseId } = useParams<{ slug: string; exerciseId: string }>()
  const navigate = useNavigate()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [code, setCode] = useState('')
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [output, setOutput] = useState<RunResult | null>(null)
  const [result, setResult] = useState<Validation | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showLesson, setShowLesson] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [confettiFire, setConfettiFire] = useState(0)
  const [catalog, setCatalog] = useState<Catalog | null>(null)

  useEffect(() => {
    if (!slug || !exerciseId) return
    fetchChapter(slug).then((ch) => {
      setChapter(ch)
      // 先在 chapter 级别的 exerciseList 中查找
      let ex = ch.exerciseList?.find((e) => e.id === exerciseId)
      // 再在 sections 中查找
      if (!ex && ch.sections) {
        for (const section of ch.sections) {
          const found = section.exerciseList?.find((e) => e.id === exerciseId)
          if (found) {
            ex = found
            break
          }
        }
      }
      if (ex) {
        setExercise(ex)
        const saved = localStorage.getItem(`code:${exerciseId}`)
        setCode(saved || ex.starterCode)
      }
    })
  }, [slug, exerciseId])

  useEffect(() => {
    if (exerciseId && code && exercise) {
      localStorage.setItem(`code:${exerciseId}`, code)
    }
  }, [code])

  useEffect(() => {
    fetchCatalog().then((cat) => {
      setCatalog(cat)
    })
  }, [])

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [nextExercise, setNextExercise] = useState<Exercise | undefined>(undefined)
  const [unlocked, setUnlocked] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    if (!chapter || !exerciseId) return

    const getAllExercises = () => {
      const list: Exercise[] = []
      if (chapter.exerciseList) list.push(...chapter.exerciseList)
      chapter.sections?.forEach((s) => {
        if (s.exerciseList) list.push(...s.exerciseList)
      })
      return list
    }

    const exList = getAllExercises()
    const idx = exList.findIndex((e) => e.id === exerciseId)

    setExercises(exList)
    setCurrentIndex(idx)
    setNextExercise(exList[idx + 1])
    
    const doneCount = exList.filter((e) => isExerciseDone(e.id)).length
    setCompletedCount(doneCount)

    const isExerciseUnlocked = (): boolean => {
      if (!chapter.sections) {
        if (idx === 0) return true
        return isExerciseDone(exList[idx - 1].id)
      }
      for (const section of chapter.sections) {
        const sectionExList = section.exerciseList || []
        const sectionIdx = sectionExList.findIndex((e) => e.id === exerciseId)
        if (sectionIdx !== -1) {
          if (sectionIdx === 0) {
            const sIdx = chapter.sections!.findIndex((s) => s.id === section.id)
            if (sIdx === 0) return true
            const prevSection = chapter.sections![sIdx - 1]
            return prevSection.exerciseList?.every((ex) => isExerciseDone(ex.id)) ?? true
          }
          return isExerciseDone(sectionExList[sectionIdx - 1].id)
        }
      }
      return true
    }

    setUnlocked(isExerciseUnlocked())
  }, [chapter, exerciseId])

  if (!chapter || !exercise || !slug) {
    return (
      <Layout>
        <div className="loading">加载中...</div>
      </Layout>
    )
  }

  if (!unlocked) {
    return (
      <Layout>
        <div className="exercise-locked">
          <div className="exercise-locked-icon-wrap">
            <span className="exercise-locked-icon">🔒</span>
            <span className="exercise-locked-icon-open">🔓</span>
          </div>
          <h1>此题尚未解锁</h1>
          <p>请按顺序完成前面的练习后再来挑战此题</p>
          <Link to={`/chapter/${slug}`} className="btn-primary">
            返回学习
          </Link>
        </div>
      </Layout>
    )
  }

  // 判断当前题目是否是所在小节的最后一题
  const isLastInSection = (): boolean => {
    if (!chapter.sections) return false
    for (const section of chapter.sections) {
      const exList = section.exerciseList || []
      const idx = exList.findIndex((e) => e.id === exerciseId)
      if (idx !== -1) {
        return idx === exList.length - 1
      }
    }
    return false
  }

  // 判断当前题目是否是整章最后一题
  const isLastInChapter = (): boolean => {
    return currentIndex === exercises.length - 1
  }

  // 获取当前题目所在小节的教程内容
  const getCurrentSectionContent = (): string | null => {
    if (!chapter.sections) return null
    for (const section of chapter.sections) {
      const exList = section.exerciseList || []
      if (exList.some((e) => e.id === exerciseId)) {
        return section.content || null
      }
    }
    return null
  }

  const currentSectionContent = getCurrentSectionContent()

  const handleRun = async () => {
    setRunning(true)
    setResult(null)
    try {
      const res = await runCode(code)
      setOutput(res)
    } catch (e) {
      setOutput({
        stdout: '',
        stderr: '',
        exitCode: 1,
        durationMs: 0,
        error: e instanceof Error ? e.message : '运行失败',
      })
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setResult(null)
    try {
      const res = await submitAnswer(slug, exercise.id, code)
      setResult(res)
      if (res.passed && !isExerciseDone(exercise.id)) {
        markExerciseDone(exercise.id)
        setCompletedCount((prev) => prev + 1)
        setConfettiFire((n) => n + 1)
      }
    } catch (e) {
      setResult({
        passed: false,
        message: e instanceof Error ? e.message : '提交失败',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getNextSectionId = (): string | null => {
    if (!chapter.sections) return null
    for (let i = 0; i < chapter.sections.length; i++) {
      const exList = chapter.sections[i].exerciseList || []
      if (exList.some((e) => e.id === exerciseId)) {
        if (i < chapter.sections.length - 1) {
          return chapter.sections[i + 1].id
        }
        return null
      }
    }
    return null
  }

  const handleNext = () => {
    if (isLastInChapter()) {
      navigate(`/chapter/${slug}`)
    } else if (isLastInSection()) {
      const nextSectionId = getNextSectionId()
      navigate(`/chapter/${slug}#${nextSectionId || ''}`)
    } else if (nextExercise) {
      navigate(`/chapter/${slug}/exercise/${nextExercise.id}`)
      setOutput(null)
      setResult(null)
    } else {
      navigate(`/chapter/${slug}`)
    }
  }

  const nextChapterSlug = (() => {
    if (!catalog || !slug) return null
    const chapters = catalog.chapters || []
    const currentIdx = chapters.findIndex((ch) => ch.slug === slug)
    if (currentIdx !== -1 && currentIdx < chapters.length - 1) {
      return chapters[currentIdx + 1].slug
    }
    return null
  })()

  const handleNextChapter = () => {
    if (nextChapterSlug) {
      navigate(`/chapter/${nextChapterSlug}`)
    }
  }

  return (
    <Layout>
      <Confetti fire={confettiFire} />
      <div className="exercise-page">
        <div className="exercise-top">
          <Link to={`/chapter/${slug}`} className="back-link">
            ← {chapter.title}
          </Link>
          <div className="exercise-breadcrumb">
            <span>学习进度</span>
            <div className="progress-bar-sm">
              <div className="progress-fill-sm" style={{ width: `${(completedCount / exercises.length) * 100}%` }} />
            </div>
            <span>{completedCount} / {exercises.length}</span>
          </div>
        </div>

        <div className="exercise-layout">
          <aside className="exercise-panel">
            <div className="exercise-panel-header">
              <span className={`exercise-status ${result?.passed || isExerciseDone(exercise.id) ? 'done' : 'current'}`}>
                {result?.passed || isExerciseDone(exercise.id) ? '已完成' : '进行中'}
              </span>
            </div>
            <h1>{exercise.title}</h1>
            <p className="exercise-desc">{exercise.description}</p>

            {currentSectionContent && (
              <div className="lesson-toggle">
                <button type="button" onClick={() => setShowLesson(!showLesson)}>
                  {showLesson ? '📖 收起教程' : '📖 查看教程'}
                </button>
                {showLesson && (
                  <div className="lesson-inline">
                    <LessonContent content={currentSectionContent} />
                  </div>
                )}
              </div>
            )}

            {exercise.hint && (
              <div className="hint-box">
                <button type="button" onClick={() => setShowHint(!showHint)}>
                  {showHint ? '💡 隐藏提示' : '💡 显示提示'}
                </button>
                {showHint && <p>{exercise.hint}</p>}
              </div>
            )}

            <div className="action-row">
              <button type="button" className="btn-secondary" onClick={handleRun} disabled={running}>
                {running ? '⏳ 运行中...' : '▶ 运行'}
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '⏳ 判分中...' : '提交判分'}
              </button>
            </div>

            {(output || result) && (
              <div className={`output-box ${result?.passed ? 'success' : result ? 'fail' : ''}`}>
                <div className="output-box-header">
                  <span className="icon">{result?.passed ? '✓' : result ? '✗' : '▶'}</span>
                  <span className="title">{result?.passed ? '通过' : result ? '未通过' : '运行结果'}</span>
                </div>
                {result && <p className="result-message">{result?.passed ? '✓ ' : '✗ '}{result.message}</p>}
                {output && (
                  <>
                    {output.stdout && (
                      <>
                        <span className="stdout-label">stdout</span>
                        <pre className="stdout"><TypewriterText text={output.stdout} speed={8} /></pre>
                      </>
                    )}
                    {(output.stderr || output.error) && (
                      <>
                        <span className="stderr-label">stderr</span>
                        <pre className="stderr">{output.stderr || output.error}</pre>
                      </>
                    )}
                    <p className="run-meta">耗时 {output.durationMs}ms · exit {output.exitCode}</p>
                  </>
                )}
                {result?.passed && (
                  <>
                    {exercise.explanation && (
                      <div className="explanation-box">
                        <button type="button" onClick={() => setShowExplanation(!showExplanation)}>
                          {showExplanation ? '📝 收起解析' : '📝 查看解析'}
                        </button>
                        {showExplanation && (
                          <div className="explanation-content">{exercise.explanation}</div>
                        )}
                      </div>
                    )}
                    {isLastInChapter() ? (
                      <div className="action-buttons">
                        {nextChapterSlug ? (
                          <button type="button" className="btn-primary next-btn" onClick={() => handleNextChapter()}>
                            🎉 继续学下一章
                          </button>
                        ) : (
                          <button type="button" className="btn-primary next-btn" onClick={() => navigate('/')}>
                            🎉 恭喜完成全部课程
                          </button>
                        )}
                        <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                          🏠 回到首页
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn-primary next-btn" onClick={handleNext}>
                        {isLastInSection() ? '🎉 做的很好 下一小节 →' : '🎉 下一题 →'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </aside>

          <section className="editor-panel">
            <div className="editor-panel-header">
              <h3>
                <span>📄</span>
                <span>main.go</span>
              </h3>
              <span className="file-type">Go</span>
            </div>
            <div className="editor-panel-content">
              <CodeEditor value={code} onChange={setCode} />
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
