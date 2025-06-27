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
  const [scale, setScale] = useState(1)
  const texture = useTexture(imageUrl) as THREE.Texture
  const meshRef = useRef<any>(null)
  const lastControllerPos = useRef({ x: 0, y: 0, z: 0 })
  const pinchStartDistance = useRef<number | null>(null)

  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const width = 1
  const height = width / aspect
  const frameScale = 1.1

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

  const handleSelectEnd = () => {
    console.log("Select End")
    setIsDragging(false)
  }

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

  const handleSqueezeEnd = () => {
    console.log("Squeeze End")
    setIsPinching(false)
    pinchStartDistance.current = null
  }

  const handleMove = (event: any) => {
    if (isPinching && event.controllers?.length === 2) {
      const [controller1, controller2] = event.controllers
      const dx = controller1.position.x - controller2.position.x
      const dy = controller1.position.y - controller2.position.y
      const dz = controller1.position.z - controller2.position.z
      const currentDistance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (pinchStartDistance.current !== null) {
        const scaleChange = currentDistance / pinchStartDistance.current
        const newScale = Math.max(0.5, Math.min(2, scale * scaleChange))
        setScale(newScale)
        pinchStartDistance.current = currentDistance
      }
    } else if (isDragging && event.controller?.position) {
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
    >
      <group
        ref={meshRef}
        key={`${position.x}-${position.y}-${position.z}-${rotation.x}-${rotation.y}-${rotation.z}-${scale}`}
        scale={hover ? [1.1 * scale, 1.1 * scale, 1.1 * scale] : [scale, scale, scale]}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        {...rest}
      >
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[width * frameScale, height * frameScale]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
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

  return <></>
}

export function App() {
  const [position, setPosition] = useState({ x: 0, y: 1, z: -2.5 })
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [arSupported, setArSupported] = useState(false)

  // Check WebXR support
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
        setArSupported(supported)
        if (!supported) {
          console.error("Immersive AR is not supported on this device/browser.")
        }
      }).catch((err) => {
        console.error("Error checking WebXR support:", err)
      })
    } else {
      console.error("WebXR API is not available.")
    }
  }, [])

  // Ensure button visibility during XR session
  useEffect(() => {
    const button = document.querySelector('button[data-xr-ui]') as HTMLElement | null
    if (button) {
      button.style.transform = 'translateX(-50%) scale(1)'
      button.style.display = 'block'
      button.style.visibility = 'visible'
    }
  }, [arSupported])

  // Reset button transform on XR session start/end
  useEffect(() => {
    const handleXRSession = () => {
      const button = document.querySelector('button[data-xr-ui]') as HTMLElement | null
      if (button) {
        button.style.transform = 'translateX(-50%) scale(1)'
        button.style.position = 'fixed'
        button.style.zIndex = '1000'
        button.style.display = 'block'
        button.style.visibility = 'visible'
      }
    }

    if (navigator.xr) {
      navigator.xr.addEventListener('sessionstart', handleXRSession)
      navigator.xr.addEventListener('sessionend', handleXRSession)
    }

    return () => {
      if (navigator.xr) {
        navigator.xr.removeEventListener('sessionstart', handleXRSession)
        navigator.xr.removeEventListener('sessionend', handleXRSession)
      }
    }
  }, [])

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Canvas
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
        camera={{ manual: true }}
      >
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
      {arSupported ? (
        <ARButton
          className="ar-button"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            transformOrigin: "center",
            display: "block",
            visibility: "visible",
            padding: "10px 20px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
          }}
        />
      ) : (
        <button
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "10px 20px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            display: "block",
            visibility: "visible",
          }}
          onClick={() => alert("AR is not supported on this device/browser.")}
        >
          AR Not Supported
        </button>
      )}
      <ControlPanel
        position={position}
        rotation={rotation}
        onPositionChange={(newPos: { x: number; y: number; z: number }) => setPosition({ ...newPos })}
        onRotationChange={(newRot: { x: number; y: number; z: number }) => setRotation({ ...newRot })}
      />
    </div>
  )
}