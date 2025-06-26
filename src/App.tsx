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
  const texture = useTexture(imageUrl) as THREE.Texture
  const meshRef = useRef<any>(null)
  const lastControllerPos = useRef({ x: 0, y: 0, z: 0 })

  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const width = 1
  const height = width / aspect

  const handleSelectStart = (event: any) => {
    console.log("Select Start:", event.controller) // Debug controller
    setIsDragging(true)
    if (event.controller?.position) {
      lastControllerPos.current = {
        x: event.controller.position.x,
        y: event.controller.position.y,
        z: event.controller.position.z,
      }
    }
  }

  const handleSelectEnd = () => {
    console.log("Select End") // Debug
    setIsDragging(false)
  }

  const handleMove = (event: any) => {
    if (isDragging && event.controller?.position) {
      console.log("Controller Move:", event.controller.position) // Debug
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
    } else if (isDragging) {
      console.warn("No controller position data") // Debug fallback
    }
  }

  useEffect(() => {
    console.log("WallArt Updated - Position:", position, "Rotation:", rotation) // Debug
  }, [position, rotation])

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
        key={`${position.x}-${position.y}-${position.z}-${rotation.x}-${rotation.y}-${rotation.z}`}
        scale={hover ? [1.1, 1.1, 1.1] : [1, 1, 1]}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        {...rest}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} transparent={true} />
      </mesh>
    </Interactive>
  )
}

function ControlPanel({ position, rotation, onPositionChange, onRotationChange }: any) {
  const [isMinimized, setIsMinimized] = useState(false)

  const handlePositionChange = (axis: "x" | "y" | "z", value: number) => {
    const newPosition = { ...position, [axis]: value }
    console.log("Slider Position Update:", newPosition) // Debug
    onPositionChange(newPosition)
  }

  const handleRotationChange = (axis: "x" | "y" | "z", value: number) => {
    const newRotation = { ...rotation, [axis]: (value * Math.PI) / 180 }
    console.log("Slider Rotation Update:", newRotation) // Debug
    onRotationChange(newRotation)
  }

  return (
  <></>
  )
}

export function App() {
  const [position, setPosition] = useState({ x: 0, y: 0, z: -2.5 })
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    console.log("App State Updated - Position:", position, "Rotation:", rotation) // Debug
  }, [position, rotation])

  return (
    <>
      <ARButton />
      <Canvas>
        <XR referenceSpace="local">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <WallArt
            position={position}
            rotation={rotation}
            imageUrl="/wall-art.png"
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
    </>
  )
}

