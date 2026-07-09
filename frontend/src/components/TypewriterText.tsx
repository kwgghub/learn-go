import { useEffect, useRef, useState } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
}

export function TypewriterText({ text, speed = 12, className }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(0)
  const lastIndexRef = useRef(0)

  useEffect(() => {
    if (!text) {
      setDisplayed('')
      setDone(true)
      return
    }
    setDisplayed('')
    setDone(false)
    lastIndexRef.current = 0

    const tick = () => {
      const i = lastIndexRef.current
      if (i >= text.length) {
        setDone(true)
        return
      }
      // 每次推进 1-3 个字符，让中文字更快
      const step = Math.min(text.length - i, Math.random() > 0.5 ? 1 : 2)
      setDisplayed(text.slice(0, i + step))
      lastIndexRef.current = i + step
      timerRef.current = setTimeout(tick, speed)
    }

    timerRef.current = setTimeout(tick, speed)
    return () => clearTimeout(timerRef.current)
  }, [text, speed])

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="typewriter-cursor">▋</span>}
    </span>
  )
}
