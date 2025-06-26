"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Interactive, useXR } from "@react-three/xr"
import * as THREE from "three"

interface PlacementReticleProps {
  onPlace: (position: [number, number, number]) => void
}

export function PlacementReticle({ onPlace }: PlacementReticleProps) {
  const reticleRef = useRef<THREE.Mesh>(null)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0])
  const [hitTestSource, setHitTestSource] = useState<XRHitTestSource | null>(null)
  const [hitTestSourceRequested, setHitTestSourceRequested] = useState(false)
  const [fallbackMode, setFallbackMode] = useState(false)

  const { gl } = useThree()
  const { session } = useXR()

  // Initialize hit test source
  useEffect(() => {
    if (session && !hitTestSourceRequested) {
      setHitTestSourceRequested(true)

      // Check if hit testing is supported
      if (!session.requestHitTestSource) {
        console.warn("Hit testing not supported, using fallback mode")
        setFallbackMode(true)
        setVisible(true)
        setPosition([0, -0.5, -1.5])
        return
      }

      session
        .requestReferenceSpace("viewer")
        .then((referenceSpace) => {
          // Type-safe check for requestHitTestSource
          if (session.requestHitTestSource) {
            return session.requestHitTestSource({ space: referenceSpace })
          } else {
            throw new Error("Hit test source not available")
          }
        })
        .then((source) => {
          // Additional null check for the returned source
          if (source) {
            setHitTestSource(source)
            console.log("Hit test source initialized successfully")
          } else {
            throw new Error("Hit test source returned null")
          }
        })
        .catch((err) => {
          console.warn("Hit test initialization failed:", err)
          // Enable fallback mode
          setFallbackMode(true)
          setVisible(true)
          setPosition([0, -0.5, -1.5])
        })
    }
  }, [session, hitTestSourceRequested])

  useFrame((state, delta, frame) => {
    if (fallbackMode) {
      // Fallback animation when no hit testing
      if (reticleRef.current && visible) {
        const time = state.clock.getElapsedTime()
        reticleRef.current.rotation.z = time * 0.5

        // Simulate moving reticle
        const newPosition: [number, number, number] = [
          Math.sin(time * 0.3) * 0.2,
          -0.5,
          -1.5 + Math.cos(time * 0.2) * 0.1,
        ]
        setPosition(newPosition)
      }
      return
    }

    if (!frame || !hitTestSource || !session) {
      return
    }

    // Get hit test results
    const referenceSpace = gl.xr.getReferenceSpace()
    if (referenceSpace) {
      try {
        const hitTestResults = frame.getHitTestResults(hitTestSource)

        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0]
          const pose = hit.getPose(referenceSpace)

          if (pose) {
            const matrix = new THREE.Matrix4().fromArray(pose.transform.matrix)
            const newPosition = new THREE.Vector3().setFromMatrixPosition(matrix)

            setPosition([newPosition.x, newPosition.y, newPosition.z])
            setVisible(true)

            if (reticleRef.current) {
              reticleRef.current.matrix.fromArray(pose.transform.matrix)
              reticleRef.current.matrix.decompose(
                reticleRef.current.position,
                reticleRef.current.quaternion,
                reticleRef.current.scale,
              )
            }
          }
        } else {
          setVisible(false)
        }
      } catch (error) {
        console.warn("Hit test frame error:", error)
        // Don't hide reticle immediately, just log the error
      }
    }
  })

  const handleSelect = () => {
    if (visible) {
      onPlace(position)
    }
  }

  if (!visible) return null

  return (
    <Interactive onSelect={handleSelect}>
      <mesh ref={reticleRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color={fallbackMode ? "#ffc107" : "#007bff"} transparent opacity={0.7} />
      </mesh>
    </Interactive>
  )
}
