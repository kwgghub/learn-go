export interface Section {
  id: string
  title: string
  range: string
  description: string
}

export interface ChapterSummary {
  id: string
  slug: string
  title: string
  summary: string
  type: 'reading' | 'coding'
  minutes: number
  exercises: number
  section: string
  exerciseIds: string[]
}

export interface Exercise {
  id: string
  title: string
  description: string
  hint?: string
  explanation?: string
  starterCode: string
  tests: { type: string; expected: string }[]
}

export interface ChapterSection {
  id: string
  title: string
  content?: string
  exerciseList?: Exercise[]
  subheadings?: string[]
}

export interface Chapter extends ChapterSummary {
  content?: string
  exerciseList?: Exercise[]
  sections?: ChapterSection[]
}

export interface Catalog {
  sections: Section[]
  chapters: ChapterSummary[]
}

export interface RunResult {
  stdout: string
  stderr: string
  exitCode: number
  durationMs: number
  error?: string
}

export interface Validation {
  passed: boolean
  message: string
  stdout?: string
  stderr?: string
  expected?: string
}
