"use client"

import { useRef, useEffect } from "react"
import { Interactive } from "@react-three/xr"
import { useWallArt } from "../context/WallArtContext"
import * as THREE from "three"

interface WallArtProps {
  position: [number, number, number]
}

export function WallArt({ position }: WallArtProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { currentTexture, controls, isSelected, setIsSelected } = useWallArt()

  // Create a simple colored texture as fallback
  const createFallbackTexture = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")!

    // Create a gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 512)
    gradient.addColorStop(0, "#007bff")
    gradient.addColorStop(1, "#0056b3")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    // Add text
    ctx.fillStyle = "white"
    ctx.font = "48px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Sample Art", 256, 256)

    return new THREE.CanvasTexture(canvas)
  }

  const fallbackTexture = createFallbackTexture()
  const texture = currentTexture || fallbackTexture

  useEffect(() => {
    if (groupRef.current) {
      // Apply transformations
      groupRef.current.scale.setScalar(controls.size)
      groupRef.current.position.set(position[0], position[1] + controls.height, position[2])
      groupRef.current.rotation.x = THREE.MathUtils.degToRad(controls.rotationX)
      groupRef.current.rotation.y = THREE.MathUtils.degToRad(controls.rotationY)
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(controls.rotationZ)
    }
  }, [controls, position])

  const handleSelect = () => {
    setIsSelected(!isSelected)
  }

  const handleHover = () => {
    if (groupRef.current) {
      groupRef.current.scale.multiplyScalar(1.05)
    }
  }

  const handleBlur = () => {
    if (groupRef.current) {
      groupRef.current.scale.setScalar(controls.size)
    }
  }

  return (
    <Interactive onSelect={handleSelect} onHover={handleHover} onBlur={handleBlur}>
      <group ref={groupRef} position={position}>
        {/* Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.1, 1.4, 0.05]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>

        {/* Wall Art Plane */}
        <mesh position={[0, 0, 0.026]} castShadow>
          <planeGeometry args={[1, 1.3]} />
          <meshLambertMaterial map={texture} transparent />
        </mesh>

        {/* Shadow */}
        <mesh position={[0, -0.7, 0.01]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1.5]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </mesh>

        {/* Selection Indicator */}
        {isSelected && (
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[1.2, 1.5, 0.02]} />
            <meshBasicMaterial color="#007bff" transparent opacity={0.2} />
          </mesh>
        )}
      </group>
    </Interactive>
  )
}
