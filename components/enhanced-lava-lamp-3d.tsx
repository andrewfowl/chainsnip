"use client"

import type React from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { useRef, useMemo, useState, useCallback, useEffect } from "react"
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js"

const noise = new SimplexNoise()

export type BlobMode = "standard" | "leviathan" | "molten" | "bioluminescent" | "swarm"

const BLOB_RECHECK_INTERVAL = 3500 // Slightly more frequent checks
const BLOB_MAX_INACTIVE_TIME = 7000 // Slightly shorter inactive time

type GeometryType = "sphere" | "icosahedron"

interface BlobData {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  scale: number
  targetScale: number
  baseScale: number
  color: THREE.Color
  targetColor: THREE.Color
  baseColor: THREE.Color
  speedFactor: number
  isActive: boolean
  lastActiveTime: number
  repulsionIntensity: number
  morphIntensity: number
  morphSpeed: number
  geometryType: GeometryType
  timeOffset: number
  opacity: number
  targetOpacity: number
  initialDelay: number // Milliseconds before this blob starts appearing
  hasAppeared: boolean // Tracks if initial delay has passed
}

// Updated BLOB_CONFIGURATIONS with "Vibrant Dawn" palette and increased counts
const ORIGINAL_COUNTS = {
  // Store original counts before adding more
  standard: 7,
  leviathan: 3,
  molten: 6,
  bioluminescent: 9,
  swarm: 20,
}

const BLOB_CONFIGURATIONS = {
  standard: {
    count: ORIGINAL_COUNTS.standard + 7, // Total 14
    minScale: 1.8,
    maxScale: 3.8,
    minSpeedFactor: 0.04,
    maxSpeedFactor: 0.12,
    maxBlobsPool: ORIGINAL_COUNTS.standard + 7 + 3, // Pool of 17
    colors: ["#FF7F50", "#FF8C69", "#FFA07A", "#FFB399", "#FFDAB9"],
    morphIntensity: 0.2,
    morphSpeed: 0.16,
    geometryType: "sphere" as GeometryType,
  },
  leviathan: {
    count: ORIGINAL_COUNTS.leviathan + 7, // Total 10
    minScale: 5.0,
    maxScale: 7.5,
    minSpeedFactor: 0.01,
    maxSpeedFactor: 0.06,
    maxBlobsPool: ORIGINAL_COUNTS.leviathan + 7 + 2, // Pool of 12
    colors: ["#FF6347", "#FF4500", "#E65530", "#CC4C29", "#B34222"],
    morphIntensity: 0.05,
    morphSpeed: 0.1,
    geometryType: "sphere" as GeometryType,
  },
  molten: {
    count: ORIGINAL_COUNTS.molten + 7, // Total 13
    minScale: 2.2,
    maxScale: 4.2,
    minSpeedFactor: 0.07,
    maxSpeedFactor: 0.18,
    maxBlobsPool: ORIGINAL_COUNTS.molten + 7 + 3, // Pool of 16
    colors: ["#FFD700", "#FFA500", "#FF8C00", "#FF7733", "#FF6600"],
    morphIntensity: 0.35,
    morphSpeed: 0.3,
    geometryType: "icosahedron" as GeometryType,
  },
  bioluminescent: {
    count: ORIGINAL_COUNTS.bioluminescent + 7, // Total 16
    minScale: 1.0,
    maxScale: 3.0,
    minSpeedFactor: 0.18,
    maxSpeedFactor: 0.45,
    maxBlobsPool: ORIGINAL_COUNTS.bioluminescent + 7 + 4, // Pool of 20
    colors: ["#20B2AA", "#40E0D0", "#00CED1", "#FFD700", "#FFA07A", "#5F9EA0"],
    morphIntensity: 0.16,
    morphSpeed: 0.6,
    geometryType: "icosahedron" as GeometryType,
  },
  swarm: {
    count: ORIGINAL_COUNTS.swarm + 7, // Total 27
    minScale: 0.25,
    maxScale: 0.9,
    minSpeedFactor: 0.6,
    maxSpeedFactor: 1.4,
    maxBlobsPool: ORIGINAL_COUNTS.swarm + 7 + 5, // Pool of 32
    colors: ["#FF7F50", "#FFD700", "#FFB6C1", "#FFA07A", "#20B2AA", "#FFC0CB"],
    morphIntensity: 0.08,
    morphSpeed: 1.2,
    geometryType: "sphere" as GeometryType,
  },
}

function createBlob(
  id: string,
  viewport: { width: number; height: number },
  config: (typeof BLOB_CONFIGURATIONS)[BlobMode],
  isInitialBlob: boolean, // To determine delay
  blobIndex: number, // To vary entry angles for new blobs
): BlobData {
  const colors = config.colors
  const randomBaseScale = Math.random() * (config.maxScale - config.minScale) + config.minScale

  let initialPositionX, initialPositionY, initialPositionZ
  const edgeFactor = 1.1 // Start slightly outside the main view area for delayed blobs

  if (!isInitialBlob) {
    // Distribute new blobs from different angles/edges
    const angle = (blobIndex / 7) * Math.PI * 2 + Math.random() * 0.5 // Spread around 7 new blobs
    const radiusX = viewport.width * 0.5 * edgeFactor
    const radiusY = viewport.height * 0.5 * edgeFactor
    const depthRadius = 8 * edgeFactor

    const entryType = blobIndex % 4 // 0: sides, 1: top/bottom, 2: front/back, 3: corners

    if (entryType === 0) {
      // From sides
      initialPositionX = Math.cos(angle) * radiusX
      initialPositionY = (Math.random() - 0.5) * viewport.height * 0.4
      initialPositionZ = (Math.random() - 0.5) * 10
    } else if (entryType === 1) {
      // From top/bottom
      initialPositionX = (Math.random() - 0.5) * viewport.width * 0.4
      initialPositionY = Math.sin(angle) * radiusY // Using sin for vertical spread
      initialPositionZ = (Math.random() - 0.5) * 10
    } else if (entryType === 2) {
      // From front/back
      initialPositionX = (Math.random() - 0.5) * viewport.width * 0.4
      initialPositionY = (Math.random() - 0.5) * viewport.height * 0.4
      initialPositionZ = Math.cos(angle) * depthRadius // Using cos for depth spread
    } else {
      // From corners (mix)
      initialPositionX = Math.cos(angle) * radiusX * 0.7
      initialPositionY = Math.sin(angle) * radiusY * 0.7
      initialPositionZ = Math.cos(angle + Math.PI / 4) * depthRadius * 0.7
    }
  } else {
    // Original blobs start more centrally
    initialPositionX = (Math.random() - 0.5) * viewport.width * 0.3
    initialPositionY = (Math.random() - 0.5) * viewport.height * 0.3
    initialPositionZ = (Math.random() - 0.5) * 10 - 5
  }

  const initialPosition = new THREE.Vector3(initialPositionX, initialPositionY, initialPositionZ)
  const baseColor = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
  const randomFactor = (range: number) => 1 + (Math.random() - 0.5) * range

  return {
    id,
    position: initialPosition.clone(),
    velocity: new THREE.Vector3(0, 0, 0),
    scale: 0.01, // Start very small
    targetScale: randomBaseScale,
    baseScale: randomBaseScale,
    color: baseColor.clone().offsetHSL(0, 0.05, 0.1),
    targetColor: baseColor.clone(),
    baseColor: baseColor.clone(),
    speedFactor:
      (Math.random() * (config.maxSpeedFactor - config.minSpeedFactor) + config.minSpeedFactor) * randomFactor(0.15),
    isActive: true, // Will be controlled by delay for appearance
    lastActiveTime: Date.now(),
    repulsionIntensity: 0,
    morphIntensity: config.morphIntensity * randomFactor(0.25),
    morphSpeed: config.morphSpeed * randomFactor(0.25),
    geometryType: config.geometryType,
    timeOffset: Math.random() * 2000,
    opacity: 0, // Start invisible
    targetOpacity: 0, // Will be set to 1 after delay
    initialDelay: isInitialBlob ? 200 : 5000 + Math.random() * 1000, // 200ms for initial, 5-6s for new ones
    hasAppeared: false,
  }
}

function EnhancedLavaBlob({
  blobData,
  allBlobs,
  onUpdateBlob,
  mode,
}: {
  blobData: BlobData
  allBlobs: React.MutableRefObject<BlobData[]>
  onUpdateBlob: (id: string, updates: Partial<BlobData>) => void
  mode: BlobMode
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const internalTimeRef = useRef(blobData.timeOffset)
  const { viewport, camera, clock: r3fClock } = useThree() // Get clock from useThree
  const frustum = useMemo(() => new THREE.Frustum(), [])
  const projScreenMatrix = useMemo(() => new THREE.Matrix4(), [])
  const [isReadyToAppear, setIsReadyToAppear] = useState(false)

  useEffect(() => {
    if (blobData.hasAppeared) {
      setIsReadyToAppear(true)
      onUpdateBlob(blobData.id, { targetOpacity: 1.0 })
      return
    }
    const timer = setTimeout(() => {
      setIsReadyToAppear(true)
      onUpdateBlob(blobData.id, { targetOpacity: 1.0, hasAppeared: true })
    }, blobData.initialDelay)
    return () => clearTimeout(timer)
  }, [blobData.id, blobData.initialDelay, blobData.hasAppeared, onUpdateBlob])

  const isBlobInView = useCallback(() => {
    if (!meshRef.current) return false
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(projScreenMatrix)
    const boundingSphere = meshRef.current.geometry.boundingSphere?.clone().applyMatrix4(meshRef.current.matrixWorld)
    if (boundingSphere) {
      boundingSphere.radius *= 1.15
      return frustum.intersectsSphere(boundingSphere)
    }
    return frustum.intersectsObject(meshRef.current)
  }, [camera, frustum, projScreenMatrix])

  useFrame((state, delta) => {
    if (!meshRef.current || !isReadyToAppear || (!blobData.isActive && blobData.opacity < 0.01)) return

    const effectiveDelta = Math.min(delta, 0.033)
    internalTimeRef.current += effectiveDelta * 0.45

    const noiseTime = internalTimeRef.current * blobData.speedFactor * 0.18
    const pos = blobData.position
    const noiseScaleMovement = 0.035

    const force = new THREE.Vector3(
      noise.noise3d(pos.x * noiseScaleMovement + blobData.timeOffset, pos.y * noiseScaleMovement, noiseTime),
      noise.noise3d(pos.y * noiseScaleMovement + blobData.timeOffset, pos.z * noiseScaleMovement, noiseTime),
      noise.noise3d(pos.z * noiseScaleMovement + blobData.timeOffset, pos.x * noiseScaleMovement, noiseTime),
    ).multiplyScalar(blobData.speedFactor * effectiveDelta * 25) // Slightly reduced base force

    if (mode === "standard" || mode === "molten" || mode === "swarm") {
      const buoyancy = (0.7 + noise.noise(noiseTime, blobData.id.charCodeAt(0)) * 0.6) * effectiveDelta
      force.y += buoyancy
    }
    blobData.velocity.add(force)

    let totalRepulsion = 0
    for (const otherBlob of allBlobs.current) {
      if (otherBlob.id === blobData.id || (!otherBlob.isActive && otherBlob.opacity < 0.01) || !otherBlob.hasAppeared)
        continue
      const distance = blobData.position.distanceTo(otherBlob.position)
      const repulsionThreshold = (blobData.scale + otherBlob.scale) * 0.5
      if (distance < repulsionThreshold && distance > 0.01) {
        // Added distance > 0.01 check
        const repulsionStrength = Math.pow(1 - distance / repulsionThreshold, 1.8) * 0.08 * effectiveDelta * 60 // Softer, power 1.8
        const repulsionDir = new THREE.Vector3().subVectors(blobData.position, otherBlob.position).normalize()
        blobData.velocity.add(repulsionDir.multiplyScalar(repulsionStrength))
        totalRepulsion += repulsionStrength * 0.6
      }
    }
    onUpdateBlob(blobData.id, { repulsionIntensity: totalRepulsion })

    blobData.velocity.multiplyScalar(1 - 0.8 * effectiveDelta) // Reduced damping for more persistent movement

    const boundaryPush = 0.05 * effectiveDelta * 60
    const boundaryPadding = 0.65 // Wider boundary
    if (pos.x > viewport.width * boundaryPadding) blobData.velocity.x -= boundaryPush
    if (pos.x < -viewport.width * boundaryPadding) blobData.velocity.x += boundaryPush
    if (pos.y > viewport.height * boundaryPadding) blobData.velocity.y -= boundaryPush
    if (pos.y < -viewport.height * boundaryPadding) blobData.velocity.y += boundaryPush
    if (pos.z > 6) blobData.velocity.z -= boundaryPush // Adjusted Z boundaries
    if (pos.z < -12) blobData.velocity.z += boundaryPush

    blobData.position.add(blobData.velocity.clone().multiplyScalar(effectiveDelta))
    meshRef.current.position.copy(blobData.position)

    const lerpFactor = effectiveDelta * 0.35 // Slower lerp for smoother transitions
    blobData.scale = THREE.MathUtils.lerp(blobData.scale, blobData.targetScale, lerpFactor)
    blobData.color.lerp(blobData.targetColor, lerpFactor)
    blobData.opacity = THREE.MathUtils.lerp(blobData.opacity, blobData.targetOpacity, lerpFactor * 1.2) // Opacity can lerp a bit faster
    blobData.repulsionIntensity = THREE.MathUtils.lerp(blobData.repulsionIntensity, 0, lerpFactor * 1.8)

    meshRef.current.scale.setScalar(Math.max(0.01, blobData.scale)) // Ensure scale doesn't go to zero causing issues
    const material = meshRef.current.material as THREE.MeshPhysicalMaterial
    material.opacity = blobData.opacity * (mode === "leviathan" ? 0.65 : mode === "standard" ? 0.75 : 0.8)
    material.visible = blobData.opacity > 0.005 // Hide if nearly transparent

    if (blobData.isActive && isBlobInView()) {
      onUpdateBlob(blobData.id, { lastActiveTime: Date.now() })
    }

    const geometry = meshRef.current.geometry
    const originalPositions =
      geometry.userData.originalPositions || (geometry.attributes.position.array as Float32Array).slice()
    if (!geometry.userData.originalPositions) geometry.userData.originalPositions = originalPositions

    const positions = geometry.attributes.position.array as Float32Array
    const vertex = new THREE.Vector3()
    const morphTime = r3fClock.getElapsedTime() * blobData.morphSpeed * 0.65 + blobData.timeOffset // Use r3fClock
    const currentMorphIntensity = blobData.morphIntensity + blobData.repulsionIntensity * 1.5 // Reduced deformation from repulsion

    for (let i = 0; i < originalPositions.length; i += 3) {
      vertex.set(originalPositions[i], originalPositions[i + 1], originalPositions[i + 2])
      const normalizedVertex = vertex.clone().normalize()
      const noiseFactor =
        currentMorphIntensity * blobData.baseScale * (0.58 + 0.42 * Math.sin(vertex.length() * 1.45 + morphTime))
      const noiseSamplingScale = 1.45 / blobData.baseScale

      const displacement =
        noise.noise3d(
          normalizedVertex.x * noiseSamplingScale + morphTime * 0.18,
          normalizedVertex.y * noiseSamplingScale + morphTime * 0.22,
          normalizedVertex.z * noiseSamplingScale + morphTime * 0.28,
        ) * noiseFactor
      const displacedVertex = vertex.clone().multiplyScalar(1 + displacement)
      positions[i] = displacedVertex.x
      positions[i + 1] = displacedVertex.y
      positions[i + 2] = displacedVertex.z
    }
    geometry.attributes.position.needsUpdate = true
    if (geometry.attributes.normal) geometry.computeVertexNormals() // Check if normals exist
  })

  const getEmissiveColor = () => {
    if (mode === "molten") return new THREE.Color(blobData.color).multiplyScalar(0.8)
    if (mode === "bioluminescent") return new THREE.Color(blobData.color).multiplyScalar(0.7)
    if (mode === "leviathan") return new THREE.Color(blobData.color).multiplyScalar(0.3)
    return new THREE.Color(0x000000)
  }

  return (
    <mesh ref={meshRef} position={blobData.position.toArray()} visible={blobData.opacity > 0.005}>
      {blobData.geometryType === "icosahedron" ? (
        <icosahedronGeometry args={[1, mode === "molten" ? 5 : 7]} /> // Increased detail for icosahedrons
      ) : (
        <sphereGeometry args={[1, mode === "leviathan" ? 60 : 48, mode === "leviathan" ? 60 : 48]} /> // Increased detail
      )}
      <meshPhysicalMaterial
        color={blobData.color}
        transparent
        opacity={0} // Initial opacity set by blobData.opacity via material.opacity
        roughness={mode === "leviathan" ? 0.01 : mode === "standard" ? 0.06 : 0.03}
        metalness={mode === "leviathan" ? 0.3 : mode === "standard" ? 0.02 : 0.15}
        clearcoat={mode === "leviathan" ? 1.0 : mode === "standard" ? 0.3 : 0.8}
        clearcoatRoughness={mode === "leviathan" ? 0.03 : mode === "standard" ? 0.3 : 0.07}
        transmission={mode === "leviathan" ? 0.85 : mode === "standard" ? 0.8 : 0.7}
        thickness={
          mode === "leviathan"
            ? 1.7 * blobData.scale
            : mode === "standard"
              ? 0.9 * blobData.scale
              : 1.2 * blobData.scale
        }
        ior={mode === "leviathan" ? 1.55 : mode === "standard" ? 1.33 : 1.45}
        envMapIntensity={mode === "leviathan" ? 1.2 : mode === "standard" ? 1.0 : 0.8}
        emissive={getEmissiveColor()}
        emissiveIntensity={mode === "molten" || mode === "bioluminescent" || mode === "leviathan" ? 0.75 : 0}
        depthWrite={false} // Helps with transparency issues if they arise
      />
    </mesh>
  )
}

function CameraController() {
  const controlsRef = useRef<any>(null)
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.azimuthAngle += 0.00007
      controlsRef.current.update()
    }
  })
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={8}
      maxDistance={30}
      minPolarAngle={Math.PI / 9}
      maxPolarAngle={Math.PI - Math.PI / 9}
      autoRotate={false}
      enableDamping
      dampingFactor={0.007}
      rotateSpeed={0.15}
      zoomSpeed={0.3}
    />
  )
}

function EnhancedLavaLampScene({ mode = "standard" }: { mode?: BlobMode }) {
  const { viewport, clock } = useThree() // clock for initial creation time
  const currentConfig = BLOB_CONFIGURATIONS[mode]
  const originalCountForMode = ORIGINAL_COUNTS[mode]

  const [blobDataArray, setBlobDataArray] = useState<BlobData[]>(() => {
    const initialTime = clock.getElapsedTime() // Use current clock time for initial setup
    return Array.from({ length: currentConfig.count }, (_, i) => {
      const isInitial = i < originalCountForMode
      return createBlob(
        `blob-${i}-${mode}`,
        viewport,
        currentConfig,
        isInitial,
        isInitial ? i : i - originalCountForMode,
      )
    })
  })
  const allBlobsRef = useRef<BlobData[]>(blobDataArray)

  useEffect(() => {
    const newConfig = BLOB_CONFIGURATIONS[mode]
    const newOriginalCount = ORIGINAL_COUNTS[mode]
    const initialTime = clock.getElapsedTime()
    setBlobDataArray(
      Array.from({ length: newConfig.count }, (_, i) => {
        const isInitial = i < newOriginalCount
        return createBlob(`blob-${i}-${mode}`, viewport, newConfig, isInitial, isInitial ? i : i - newOriginalCount)
      }),
    )
  }, [mode, viewport, clock]) // Add clock to dependencies

  useEffect(() => {
    allBlobsRef.current = blobDataArray
  }, [blobDataArray])

  const updateBlob = useCallback((id: string, updates: Partial<BlobData>) => {
    setBlobDataArray((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now()
      const activeBlobs = allBlobsRef.current.filter((b) => b.isActive && b.hasAppeared).length
      let blobsToPotentiallyReactivate = currentConfig.count - activeBlobs

      allBlobsRef.current.forEach((blob) => {
        if (blob.isActive && blob.hasAppeared && now - blob.lastActiveTime > BLOB_MAX_INACTIVE_TIME) {
          updateBlob(blob.id, { isActive: false, targetOpacity: 0 }) // Fade out inactive blobs
          blobsToPotentiallyReactivate++
        } else if (!blob.isActive && blobsToPotentiallyReactivate > 0 && blob.opacity < 0.01) {
          // Reactivate a blob that has faded out
          const isInitial = allBlobsRef.current.findIndex((b) => b.id === blob.id) < ORIGINAL_COUNTS[mode]
          const newBlobState = createBlob(blob.id, viewport, currentConfig, isInitial, 0) // Reset its state
          updateBlob(blob.id, {
            ...newBlobState,
            isActive: true,
            lastActiveTime: now,
            opacity: 0,
            targetOpacity: 0,
            hasAppeared: false,
          }) // Target opacity 0, will be set by its own delay logic
          blobsToPotentiallyReactivate--
        }
      })

      // This logic for adding new blobs if pool is low might be redundant if count is fixed
      // but good for ensuring maxBlobsPool is respected if blobs are removed entirely.
      if (allBlobsRef.current.length < currentConfig.maxBlobsPool && activeBlobs < currentConfig.count) {
        const numToAdd = Math.min(
          currentConfig.count - allBlobsRef.current.length, // Consider total count vs current length
          currentConfig.maxBlobsPool - allBlobsRef.current.length,
        )
        const newBlobInstances: BlobData[] = []
        const currentLength = allBlobsRef.current.length
        for (let i = 0; i < numToAdd; i++) {
          // New blobs added this way are treated as "additional", so not initial
          newBlobInstances.push(createBlob(`blob-${currentLength + i}-${mode}`, viewport, currentConfig, false, i))
        }
        if (newBlobInstances.length > 0) {
          setBlobDataArray((prev) => [...prev, ...newBlobInstances])
        }
      }
    }, BLOB_RECHECK_INTERVAL)
    return () => clearInterval(intervalId)
  }, [viewport, updateBlob, currentConfig, mode]) // Added mode to dependencies

  const getEnvironmentPreset = () => {
    switch (mode) {
      case "molten":
        return "sunset"
      case "bioluminescent":
        return "forest"
      case "leviathan":
        return "night"
      case "swarm":
        return "dawn"
      default:
        return "city"
    }
  }

  const getLighting = () => {
    switch (mode) {
      case "standard":
        return (
          <>
            <ambientLight intensity={0.8} color="#FFF0E5" />
            <directionalLight position={[18, 22, 18]} intensity={1.8} color="#FFDAB9" castShadow />
            <pointLight position={[-15, -15, -15]} intensity={1.0} color="#FFA07A" />
          </>
        )
      case "molten":
        return (
          <>
            <ambientLight intensity={0.7} color="#FFF8DC" />
            <directionalLight position={[12, 6, 6]} intensity={2.2} color="#FFA500" castShadow />
            <pointLight position={[-10, -6, -6]} intensity={1.5} color="#FF8C00" />
          </>
        )
      case "bioluminescent":
        return (
          <>
            <ambientLight intensity={0.6} color="#AFEEEE" />
            <directionalLight position={[6, 12, 6]} intensity={1.5} color="#98FB98" castShadow />
            <pointLight position={[0, 0, 6]} intensity={1.8} color="#FFD700" distance={40} decay={1.4} />
          </>
        )
      case "leviathan":
        return (
          <>
            <ambientLight intensity={0.5} color="#FFC0CB" />
            <directionalLight position={[20, 25, 20]} intensity={1.2} color="#FF7F50" castShadow />
            <pointLight position={[-20, -15, -20]} intensity={0.8} color="#FF6347" />
          </>
        )
      default: // Swarm
        return (
          <>
            <ambientLight intensity={0.9} color="#FFF5EE" />
            <directionalLight position={[15, 20, 10]} intensity={2.0} color="#FFDEAD" castShadow />
            <pointLight position={[-15, -10, -15]} intensity={1.2} color="#FFB6C1" />
          </>
        )
    }
  }

  return (
    <>
      {getLighting()}
      <Environment preset={getEnvironmentPreset()} blur={mode === "standard" ? 0.35 : 0.3} />
      {blobDataArray.map(
        (
          blob, // No filter here, EnhancedLavaBlob handles its own visibility based on opacity and readiness
        ) => (
          <EnhancedLavaBlob
            key={blob.id}
            blobData={blob}
            allBlobs={allBlobsRef}
            onUpdateBlob={updateBlob}
            mode={mode}
          />
        ),
      )}
      <CameraController />
    </>
  )
}

interface EnhancedLavaLamp3DProps {
  mode?: BlobMode
  onCanvasCreated?: () => void
}

export default function EnhancedLavaLamp3D({ mode = "standard", onCanvasCreated }: EnhancedLavaLamp3DProps) {
  // The ClientRootLayout's isLavaLampReady state (set after 150ms) controls the overall fade-in.
  // The blobs themselves have an initialDelay (200ms for first batch, 5s for new ones)
  // and then lerp their opacity and scale.
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        key={mode} // Re-keying Canvas on mode change ensures a fresh start for the scene
        camera={{ position: [0, 0, 25], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]} // Adjusted DPR for performance/quality balance
        shadows
        onCreated={({ gl, scene }) => {
          // scene also available if needed
          // You can configure the renderer here if needed, e.g., tone mapping
          // gl.toneMapping = THREE.ACESFilmicToneMapping;
          // gl.toneMappingExposure = 1.0;
          if (onCanvasCreated) {
            onCanvasCreated()
          }
        }}
      >
        <EnhancedLavaLampScene mode={mode} />
      </Canvas>
    </div>
  )
}
