"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Interactive } from "@react-three/xr"
import type * as THREE from "three"

interface PlacementReticleProps {
  onPlace: (position: [number, number, number]) => void
}

export function PlacementReticle({ onPlace }: PlacementReticleProps) {
  const reticleRef = useRef<THREE.Mesh>(null)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0])

  useFrame((state) => {
    // In a real implementation, you would use hit testing here
    // For now, we'll simulate surface detection
    if (reticleRef.current) {
      const time = state.clock.getElapsedTime()
      reticleRef.current.rotation.z = time * 0.5

      // Simulate hit test results
      const simulatedPosition: [number, number, number] = [
        Math.sin(time * 0.1) * 0.1,
        -0.5,
        -1.5 + Math.cos(time * 0.1) * 0.1,
      ]

      setPosition(simulatedPosition)
      setVisible(true)
    }
  })

  const handleSelect = () => {
    onPlace(position)
  }

  if (!visible) return null

  return (
    <Interactive onSelect={handleSelect}>
      <mesh ref={reticleRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color="#007bff" transparent opacity={0.7} />
      </mesh>
    </Interactive>
  )
}
