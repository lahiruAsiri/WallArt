"use client"

import type React from "react"

import { Suspense, useState, useRef } from "react"
import { Interactive, XR, ARButton, Controllers, useHitTest, useXR } from "@react-three/xr"
import { useTexture, Html } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"
import "./styles.css"

function WallArt({ position, scale = 1, rotation = [0, 0, 0], imageUrl, ...rest }: any) {
  const [hover, setHover] = useState(false)
  const texture = useTexture(imageUrl)
  const meshRef = useRef<THREE.Mesh>(null)

  // Calculate aspect ratio to maintain image proportions
  const aspect = texture && "image" in texture && texture.image ? texture.image.width / texture.image.height : 1
  const width = 1 * scale
  const height = (1 / aspect) * scale

  return (
    <Interactive onHover={() => setHover(true)} onBlur={() => setHover(false)}>
      <mesh
        ref={meshRef}
        scale={hover ? [1.05, 1.05, 1.05] : [1, 1, 1]}
        position={position}
        rotation={rotation}
        {...rest}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture instanceof THREE.Texture ? texture : undefined} transparent={true} />
      </mesh>
    </Interactive>
  )
}

function Button({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "primary",
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  disabled?: boolean
  variant?: "primary" | "secondary" | "outline"
}) {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer border-none"
  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50",
  }

  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number.parseFloat(e.target.value))}
      className={`slider ${className}`}
    />
  )
}

function ARPlacementSystem() {
  const [arState, setArState] = useState<"detecting" | "ready-to-place" | "placed">("detecting")
  const [wallArtPosition, setWallArtPosition] = useState<[number, number, number]>([0, 1, -1])
  const [wallArtScale, setWallArtScale] = useState(1)
  const [wallArtRotation, setWallArtRotation] = useState<[number, number, number]>([0, 0, 0])
  const [showControls, setShowControls] = useState(false)

  const { isPresenting } = useXR()

  // Hit test for wall detection
  useHitTest((hitMatrix, hit) => {
    if (arState === "detecting" || arState === "ready-to-place") {
      const position = new THREE.Vector3()
      position.setFromMatrixPosition(hitMatrix)

      // Check if we're pointing at a vertical surface (wall)
      const normal = new THREE.Vector3(0, 0, 1)
      normal.applyMatrix4(hitMatrix)

      if (Math.abs(normal.y) < 0.5) {
        // Vertical surface detected
        setArState("ready-to-place")
        setWallArtPosition([position.x, position.y, position.z])
      }
    }
  })

  const placeWallArt = () => {
    if (arState === "ready-to-place") {
      setArState("placed")
      setShowControls(true)
    }
  }

  const resetPlacement = () => {
    setArState("detecting")
    setShowControls(false)
    setWallArtScale(1)
    setWallArtRotation([0, 0, 0])
  }

  const moveArt = (direction: string) => {
    const step = 0.1
    const [x, y, z] = wallArtPosition

    switch (direction) {
      case "left":
        setWallArtPosition([x - step, y, z])
        break
      case "right":
        setWallArtPosition([x + step, y, z])
        break
      case "up":
        setWallArtPosition([x, y + step, z])
        break
      case "down":
        setWallArtPosition([x, y - step, z])
        break
    }
  }

  const rotateArt = (direction: string) => {
    const step = 0.1
    const [rx, ry, rz] = wallArtRotation

    if (direction === "left") {
      setWallArtRotation([rx, ry, rz - step])
    } else {
      setWallArtRotation([rx, ry, rz + step])
    }
  }

  return (
    <>
      {/* AR Status Messages */}
      {isPresenting && (
        <Html position={[0, 2, -1]} center>
          <div className="ar-message">
            {arState === "detecting" && <p className="message-text">Point your camera at a wall</p>}
            {arState === "ready-to-place" && (
              <div className="place-container">
                <p className="message-text">Wall detected! Tap to place wall art</p>
                <Button onClick={placeWallArt} className="place-button">
                  Place Wall Art
                </Button>
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Wall Art */}
      {(arState === "ready-to-place" || arState === "placed") && (
        <WallArt position={wallArtPosition} scale={wallArtScale} rotation={wallArtRotation} imageUrl="/wall-art.png" />
      )}

      {/* Control Panel */}
      {showControls && arState === "placed" && (
        <Html position={[wallArtPosition[0], wallArtPosition[1] - 1, wallArtPosition[2] + 0.1]} center>
          <div className="control-panel">
            <div className="control-header">
              <h3>Wall Art Controls</h3>
              <Button variant="outline" onClick={() => setShowControls(false)} className="close-btn">
                ✕
              </Button>
            </div>

            {/* Size Control */}
            <div className="control-section">
              <label className="control-label">Size</label>
              <div className="slider-container">
                <span className="slider-label">0.5x</span>
                <Slider
                  value={wallArtScale}
                  onChange={setWallArtScale}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="size-slider"
                />
                <span className="slider-label">3x</span>
              </div>
              <p className="scale-display">Scale: {wallArtScale.toFixed(1)}x</p>
            </div>

            {/* Position Controls */}
            <div className="control-section">
              <label className="control-label">Position</label>
              <div className="position-grid">
                <Button variant="outline" onClick={() => moveArt("left")} className="pos-btn">
                  ← Left
                </Button>
                <Button variant="outline" onClick={() => moveArt("right")} className="pos-btn">
                  Right →
                </Button>
                <Button variant="outline" onClick={() => moveArt("up")} className="pos-btn">
                  ↑ Up
                </Button>
                <Button variant="outline" onClick={() => moveArt("down")} className="pos-btn">
                  ↓ Down
                </Button>
              </div>
            </div>

            {/* Rotation Control */}
            <div className="control-section">
              <label className="control-label">Rotation</label>
              <div className="rotation-controls">
                <Button variant="outline" onClick={() => rotateArt("left")} className="rot-btn">
                  ↺ Left
                </Button>
                <Button variant="outline" onClick={() => rotateArt("right")} className="rot-btn">
                  ↻ Right
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <Button variant="outline" onClick={resetPlacement} className="action-btn">
                Reset
              </Button>
              <Button onClick={() => setShowControls(false)} className="action-btn">
                Done
              </Button>
            </div>
          </div>
        </Html>
      )}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      {/* Controllers */}
      <Controllers />
    </>
  )
}

export function App() {
  return (
    <div className="app-container">
      {/* Instructions for non-AR users */}
      <div className="instructions-panel">
        <div className="instructions-card">
          <h2>AR Wall Art Placement</h2>
          <p className="instructions-text">
            Click "Enter AR" to start placing wall art on your walls using augmented reality.
          </p>
          <div className="instructions-list">
            <p>• Point your camera at a wall</p>
            <p>• Tap to place the artwork</p>
            <p>• Use controls to adjust size and position</p>
          </div>
        </div>
      </div>

      <ARButton />
      <Canvas>
        <XR referenceSpace="local">
          <Suspense fallback={null}>
            <ARPlacementSystem />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  )
}
