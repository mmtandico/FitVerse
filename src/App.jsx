import { useState, useEffect, useRef } from 'react'
import { authService, avatarService } from './lib/pocketbase'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import AvatarViewer from './components/AvatarViewer'
import AvatarControls from './components/AvatarControls'
import MessageBanner from './components/MessageBanner'
import './App.css'

function App() {
  // ============================================
  // DEFAULT AVATAR VALUES - Change these to customize the default appearance
  // ============================================
  const [gender, setGender] = useState('male') // Default gender: 'male' or 'female'
  const [height, setHeight] = useState(170) // Default height in cm (140-200)
  const [weight, setWeight] = useState(70) // Default weight in kg (40-120)
  const [skinColor, setSkinColor] = useState('#FDBCB4') // Default skin color (Light)
  const [hairType, setHairType] = useState('short') // Default hair type: 'short', 'medium', 'long', 'curly', 'bald'

  // Dynamic model path based on gender
  // Place your models in: public/models/
  const modelPath = gender === 'male' ? '/models/Male.fbx' : '/models/Female.fbx'

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      if (authenticated) {
        setCurrentUser(authService.getCurrentUser())
        // Don't auto-load - let user click load button
      }
    }
    checkAuth()

    // Check auth periodically (PocketBase doesn't have a built-in event emitter for React)
    const interval = setInterval(checkAuth, 1000)

    return () => clearInterval(interval)
  }, [])

  // Load avatar from PocketBase
  const loadAvatar = async () => {
    if (!authService.isAuthenticated()) {
      setShowAuthModal(true)
      return
    }

    setLoading(true)
    setSaveMessage('')
    const result = await avatarService.loadAvatar()

    if (result.success) {
      setGender(result.avatar.gender || 'male')
      setHeight(result.avatar.height)
      setWeight(result.avatar.weight)
      setSkinColor(result.avatar.skinColor)
      setHairType(result.avatar.hairType)
      setSaveMessage('Avatar loaded successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } else {
      // Only show error if it's not "No saved avatar found" (that's normal for new users)
      if (result.error && !result.error.includes('No saved avatar found')) {
        setSaveMessage(result.error || 'Failed to load avatar')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('No saved avatar found. Customize and save your avatar!')
        setTimeout(() => setSaveMessage(''), 4000)
      }
    }
    setLoading(false)
  }

  // Save avatar to PocketBase
  const saveAvatar = async () => {
    if (!authService.isAuthenticated()) {
      setShowAuthModal(true)
      return
    }

    setLoading(true)
    setSaveMessage('')
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1)

    const result = await avatarService.saveAvatar({
      gender,
      height,
      weight,
      skinColor,
      hairType,
      bmi: parseFloat(bmi),
    })

    if (result.success) {
      setSaveMessage('Avatar saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } else {
      setSaveMessage(result.error || 'Failed to save avatar')
      setTimeout(() => setSaveMessage(''), 3000)
    }
    setLoading(false)
  }

  // Handle logout
  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setSaveMessage('Logged out successfully')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setIsAuthenticated(authService.isAuthenticated())
    setCurrentUser(authService.getCurrentUser())
    // Don't auto-load on login
  }

  return (
    <div className="min-h-screen bg-white">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12">
        <Header
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLoginClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />

        <MessageBanner
          message={saveMessage}
          type={saveMessage.includes('Error') || saveMessage.includes('Failed') ? 'error' : saveMessage.includes('No saved') ? 'info' : 'success'}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Avatar Viewer (taller for full character display) */}
          <AvatarViewer
            height={height}
            weight={weight}
            skinColor={skinColor}
            hairType={hairType}
            modelPath={modelPath}
          />

          {/* Right Side - Customization Controls */}
          <AvatarControls
            gender={gender}
            height={height}
            weight={weight}
            skinColor={skinColor}
            hairType={hairType}
            onGenderChange={setGender}
            onHeightChange={setHeight}
            onWeightChange={setWeight}
            onSkinColorChange={setSkinColor}
            onHairTypeChange={setHairType}
            onSave={saveAvatar}
            onLoad={loadAvatar}
            isAuthenticated={isAuthenticated}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default App
