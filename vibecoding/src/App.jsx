import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Inicio from './pages/Inicio/Inicio'
import Almacen from './pages/Almacen/Almacen'
import Ventas from './pages/Ventas/Ventas'
import Login from './pages/Login/Login'
import { getCurrentUser, logout } from './services/authService'
import './App.css'

function ProtectedRoute({ user, children }) {
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function AppRoutes({ user, onLogin, onLogout }) {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute user={user}>
            <div className="app-container">
              <Navbar user={user} onLogout={onLogout} />
              <main className="app-content">
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/almacen" element={<Almacen />} />
                  <Route path="/ventas" element={<Ventas />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  const [user, setUser] = useState(() => getCurrentUser())

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  return (
    <BrowserRouter>
      <AppRoutes user={user} onLogin={setUser} onLogout={handleLogout} />
    </BrowserRouter>
  )
}

export default App
