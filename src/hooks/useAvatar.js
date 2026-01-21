import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function useAvatar(mountRef, height, weight, skinColor, hairType) {
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const avatarRef = useRef(null)
  const planeRef = useRef(null)

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1e1b4b) // Dark purple to match design
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1.2, 3.5)
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
  }, [mountRef])

  // Create avatar when values change (only if all values are provided)
  useEffect(() => {
    if (sceneRef.current && rendererRef.current && cameraRef.current &&
        height !== null && weight !== null && skinColor !== null && hairType !== null) {
      createAvatar(sceneRef.current, height, weight, skinColor, hairType)
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
  }, [height, weight, skinColor, hairType])

  const getHairGeometry = (type, scale) => {
    switch (type) {
      case 'short':
        return new THREE.SphereGeometry(0.32 * scale, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5)
      case 'medium':
        return new THREE.CylinderGeometry(0.32 * scale, 0.3 * scale, 0.2 * scale, 32)
      case 'long':
        return new THREE.CylinderGeometry(0.32 * scale, 0.3 * scale, 0.4 * scale, 32)
      default:
        return new THREE.SphereGeometry(0.32 * scale, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5)
    }
  }

  const createAvatar = (scene, currentHeight, currentWeight, currentSkinColor, currentHairType) => {
    // Remove old avatar if exists
    if (avatarRef.current) {
      scene.remove(avatarRef.current)
      avatarRef.current.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose()
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      avatarRef.current = null
    }

    const avatarGroup = new THREE.Group()

    // Calculate body proportions
    const heightScale = currentHeight / 170
    const bmi = currentWeight / ((currentHeight / 100) ** 2)
    const bodyWidth = 0.45 + (bmi - 22) * 0.025
    const bodyWidthClamped = Math.max(0.4, Math.min(0.65, bodyWidth))
    const headSize = 0.3 * heightScale

    // Head
    const headGeometry = new THREE.SphereGeometry(headSize, 32, 32)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: currentSkinColor,
      flatShading: false
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 1.4 * heightScale
    head.castShadow = true
    avatarGroup.add(head)

    // Facial Features - Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08 * heightScale, 16, 16)
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const eyePupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.1 * heightScale, 1.45 * heightScale, 0.25 * heightScale)
    avatarGroup.add(leftEye)
    const leftPupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 * heightScale, 16, 16),
      eyePupilMaterial
    )
    leftPupil.position.set(-0.1 * heightScale, 1.45 * heightScale, 0.28 * heightScale)
    avatarGroup.add(leftPupil)

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.1 * heightScale, 1.45 * heightScale, 0.25 * heightScale)
    avatarGroup.add(rightEye)
    const rightPupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 * heightScale, 16, 16),
      eyePupilMaterial
    )
    rightPupil.position.set(0.1 * heightScale, 1.45 * heightScale, 0.28 * heightScale)
    avatarGroup.add(rightPupil)

    // Mouth
    const mouthGeometry = new THREE.TorusGeometry(0.06 * heightScale, 0.02 * heightScale, 8, 16, Math.PI)
    const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b })
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial)
    mouth.rotation.x = Math.PI
    mouth.position.set(0, 1.3 * heightScale, 0.25 * heightScale)
    avatarGroup.add(mouth)

    // Hair
    if (currentHairType !== 'bald') {
      if (currentHairType === 'curly') {
        const hairGroup = new THREE.Group()
        const hairMaterial = new THREE.MeshStandardMaterial({ color: '#4A3728' })
        for (let i = 0; i < 12; i++) {
          const curlGeometry = new THREE.SphereGeometry(0.06 * heightScale, 16, 16)
          const curl = new THREE.Mesh(curlGeometry, hairMaterial)
          const angle = (i / 12) * Math.PI * 2
          const radius = 0.25 * heightScale
          curl.position.set(
            Math.cos(angle) * radius,
            0.15 * heightScale,
            Math.sin(angle) * radius
          )
          curl.castShadow = true
          hairGroup.add(curl)
        }
        hairGroup.position.y = 1.4 * heightScale
        avatarGroup.add(hairGroup)
      } else {
        const hairGeometry = getHairGeometry(currentHairType, heightScale)
        const hairMaterial = new THREE.MeshStandardMaterial({
          color: '#2C1810',
          flatShading: false
        })
        const hair = new THREE.Mesh(hairGeometry, hairMaterial)
        hair.position.y = 1.4 * heightScale
        hair.castShadow = true
        avatarGroup.add(hair)
      }
    }

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(
      0.12 * heightScale,
      0.12 * heightScale,
      0.15 * heightScale,
      16
    )
    const neckMaterial = new THREE.MeshStandardMaterial({ color: currentSkinColor })
    const neck = new THREE.Mesh(neckGeometry, neckMaterial)
    neck.position.y = 1.2 * heightScale
    neck.castShadow = true
    avatarGroup.add(neck)

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(
      bodyWidthClamped * 0.5,
      bodyWidthClamped * 0.6,
      0.9 * heightScale,
      16
    )
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: currentSkinColor,
      flatShading: false
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.7 * heightScale
    body.castShadow = true
    avatarGroup.add(body)

    // Shoulders - positioned at top of body
    const shoulderY = 0.7 * heightScale + (0.9 * heightScale) / 2 // Top of body
    const shoulderX = bodyWidthClamped * 0.35 + 0.12 * heightScale // Slightly outside body

    const shoulderGeometry = new THREE.SphereGeometry(0.12 * heightScale, 16, 16)
    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: currentSkinColor })

    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial)
    leftShoulder.position.set(-shoulderX, shoulderY, 0)
    leftShoulder.castShadow = true
    avatarGroup.add(leftShoulder)

    const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial)
    rightShoulder.position.set(shoulderX, shoulderY, 0)
    rightShoulder.castShadow = true
    avatarGroup.add(rightShoulder)

    // Upper Arms - connect from shoulders
    const upperArmLength = 0.4 * heightScale
    const upperArmGeometry = new THREE.CylinderGeometry(
      0.1 * heightScale,
      0.1 * heightScale,
      upperArmLength,
      16
    )
    const armMaterial = new THREE.MeshStandardMaterial({ color: currentSkinColor })

    // Left upper arm - starts at shoulder, extends downward and slightly outward
    const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial)
    leftUpperArm.position.set(
      -shoulderX - 0.05 * heightScale,
      shoulderY - upperArmLength / 2,
      0
    )
    leftUpperArm.rotation.z = 0.15 // Slight outward angle
    leftUpperArm.castShadow = true
    avatarGroup.add(leftUpperArm)

    // Right upper arm
    const rightUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial)
    rightUpperArm.position.set(
      shoulderX + 0.05 * heightScale,
      shoulderY - upperArmLength / 2,
      0
    )
    rightUpperArm.rotation.z = -0.15 // Slight outward angle
    rightUpperArm.castShadow = true
    avatarGroup.add(rightUpperArm)

    // Lower Arms (Forearms) - connect from end of upper arm
    const lowerArmLength = 0.32 * heightScale
    const lowerArmGeometry = new THREE.CylinderGeometry(
      0.09 * heightScale,
      0.08 * heightScale,
      lowerArmLength,
      16
    )

    // Calculate elbow position (end of upper arm)
    const elbowY = shoulderY - upperArmLength
    const elbowXLeft = -shoulderX - 0.05 * heightScale - Math.sin(0.15) * upperArmLength
    const elbowXRight = shoulderX + 0.05 * heightScale + Math.sin(0.15) * upperArmLength

    const leftLowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial)
    leftLowerArm.position.set(
      elbowXLeft - Math.sin(0.25) * lowerArmLength / 2,
      elbowY - lowerArmLength / 2,
      0
    )
    leftLowerArm.rotation.z = 0.25 // Continue the arm angle
    leftLowerArm.castShadow = true
    avatarGroup.add(leftLowerArm)

    const rightLowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial)
    rightLowerArm.position.set(
      elbowXRight + Math.sin(0.25) * lowerArmLength / 2,
      elbowY - lowerArmLength / 2,
      0
    )
    rightLowerArm.rotation.z = -0.25 // Continue the arm angle
    rightLowerArm.castShadow = true
    avatarGroup.add(rightLowerArm)

    // Hands - positioned at end of lower arm
    const handGeometry = new THREE.SphereGeometry(0.1 * heightScale, 16, 16)
    const handMaterial = new THREE.MeshStandardMaterial({ color: currentSkinColor })

    // Calculate wrist position (end of lower arm)
    const wristY = elbowY - lowerArmLength
    const wristXLeft = elbowXLeft - Math.sin(0.25) * lowerArmLength
    const wristXRight = elbowXRight + Math.sin(0.25) * lowerArmLength

    const leftHand = new THREE.Mesh(handGeometry, handMaterial)
    leftHand.position.set(wristXLeft, wristY, 0)
    leftHand.castShadow = true
    avatarGroup.add(leftHand)

    const rightHand = new THREE.Mesh(handGeometry, handMaterial)
    rightHand.position.set(wristXRight, wristY, 0)
    rightHand.castShadow = true
    avatarGroup.add(rightHand)

    // Upper Legs
    const upperLegGeometry = new THREE.CylinderGeometry(
      0.12 * heightScale,
      0.13 * heightScale,
      0.4 * heightScale,
      16
    )
    const legMaterial = new THREE.MeshStandardMaterial({ color: currentSkinColor })

    const leftUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial)
    leftUpperLeg.position.set(-0.12 * heightScale, 0.15 * heightScale, 0)
    leftUpperLeg.castShadow = true
    avatarGroup.add(leftUpperLeg)

    const rightUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial)
    rightUpperLeg.position.set(0.12 * heightScale, 0.15 * heightScale, 0)
    rightUpperLeg.castShadow = true
    avatarGroup.add(rightUpperLeg)

    // Lower Legs
    const lowerLegGeometry = new THREE.CylinderGeometry(
      0.1 * heightScale,
      0.11 * heightScale,
      0.35 * heightScale,
      16
    )

    const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial)
    leftLowerLeg.position.set(-0.12 * heightScale, -0.2 * heightScale, 0)
    leftLowerLeg.castShadow = true
    avatarGroup.add(leftLowerLeg)

    const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial)
    rightLowerLeg.position.set(0.12 * heightScale, -0.2 * heightScale, 0)
    rightLowerLeg.castShadow = true
    avatarGroup.add(rightLowerLeg)

    // Feet
    const footGeometry = new THREE.BoxGeometry(
      0.15 * heightScale,
      0.08 * heightScale,
      0.2 * heightScale
    )
    const footMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })

    const leftFoot = new THREE.Mesh(footGeometry, footMaterial)
    leftFoot.position.set(-0.12 * heightScale, -0.45 * heightScale, 0.1 * heightScale)
    leftFoot.castShadow = true
    avatarGroup.add(leftFoot)

    const rightFoot = new THREE.Mesh(footGeometry, footMaterial)
    rightFoot.position.set(0.12 * heightScale, -0.45 * heightScale, 0.1 * heightScale)
    rightFoot.castShadow = true
    avatarGroup.add(rightFoot)

    scene.add(avatarGroup)
    avatarRef.current = avatarGroup
  }

  return { sceneRef, rendererRef, cameraRef, avatarRef }
}
