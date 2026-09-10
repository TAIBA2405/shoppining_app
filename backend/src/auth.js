// JWT session handling shared by login/signup + admin guard.
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-only-change-me'

export function signToken(user) {
  return jwt.sign(
    { uid: user.id, email: user.email, isAdmin: !!user.is_admin },
    SECRET,
    { expiresIn: '7d' }
  )
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    req.auth = jwt.verify(token, SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired — please log in again' })
  }
}

export function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (!req.auth?.isAdmin) return res.status(403).json({ error: 'Admin only' })
    next()
  })
}
