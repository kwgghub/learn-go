import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface LessonContentProps {
  content: string
  sectionId?: string
}

export function LessonContent({ content, sectionId }: LessonContentProps) {
  const headingIndexRef = { current: 0 }

  const components = {
    h2: ({ children }: { children?: React.ReactNode }) => {
      const index = headingIndexRef.current
      headingIndexRef.current++
      const headingId = sectionId ? `${sectionId}-heading-${index}` : `chapter-heading-${index}`
      return (
        <h2 id={headingId} className="lesson-heading">
          {children}
        </h2>
      )
    },
  }

  headingIndexRef.current = 0

  return (
    <article className="lesson-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  )
}
