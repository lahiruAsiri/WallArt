"use client"

import { useState, useRef, useEffect } from "react"
import { Interactive, XR, ARButton, Controllers, useHitTest } from "@react-three/xr"
import { useTexture } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"
import "./styles.css"

//
// 🟢 WallArt component
//
function WallArt({ position, rotation, imageUrl, scale, onPositionChange, onRotationChange, onScaleChange }: any) {
  const [hover, setHover] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const texture = useTexture(imageUrl) as THREE.Texture
  const meshRef = useRef<any>(null)
  const lastControllerPos = useRef<THREE.Vector3 | null>(null)

  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const width = 1 * scale
  const height = width / aspect

  // Controller-based move/rotate
  const handleSelectStart = (event: any) => {
    setIsDragging(true)
    lastControllerPos.current = event.controller?.position.clone() ?? null
  }

  const handleSelectEnd = () => {
    setIsDragging(false)
  }

  const handleMove = (event: any) => {
    if (isDragging && event.controller?.position && lastControllerPos.current) {
      const currentPos = event.controller.position
      const delta = currentPos.clone().sub(lastControllerPos.current)

      const newPosition = {
        x: position.x + delta.x * 0.5,
        y: position.y + delta.y * 0.5,
        z: position.z + delta.z * 0.5,
      }
      onPositionChange(newPosition)

      const newRotation = {
        x: rotation.x + delta.y * 0.2,
        y: rotation.y + delta.x * 0.2,
        z: rotation.z,
      }
      onRotationChange(newRotation)

      lastControllerPos.current = currentPos.clone()
    }
  }

  return (
    <Interactive
      onHover={() => setHover(true)}
      onBlur={() => setHover(false)}
      onSelectStart={handleSelectStart}
      onSelectEnd={handleSelectEnd}
      onMove={handleMove}
    >
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        scale={hover ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} transparent />
      </mesh>
    </Interactive>
  )
}

//
// 🟢 PlacementIndicator component
//
function PlacementIndicator({ matrix }: { matrix: THREE.Matrix4 }) {
  return (
    <mesh matrix={matrix} scale={[1, 1, 0.01]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="green" opacity={0.5} transparent />
    </mesh>
  )
}

//
// 🟢 HitTestHandler component
//
function HitTestHandler({
  isPlaced,
  setPlacementPose
}: {
  isPlaced: boolean
  setPlacementPose: (m: THREE.Matrix4) => void
}) {
  useHitTest((hitMatrix) => {
    if (!isPlaced && hitMatrix) {
      setPlacementPose(hitMatrix)
    }
  })
  return null
}


//
// 🟢 ControlPanel component
//
function ControlPanel({ position, rotation, scale, onPositionChange, onRotationChange, onScaleChange }: any) {
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <div className={`control-panel ${isMinimized ? 'minimized' : ''}`}>
      <button onClick={() => setIsMinimized(!isMinimized)}>
        {isMinimized ? "Show Controls" : "Hide Controls"}
      </button>
      {!isMinimized && (
        <div>
          <h4>Position</h4>
          {["x", "y", "z"].map((axis) => (
            <div key={axis}>
              {axis}: <input
                type="range"
                min={-5}
                max={5}
                step={0.01}
                value={position[axis]}
                onChange={(e) => onPositionChange({ ...position, [axis]: parseFloat(e.target.value) })}
              />
            </div>
          ))}
          <h4>Rotation (degrees)</h4>
          {["x", "y", "z"].map((axis) => (
            <div key={axis}>
              {axis}: <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={(rotation[axis] * 180 / Math.PI).toFixed(0)}
                onChange={(e) => onRotationChange({ ...rotation, [axis]: (parseFloat(e.target.value) * Math.PI) / 180 })}
              />
            </div>
          ))}
          <h4>Scale</h4>
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.01}
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          />
        </div>
      )}
    </div>
  )
}

//
// 🟢 Main App component
//
export function App() {
  const [isPlaced, setIsPlaced] = useState(false)
  const [placementPose, setPlacementPose] = useState<THREE.Matrix4 | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 1, z: -2.5 })
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [scale, setScale] = useState(1)

  useEffect(() => {
    console.log("Position:", position, "Rotation:", rotation, "Scale:", scale)
  }, [position, rotation, scale])

  return (
    <>
      <ARButton sessionInit={{ requiredFeatures: ['hit-test'] }} />
      <Canvas>
        <XR referenceSpace="local">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
  
          <HitTestHandler isPlaced={isPlaced} setPlacementPose={setPlacementPose} />
  
          {!isPlaced && placementPose && (
            <PlacementIndicator matrix={placementPose} />
          )}
  
          <Interactive
            onSelect={() => {
              if (!isPlaced && placementPose) {
                const pos = new THREE.Vector3()
                const quat = new THREE.Quaternion()
                const scl = new THREE.Vector3()
                placementPose.decompose(pos, quat, scl)
                setPosition({ x: pos.x, y: pos.y, z: pos.z })
                const euler = new THREE.Euler().setFromQuaternion(quat)
                setRotation({ x: euler.x, y: euler.y, z: euler.z })
                setIsPlaced(true)
              }
            }}
          >
            {isPlaced && (
              <WallArt
                position={position}
                rotation={rotation}
                scale={scale}
                imageUrl="/wall-art.png"
                onPositionChange={setPosition}
                onRotationChange={setRotation}
                onScaleChange={setScale}
              />
            )}
          </Interactive>
  
          <Controllers />
        </XR>
      </Canvas>
  
      {isPlaced && (
        <ControlPanel
          position={position}
          rotation={rotation}
          scale={scale}
          onPositionChange={setPosition}
          onRotationChange={setRotation}
          onScaleChange={setScale}
        />
      )}
  
      {/* NEW MESSAGE */}
      {!isPlaced && placementPose && (
        <div className="ar-instruction">
          Wall detected! Tap to place your art.
        </div>
      )}
    </>
  )
}  