import { Link } from 'react-router-dom'
import Particles from './Particles'

interface LayoutProps {
  children: React.ReactNode
  mainClass?: string
}

export function Layout({ children, mainClass }: LayoutProps) {
  const mainClassName = `main ${mainClass || ''}`
  return (
    <div className="app">
      <Particles />
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">Go</span>
          <span className="logo-text">小白学 Go</span>
        </Link>
        <nav className="nav">
          <a href="https://go.dev/doc/" target="_blank" rel="noreferrer">
            官方文档
          </a>
          <a href="https://go.dev/play/" target="_blank" rel="noreferrer">
            Playground
          </a>
        </nav>
      </header>
      <main className={mainClassName}>{children}</main>
      <footer className="footer">
        <p>在浏览器里学 Go · 代码当场跑 · 做对解锁下一题</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>Powered by Go · React · Monaco Editor</p>
      </footer>
    </div>
  )
}
