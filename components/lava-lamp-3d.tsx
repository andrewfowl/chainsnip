"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { useRef, useMemo } from "react"
import type * as THREE from "three"

// Individual blob component
function LavaBlob({
  position,
  scale,
  color,
  speed,
}: {
  position: [number, number, number]
  scale: number
  color: string
  speed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  // Create random movement parameters for each blob
  const movement = useMemo(
    () => ({
      amplitude: {
        x: Math.random() * 3 + 1,
        y: Math.random() * 4 + 2,
        z: Math.random() * 3 + 1,
      },
      frequency: {
        x: Math.random() * 0.5 + 0.3,
        y: Math.random() * 0.3 + 0.2,
        z: Math.random() * 0.4 + 0.3,
      },
      offset: {
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2,
      },
    }),
    [],
  )

  useFrame((state, delta) => {
    if (!meshRef.current) return

    timeRef.current += delta * speed

    // Organic floating movement
    meshRef.current.position.x =
      position[0] + Math.sin(timeRef.current * movement.frequency.x + movement.offset.x) * movement.amplitude.x
    meshRef.current.position.y =
      position[1] + Math.sin(timeRef.current * movement.frequency.y + movement.offset.y) * movement.amplitude.y
    meshRef.current.position.z =
      position[2] + Math.cos(timeRef.current * movement.frequency.z + movement.offset.z) * movement.amplitude.z

    // Subtle rotation
    meshRef.current.rotation.x += delta * 0.1
    meshRef.current.rotation.y += delta * 0.15

    // Breathing scale effect
    const breathe = 1 + Math.sin(timeRef.current * 0.8) * 0.1
    meshRef.current.scale.setScalar(scale * breathe)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.8}
        roughness={0.1}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transmission={0.3}
        thickness={0.5}
        ior={1.4}
      />
    </mesh>
  )
}

// Camera controller for gentle movement
function CameraController() {
  const controlsRef = useRef<any>(null)

  useFrame((state) => {
    if (controlsRef.current) {
      // Gentle automatic rotation
      controlsRef.current.azimuthAngle += 0.002
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={5}
      maxDistance={25}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI - Math.PI / 6}
      autoRotate={false}
      enableDamping
      dampingFactor={0.05}
    />
  )
}

// Main 3D scene
function LavaLampScene() {
  // Generate blob configurations
  const blobs = useMemo(
    () => [
      { position: [0, 2, 0] as [number, number, number], scale: 1.5, color: "#FF6B35", speed: 0.8 },
      { position: [-3, -1, 2] as [number, number, number], scale: 1.2, color: "#FFB366", speed: 1.2 },
      { position: [4, 1, -1] as [number, number, number], scale: 1.8, color: "#D2691E", speed: 0.6 },
      { position: [1, -3, 3] as [number, number, number], scale: 1.0, color: "#FF8C42", speed: 1.0 },
      { position: [-2, 3, -2] as [number, number, number], scale: 1.3, color: "#FF6B35", speed: 0.9 },
      { position: [3, -2, 1] as [number, number, number], scale: 1.1, color: "#FFB366", speed: 1.1 },
      { position: [-1, 0, -3] as [number, number, number], scale: 1.4, color: "#D2691E", speed: 0.7 },
      { position: [2, 4, 2] as [number, number, number], scale: 0.9, color: "#FF8C42", speed: 1.3 },
    ],
    [],
  )

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} color="#FFB366" />

      {/* Main directional light */}
      <directionalLight position={[10, 10, 5]} intensity={1} color="#FF6B35" castShadow />

      {/* Fill lights */}
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#D2691E" />
      <pointLight position={[5, -5, 10]} intensity={0.3} color="#FF8C42" />

      {/* Environment for reflections */}
      <Environment preset="sunset" />

      {/* Render all blobs */}
      {blobs.map((blob, index) => (
        <LavaBlob key={index} position={blob.position} scale={blob.scale} color={blob.color} speed={blob.speed} />
      ))}

      {/* Camera controls */}
      <CameraController />
    </>
  )
}

// Main component
export default function LavaLamp3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "linear-gradient(135deg, #2D1B14 0%, #1A1A1A 100%)" }}
      >
        <LavaLampScene />
      </Canvas>
    </div>
  )
}
