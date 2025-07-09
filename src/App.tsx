"use client"

import { useState, useRef, useEffect } from "react"
import { Interactive, XR, ARButton, Controllers } from "@react-three/xr"
import { useTexture } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import "./styles.css"
import type * as THREE from "three"

function WallArt({ position, rotation, imageUrl, onPositionChange, onRotationChange, ...rest }: any) {
  const [hover, setHover] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isPinching, setIsPinching] = useState(false)
  const [scale, setScale] = useState(1) // Add scale state for zooming
  const texture = useTexture(imageUrl) as THREE.Texture
  const meshRef = useRef<any>(null)
  const lastControllerPos = useRef({ x: 0, y: 0, z: 0 })
  const pinchStartDistance = useRef<number | null>(null)

  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const width = 1
  const height = width / aspect
  const frameThickness = 0.1
  const frameScale = 1.1

  // Handle drag start
  const handleSelectStart = (event: any) => {
    console.log("Select Start:", event.controller)
    setIsDragging(true)
    if (event.controller?.position) {
      lastControllerPos.current = {
        x: event.controller.position.x,
        y: event.controller.position.y,
        z: event.controller.position.z,
      }
    }
  }

  // Handle drag end
  const handleSelectEnd = () => {
    console.log("Select End")
    setIsDragging(false)
  }

  // Handle drag movement
  const handleMove = (event: any) => {
    if (isDragging && event.controller?.position) {
      console.log("Controller Move:", event.controller.position)
      const controllerPos = event.controller.position
      const delta = {
        x: controllerPos.x - lastControllerPos.current.x,
        y: controllerPos.y - lastControllerPos.current.y,
        z: controllerPos.z - lastControllerPos.current.z,
      }

      const newPosition = {
        x: position.x + delta.x * 0.5,
        y: position.y + delta.y * 0.5,
        z: position.z + delta.z * 0.5,
      }
      onPositionChange(newPosition)

      const newRotation = {
        x: rotation.x + delta.y * 0.5,
        y: rotation.y + delta.x * 0.5,
        z: rotation.z,
      }
      onRotationChange(newRotation)

      lastControllerPos.current = {
        x: controllerPos.x,
        y: controllerPos.y,
        z: controllerPos.z,
      }
    }
  }

  // Handle pinch start (for zooming)
  const handleSqueezeStart = (event: any) => {
    console.log("Squeeze Start:", event.controllers)
    if (event.controllers?.length === 2) {
      setIsPinching(true)
      const [controller1, controller2] = event.controllers
      const dx = controller1.position.x - controller2.position.x
      const dy = controller1.position.y - controller2.position.y
      const dz = controller1.position.z - controller2.position.z
      pinchStartDistance.current = Math.sqrt(dx * dx + dy * dy + dz * dz)
    }
  }

  // Handle pinch end
  const handleSqueezeEnd = () => {
    console.log("Squeeze End")
    setIsPinching(false)
    pinchStartDistance.current = null
  }

  // Handle pinch movement (for zooming)
  const handleSqueezeMove = (event: any) => {
    if (isPinching && event.controllers?.length === 2) {
      const [controller1, controller2] = event.controllers
      const dx = controller1.position.x - controller2.position.x
      const dy = controller1.position.y - controller2.position.y
      const dz = controller1.position.z - controller2.position.z
      const currentDistance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (pinchStartDistance.current !== null) {
        const scaleChange = currentDistance / pinchStartDistance.current
        const newScale = Math.max(0.5, Math.min(2, scale * scaleChange)) // Limit scale between 0.5 and 2
        setScale(newScale)
        pinchStartDistance.current = currentDistance
      }
    }
  }

  useEffect(() => {
    console.log("WallArt Updated - Position:", position, "Rotation:", rotation, "Scale:", scale)
  }, [position, rotation, scale])

  return (
    <Interactive
      onHover={() => setHover(true)}
      onBlur={() => setHover(false)}
      onSelectStart={handleSelectStart}
      onSelectEnd={handleSelectEnd}
      onMove={handleMove}
      onSqueezeStart={handleSqueezeStart}
      onSqueezeEnd={handleSqueezeEnd}
      onSqueeze={handleSqueezeMove}
    >
      <group
        ref={meshRef}
        key={`${position.x}-${position.y}-${position.z}-${rotation.x}-${rotation.y}-${rotation.z}-${scale}`}
        scale={hover ? [1.1 * scale, 1.1 * scale, 1.1 * scale] : [scale, scale, scale]}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        {...rest}
      >
        {/* Frame plane */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[width * frameScale, height * frameScale]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Image plane */}
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial map={texture} transparent={true} />
        </mesh>
      </group>
    </Interactive>
  )
}

function ControlPanel({ position, rotation, onPositionChange, onRotationChange }: any) {
  const [isMinimized, setIsMinimized] = useState(false)

  const handlePositionChange = (axis: "x" | "y" | "z", value: number) => {
    const newPosition = { ...position, [axis]: value }
    console.log("Slider Position Update:", newPosition)
    onPositionChange(newPosition)
  }

  const handleRotationChange = (axis: "x" | "y" | "z", value: number) => {
    const newRotation = { ...rotation, [axis]: (value * Math.PI) / 180 }
    console.log("Slider Rotation Update:", newRotation)
    onRotationChange(newRotation)
  }

  return <></> // Empty for now, as per original code
}

export function App() {
  const [position, setPosition] = useState({ x: 0, y: 1, z: -2.5 })
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [imageUrl, setImageUrl] = useState("/wall-art.png")

  useEffect(() => {
    // Extract imageUrl from query parameters
    const params = new URLSearchParams(window.location.search)
    const urlImage = params.get("imageUrl")
    if (urlImage) {
      try {
        setImageUrl(urlImage)
      } catch (error) {
        console.error("Error decoding image URL:", error)
        // Fallback to default image if decoding fails
        setImageUrl("/wall-art.png")
      }
    } else {
      console.warn("No imageUrl provided in query parameters, using default")
    }
  }, [])


  useEffect(() => {
    console.log("App State Updated - Position:", position, "Rotation:", rotation)
  }, [position, rotation])

  return (
    <>
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Ensure ARButton is outside Canvas and has high z-index */}
     
      <Canvas
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      >
        <XR referenceSpace="local">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <WallArt
            position={position}
            rotation={rotation}
            imageUrl={imageUrl}
            onPositionChange={(newPos: { x: number; y: number; z: number }) => setPosition({ ...newPos })}
            onRotationChange={(newRot: { x: number; y: number; z: number }) => setRotation({ ...newRot })}
          />
          <Controllers />
        </XR>
      </Canvas>
      <ControlPanel
        position={position}
        rotation={rotation}
        onPositionChange={(newPos: { x: number; y: number; z: number }) => setPosition({ ...newPos })}
        onRotationChange={(newRot: { x: number; y: number; z: number }) => setRotation({ ...newRot })}
      />
    </div>
    <div>
       <ARButton
        className="ar-button"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000, // High z-index to stay above Canvas
        }}
      />
    </div>
    </>
  )
}