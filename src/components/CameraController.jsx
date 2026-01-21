import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

function CameraController() {
  const { camera } = useThree()

  useEffect(() => {
    // Make camera look at the center of the scene (where the model should be)
    // Adjust lookAt to center the model better in viewport
    camera.lookAt(0, 0.3, 0) // Look at a point at model's center height

    // Update camera projection matrix after lookAt
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

export default CameraController
