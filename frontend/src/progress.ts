const STORAGE_KEY = 'learn-go-progress'

export interface Progress {
  completedExercises: string[]
  readChapters: string[]
  lastPosition: { slug: string; sectionId: string } | null
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completedExercises: [], readChapters: [], lastPosition: null }
    return JSON.parse(raw) as Progress
  } catch {
    return { completedExercises: [], readChapters: [], lastPosition: null }
  }
}

function save(progress: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markExerciseDone(exerciseId: string) {
  const p = load()
  if (!p.completedExercises.includes(exerciseId)) {
    p.completedExercises.push(exerciseId)
    save(p)
  }
}

export function markChapterRead(slug: string) {
  const p = load()
  if (!p.readChapters.includes(slug)) {
    p.readChapters.push(slug)
    save(p)
  }
}

export function isExerciseDone(exerciseId: string) {
  return load().completedExercises.includes(exerciseId)
}

export function isChapterRead(slug: string) {
  return load().readChapters.includes(slug)
}

export function chapterProgress(slug: string, exerciseIds: string[], isReading: boolean) {
  if (isReading) {
    return isChapterRead(slug) ? 100 : 0
  }
  if (exerciseIds.length === 0) return 0
  const done = exerciseIds.filter((id) => isExerciseDone(id)).length
  return Math.round((done / exerciseIds.length) * 100)
}

export function isExerciseUnlocked(
  exerciseIds: string[],
  index: number,
  isReading: boolean,
) {
  if (isReading) return true
  if (index === 0) return true
  const prevId = exerciseIds[index - 1]
  return isExerciseDone(prevId)
}

export function getProgress() {
  return load()
}

export function setLastPosition(slug: string, sectionId: string) {
  const p = load()
  p.lastPosition = { slug, sectionId }
  save(p)
}

export function getLastPosition(slug: string) {
  const p = load()
  if (p.lastPosition && p.lastPosition.slug === slug) {
    return p.lastPosition.sectionId
  }
  return null
}
