import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Inicio from './pages/Inicio/Inicio'
import Almacen from './pages/Almacen/Almacen'
import Ventas from './pages/Ventas/Ventas'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/almacen" element={<Almacen />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}

export default App


