import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import AvatarModel from './AvatarModel'
import ProceduralAvatar from './ProceduralAvatar'
import CameraController from './CameraController'

function AvatarScene({ modelPath, height, weight, skinColor, hairType }) {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 0.1, 20.0], fov: 50 }}
      style={{ background: '#f9fafb' }}
    >
      {/* Camera controller to ensure it looks at the model */}
      <CameraController />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Avatar - either 3D model or procedural */}
      <Suspense fallback={null}>
        {modelPath ? (
          <AvatarModel
            modelPath={modelPath}
            height={height}
            weight={weight}
            skinColor={skinColor}
            hairType={hairType}
          />
        ) : (
          <ProceduralAvatar
            height={height}
            weight={weight}
            skinColor={skinColor}
            hairType={hairType}
          />
        )}
      </Suspense>

      {/* Camera controls - allow zoom to help user adjust view */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minDistance={10}
        maxDistance={25}
      />

      {/* Auto-rotate */}
      <RotatingAvatar />
    </Canvas>
  )
}

// Component to rotate avatar
function RotatingAvatar() {
  return null // Rotation handled in individual avatar components
}

export default AvatarScene
