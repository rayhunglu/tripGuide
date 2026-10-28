import { Route, Routes } from 'react-router-dom'
import Detail from './Detail.jsx'
import Home from './Home.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detail" element={<Detail />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
