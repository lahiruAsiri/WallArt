"use client"

import { useRef, useEffect } from "react"
import { useTexture, Box, Plane } from "@react-three/drei"
import { Interactive } from "@react-three/xr"
import { useWallArt } from "../context/WallArtContext"
import * as THREE from "three"

interface WallArtProps {
  position: [number, number, number]
}

export function WallArt({ position }: WallArtProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { currentTexture, controls, isSelected, setIsSelected, updateControls } = useWallArt()

  // Load default texture
  const defaultTexture = useTexture("/placeholder.svg?height=400&width=300")
  const texture = currentTexture || defaultTexture

  useEffect(() => {
    if (groupRef.current) {
      // Apply transformations
      groupRef.current.scale.setScalar(controls.size)
      groupRef.current.position.y = position[1] + controls.height
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
        <Box args={[1.1, 1.4, 0.05]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshLambertMaterial color="#8B4513" />
        </Box>

        {/* Wall Art Plane */}
        <Plane args={[1, 1.3]} position={[0, 0, 0.026]} castShadow>
          <meshLambertMaterial map={texture} transparent />
        </Plane>

        {/* Shadow */}
        <Plane args={[1.2, 1.5]} position={[0, -0.7, 0.01]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </Plane>

        {/* Selection Indicator */}
        {isSelected && (
          <Box args={[1.2, 1.5, 0.02]} position={[0, 0, -0.01]}>
            <meshBasicMaterial color="#007bff" transparent opacity={0.2} />
          </Box>
        )}
      </group>
    </Interactive>
  )
}
