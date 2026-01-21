import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const [height, setHeight] = useState(170) // in cm
  const [weight, setWeight] = useState(70) // in kg
  const [skinColor, setSkinColor] = useState('#FDBCB4')
  const [hairType, setHairType] = useState('short')

  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const avatarRef = useRef(null)
  const planeRef = useRef(null)

  // Skin color options
  const skinColors = [
    { name: 'Light', value: '#FDBCB4' },
    { name: 'Medium Light', value: '#E8A87C' },
    { name: 'Medium', value: '#D08B5B' },
    { name: 'Medium Dark', value: '#AE5D29' },
    { name: 'Dark', value: '#8B4513' },
  ]

  // Hair type options
  const hairTypes = ['short', 'medium', 'long', 'curly', 'bald']

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1.5, 3)
    camera.lookAt(0, 1, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Create ground plane (only once)
    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -1.0
    plane.receiveShadow = true
    scene.add(plane)
    planeRef.current = plane

    // Create initial avatar
    createAvatar(scene)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      if (avatarRef.current) {
        avatarRef.current.rotation.y += 0.005
      }
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  const createAvatar = (scene) => {
    // Remove old avatar if exists
    if (avatarRef.current) {
      scene.remove(avatarRef.current)
      avatarRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    }

    const avatarGroup = new THREE.Group()

    // Calculate body proportions based on height and weight
    const heightScale = height / 170 // Normalize to 170cm
    const bmi = weight / ((height / 100) ** 2)
    const bodyWidth = 0.4 + (bmi - 22) * 0.02 // Adjust width based on BMI
    const bodyWidthClamped = Math.max(0.35, Math.min(0.55, bodyWidth))

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25 * heightScale, 32, 32)
    const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 1.5 * heightScale
    head.castShadow = true
    avatarGroup.add(head)

    // Hair
    if (hairType !== 'bald') {
      if (hairType === 'curly') {
        const hairGroup = new THREE.Group()
        const hairMaterial = new THREE.MeshStandardMaterial({ color: '#4A3728' })
        for (let i = 0; i < 8; i++) {
          const curlGeometry = new THREE.SphereGeometry(0.05 * heightScale, 16, 16)
          const curl = new THREE.Mesh(curlGeometry, hairMaterial)
          const angle = (i / 8) * Math.PI * 2
          curl.position.set(
            Math.cos(angle) * 0.2 * heightScale,
            0.1 * heightScale,
            Math.sin(angle) * 0.2 * heightScale
          )
          curl.castShadow = true
          hairGroup.add(curl)
        }
        hairGroup.position.y = 1.5 * heightScale
        avatarGroup.add(hairGroup)
      } else {
        const hairGeometry = getHairGeometry(hairType, heightScale)
        const hairMaterial = new THREE.MeshStandardMaterial({ color: '#2C1810' })
        const hair = new THREE.Mesh(hairGeometry, hairMaterial)
        hair.position.y = 1.5 * heightScale
        hair.castShadow = true
        avatarGroup.add(hair)
      }
    }

    // Body (torso)
    const bodyGeometry = new THREE.BoxGeometry(bodyWidthClamped, 0.8 * heightScale, 0.3)
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: skinColor })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.8 * heightScale
    body.castShadow = true
    avatarGroup.add(body)

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6 * heightScale, 16)
    const armMaterial = new THREE.MeshStandardMaterial({ color: skinColor })

    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.set(-bodyWidthClamped / 2 - 0.1, 0.8 * heightScale, 0)
    leftArm.castShadow = true
    avatarGroup.add(leftArm)

    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.set(bodyWidthClamped / 2 + 0.1, 0.8 * heightScale, 0)
    rightArm.castShadow = true
    avatarGroup.add(rightArm)

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7 * heightScale, 16)
    const legMaterial = new THREE.MeshStandardMaterial({ color: skinColor })

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.1, -0.35 * heightScale, 0)
    leftLeg.castShadow = true
    avatarGroup.add(leftLeg)

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.1, -0.35 * heightScale, 0)
    rightLeg.castShadow = true
    avatarGroup.add(rightLeg)

    scene.add(avatarGroup)
    avatarRef.current = avatarGroup
  }

  const getHairGeometry = (type, scale) => {
    switch (type) {
      case 'short':
        return new THREE.SphereGeometry(0.27 * scale, 32, 32)
      case 'medium':
        return new THREE.CylinderGeometry(0.27 * scale, 0.25 * scale, 0.15 * scale, 32)
      case 'long':
        return new THREE.CylinderGeometry(0.27 * scale, 0.25 * scale, 0.3 * scale, 32)
      default:
        return new THREE.SphereGeometry(0.27 * scale, 32, 32)
    }
  }

  // Update avatar when customization changes
  useEffect(() => {
    if (sceneRef.current) {
      createAvatar(sceneRef.current)
    }
  }, [height, weight, skinColor, hairType])

  // Calculate BMI
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          FitVerse Avatar Customizer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Display */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Avatar</h2>
            <div
              ref={mountRef}
              className="w-full h-96 rounded-lg border-2 border-gray-200"
              style={{ minHeight: '400px' }}
            />
            <div className="mt-4 text-center">
              <p className="text-lg font-medium text-gray-600">
                Height: {height} cm | Weight: {weight} kg
              </p>
              <p className="text-md text-gray-500">
                BMI: {bmi}
              </p>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Customize Your Avatar</h2>

            {/* Height Control */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height: {height} cm
              </label>
              <input
                type="range"
                min="140"
                max="200"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>140 cm</span>
                <span>200 cm</span>
              </div>
            </div>

            {/* Weight Control */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight: {weight} kg
              </label>
              <input
                type="range"
                min="40"
                max="120"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>40 kg</span>
                <span>120 kg</span>
              </div>
            </div>

            {/* Skin Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Skin Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {skinColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSkinColor(color.value)}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      skinColor === color.value
                        ? 'border-indigo-600 scale-110 shadow-lg'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Hair Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hair Type
              </label>
              <div className="grid grid-cols-5 gap-2">
                {hairTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setHairType(type)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      hairType === type
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
