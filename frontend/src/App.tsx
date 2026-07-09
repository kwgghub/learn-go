import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/Home'
import { ChapterPage } from './pages/Chapter'
import { ExercisePage } from './pages/Exercise'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chapter/:slug" element={<ChapterPage />} />
        <Route path="/chapter/:slug/exercise/:exerciseId" element={<ExercisePage />} />
      </Routes>
    </BrowserRouter>
  )
}
