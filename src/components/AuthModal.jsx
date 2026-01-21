import { useState } from 'react'
import { authService } from '../lib/pocketbase'

function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await authService.login(email, password)
      } else {
        if (password !== passwordConfirm) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        result = await authService.register(email, password, passwordConfirm, name)
      }

      if (result.success) {
        onSuccess()
        onClose()
        // Reset form
        setEmail('')
        setPassword('')
        setPasswordConfirm('')
        setName('')
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-[#e5e7eb] p-8 w-full max-w-md mx-4 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#1a1a1a]">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#1a1a1a] text-2xl font-light transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f9fafb]"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent transition-all"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#dc2626] text-white py-3.5 px-6 rounded-xl hover:bg-[#b91c1c] focus:outline-none focus:ring-2 focus:ring-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm apple-button disabled:hover:bg-[#dc2626]"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="text-[#dc2626] hover:text-[#b91c1c] text-sm font-medium transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
