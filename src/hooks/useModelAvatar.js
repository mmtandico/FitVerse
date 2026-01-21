import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

/**
 * Hook for loading and customizing a 3D model avatar
 * @param {React.Ref} mountRef - Reference to the DOM element to mount the renderer
 * @param {string} modelPath - Path to the GLTF/GLB model file (e.g., '/models/character.glb')
 * @param {number} height - Avatar height (affects scale)
 * @param {number} weight - Avatar weight (affects body scale)
 * @param {string} skinColor - Skin color hex code
 * @param {string} hairType - Hair type (for material customization)
 */
export function useModelAvatar(mountRef, modelPath, height, weight, skinColor, hairType) {
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const avatarRef = useRef(null)
  const modelRef = useRef(null)
  const mixerRef = useRef(null)
  const clockRef = useRef(new THREE.Clock())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1e1b4b)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    // Camera position - will be adjusted when model loads
    camera.position.set(0, 1.2, 3.5)
    camera.lookAt(0, 1, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -1.0
    plane.receiveShadow = true
    scene.add(plane)

    // Animation loop
    const clock = new THREE.Clock()
    clockRef.current = clock

    let frameCount = 0
    const animate = () => {
      requestAnimationFrame(animate)
      frameCount++

      const delta = clock.getDelta()

      // Update animation mixer if it exists
      if (mixerRef.current) {
        mixerRef.current.update(delta)
      }

      // Rotate avatar slowly (only if no animation is playing)
      if (avatarRef.current && !mixerRef.current) {
        avatarRef.current.rotation.y += 0.005
      }

      // Debug first few frames
      if (frameCount <= 5 && avatarRef.current) {
        console.log(`🎨 Frame ${frameCount}:`, {
          visible: avatarRef.current.visible,
          position: avatarRef.current.position,
          children: avatarRef.current.children.length,
          inScene: scene.children.includes(avatarRef.current)
        })
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
  }, [mountRef])

  // Load 3D model (supports GLTF, GLB, and FBX)
  useEffect(() => {
    if (!modelPath || !sceneRef.current) return

    setLoading(true)
    setError(null)

    console.log('🔄 Starting to load model:', modelPath)

    // Timeout check - if loading takes too long, show warning
    let timeoutId = setTimeout(() => {
      console.warn('⚠️ Model loading is taking longer than expected...')
      console.warn('Large FBX files can take 30+ seconds to load. Please be patient.')
    }, 15000) // 15 seconds warning

    // Determine file type from extension
    const fileExtension = modelPath.toLowerCase().split('.').pop()
    const isFBX = fileExtension === 'fbx'
    const isGLTF = fileExtension === 'gltf' || fileExtension === 'glb'

    if (!isFBX && !isGLTF) {
      setError(`Unsupported file format: .${fileExtension}. Please use .gltf, .glb, or .fbx`)
      setLoading(false)
      return
    }

    const handleModelLoaded = (model, animations = []) => {
      // Remove old model and mixer if exists
      if (avatarRef.current) {
        sceneRef.current.remove(avatarRef.current)
        avatarRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
      }

      // Clean up old mixer
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current = null
      }

      // Clone model to avoid issues
      const clonedModel = model.clone()
      modelRef.current = clonedModel

      // Set up animations if they exist
      if (animations && animations.length > 0) {
        // Clone animations for the cloned model
        const clonedAnimations = animations.map(clip => {
          // Find the root bone/node in the cloned model
          const rootBone = clonedModel.getObjectByName(clip.tracks[0]?.name?.split('.')[0]) || clonedModel
          return clip.clone()
        })

        // Create animation mixer for the cloned model
        const mixer = new THREE.AnimationMixer(clonedModel)
        mixerRef.current = mixer

        // Play all animations
        clonedAnimations.forEach((clip) => {
          const action = mixer.clipAction(clip)
          action.play()
          console.log(`Playing animation: ${clip.name}`)
        })

        console.log(`✅ ${clonedAnimations.length} animation(s) loaded and playing`)
      }

      // Enable shadows and log model structure
      let meshCount = 0
      clonedModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          meshCount++
        }
      })
      console.log(`📊 Model has ${meshCount} mesh(es)`)

      // Center and scale model
      const box = new THREE.Box3().setFromObject(clonedModel)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      console.log('Model bounding box:', { center, size })

      // Scale based on height (normalize to 1.7m = 1.7 units)
      const heightScale = height / 170
      const maxSize = Math.max(size.x, size.y, size.z)
      const baseScale = maxSize > 0 ? 1.7 / maxSize : 1
      const finalScale = baseScale * heightScale

      console.log('Model scale:', { heightScale, baseScale, finalScale })

      clonedModel.scale.set(finalScale, finalScale, finalScale)

      // Reset position first
      clonedModel.position.set(0, 0, 0)

      // Recalculate box after scaling
      const scaledBox = new THREE.Box3().setFromObject(clonedModel)
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
      const scaledSize = scaledBox.getSize(new THREE.Vector3())

      // Center the model
      clonedModel.position.sub(scaledCenter)
      // Position on ground
      clonedModel.position.y = -scaledSize.y * 0.5

      // Adjust camera to fit model better
      if (cameraRef.current) {
        const modelHeight = scaledSize.y
        const distance = Math.max(modelHeight * 2.5, 3) // Minimum distance of 3
        cameraRef.current.position.set(0, modelHeight * 0.6, distance)
        cameraRef.current.lookAt(0, modelHeight * 0.3, 0)
        console.log('📷 Camera adjusted:', {
          position: cameraRef.current.position,
          lookAt: { x: 0, y: modelHeight * 0.3, z: 0 }
        })
      }

      console.log('✅ Model loaded and positioned:', {
        position: clonedModel.position,
        scale: clonedModel.scale,
        size: scaledSize,
        boundingBox: {
          min: scaledBox.min,
          max: scaledBox.max
        }
      })

      // Apply customizations
      customizeModel(clonedModel, height, weight, skinColor, hairType)

      // Ensure model is visible
      clonedModel.visible = true
      clonedModel.traverse((child) => {
        child.visible = true
      })

      sceneRef.current.add(clonedModel)
      avatarRef.current = clonedModel

      console.log('📦 Model added to scene:', {
        sceneChildren: sceneRef.current.children.length,
        modelInScene: sceneRef.current.children.includes(clonedModel),
        modelVisible: clonedModel.visible
      })

      // Force render multiple times
      if (rendererRef.current && cameraRef.current) {
        for (let i = 0; i < 5; i++) {
          rendererRef.current.render(sceneRef.current, cameraRef.current)
        }
        console.log('🎨 Forced render complete')
      }

      clearTimeout(timeoutId)
      setLoading(false)
      console.log('✅✅✅ Model loading and rendering COMPLETE!')
      console.log('If you don\'t see the model, check:')
      console.log('1. Camera position:', cameraRef.current?.position)
      console.log('2. Model position:', clonedModel.position)
      console.log('3. Model scale:', clonedModel.scale)
      console.log('4. Model visible:', clonedModel.visible)
    }

    const handleError = (error) => {
      console.error('❌ Error loading model:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        modelPath: modelPath
      })
      clearTimeout(timeoutId)
      setError(`Failed to load model: ${error.message || 'Unknown error'}. Check browser console (F12) for details.`)
      setLoading(false)
    }

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId)
    }

    const handleProgress = (progress) => {
      if (progress.total > 0) {
        const percent = (progress.loaded / progress.total) * 100
        console.log('📥 Loading progress:', percent.toFixed(1) + '%')
      } else {
        console.log('📥 Loading...', (progress.loaded / 1024 / 1024).toFixed(2), 'MB loaded')
      }
    }

    // Load based on file type
    if (isFBX) {
      const loader = new FBXLoader()
      console.log('📦 Loading FBX file:', modelPath)
      loader.load(
        modelPath,
        (fbx) => {
          console.log('✅ FBX file loaded successfully!')
          console.log('Model info:', {
            children: fbx.children.length,
            animations: fbx.animations?.length || 0,
            type: fbx.type
          })

          // Check for animations in FBX file
          if (fbx.animations && fbx.animations.length > 0) {
            console.log(`🎬 Found ${fbx.animations.length} animation(s) in FBX file`)
            fbx.animations.forEach((anim, i) => {
              console.log(`  Animation ${i + 1}: ${anim.name} (${anim.duration.toFixed(2)}s)`)
            })
          } else {
            console.log('ℹ️ No animations found in FBX file')
          }

          handleModelLoaded(fbx, fbx.animations || [])
        },
        handleProgress,
        handleError
      )
    } else {
      const loader = new GLTFLoader()
      loader.load(
        modelPath,
        (gltf) => {
          // Check for animations in GLTF file
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Found ${gltf.animations.length} animation(s) in GLTF file`)
          }
          handleModelLoaded(gltf.scene, gltf.animations)
        },
        handleProgress,
        handleError
      )
    }
  }, [modelPath])

  // Update model customizations when values change
  useEffect(() => {
    if (modelRef.current && sceneRef.current) {
      customizeModel(modelRef.current, height, weight, skinColor, hairType)

      // Update scale based on height
      const box = new THREE.Box3().setFromObject(modelRef.current)
      const size = box.getSize(new THREE.Vector3())
      const heightScale = height / 170
      const baseScale = 1.7 / Math.max(size.x, size.y, size.z)
      const finalScale = baseScale * heightScale

      modelRef.current.scale.set(finalScale, finalScale, finalScale)

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
  }, [height, weight, skinColor, hairType])

  // Customize model materials and parts
  const customizeModel = (model, currentHeight, currentWeight, currentSkinColor, currentHairType) => {
    if (!model) return

    const bmi = currentWeight / ((currentHeight / 100) ** 2)
    const bodyScale = 1 + (bmi - 22) * 0.02 // Adjust body width based on BMI

    model.traverse((child) => {
      if (child.isMesh) {
        // Customize skin color
        if (child.name.toLowerCase().includes('skin') ||
            child.name.toLowerCase().includes('body') ||
            child.name.toLowerCase().includes('head') ||
            child.name.toLowerCase().includes('arm') ||
            child.name.toLowerCase().includes('leg') ||
            child.name.toLowerCase().includes('hand') ||
            child.name.toLowerCase().includes('foot')) {
          if (child.material) {
            const material = Array.isArray(child.material) ? child.material[0] : child.material
            if (material.isMeshStandardMaterial || material.isMeshPhongMaterial) {
              material.color.setHex(currentSkinColor.replace('#', '0x'))
              material.needsUpdate = true
            }
          }
        }

        // Customize hair
        if (child.name.toLowerCase().includes('hair')) {
          if (currentHairType === 'bald') {
            child.visible = false
          } else {
            child.visible = true
            if (child.material) {
              const material = Array.isArray(child.material) ? child.material[0] : child.material
              if (material.isMeshStandardMaterial || material.isMeshPhongMaterial) {
                const hairColor = currentHairType === 'curly' ? 0x4A3728 : 0x2C1810
                material.color.setHex(hairColor)
                material.needsUpdate = true
              }
            }
          }
        }

        // Scale body parts based on weight
        if (child.name.toLowerCase().includes('body') ||
            child.name.toLowerCase().includes('torso') ||
            child.name.toLowerCase().includes('chest')) {
          child.scale.x = bodyScale
          child.scale.z = bodyScale
        }
      }
    })
  }

  return { loading, error }
}
