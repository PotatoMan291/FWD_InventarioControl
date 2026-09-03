const AUTH_KEY = 'vera-admin-session'

const ADMIN = {
  username: 'admin',
  password: 'vera123',
  name: 'Administrador Vera',
  role: 'admin',
}

export function login(username, password, remember = false) {
  const normalizedUser = username.trim().toLowerCase()

  if (normalizedUser !== ADMIN.username || password !== ADMIN.password) {
    return { ok: false, message: 'Usuario o contraseña incorrectos.' }
  }

  const session = {
    username: ADMIN.username,
    name: ADMIN.name,
    role: ADMIN.role,
    loggedAt: new Date().toISOString(),
  }

  const storage = remember ? localStorage : sessionStorage
  const otherStorage = remember ? sessionStorage : localStorage
  otherStorage.removeItem(AUTH_KEY)
  storage.setItem(AUTH_KEY, JSON.stringify(session))

  return { ok: true, user: session }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(AUTH_KEY)
}

export function getCurrentUser() {
  const raw = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw)
    return session?.role === 'admin' ? session : null
  } catch {
    logout()
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getCurrentUser())
}
