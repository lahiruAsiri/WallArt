"use client"

import { useState, useRef, useEffect } from "react"
import { Interactive, XR, ARButton, Controllers } from "@react-three/xr"
import { useTexture } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import "./styles.css"
import * as THREE from "three"


function WallArt({ position, rotation, imageUrl, onPositionChange, onRotationChange, onScaleChange, ...rest }: any) {
  const [hover, setHover] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const texture = useTexture(imageUrl) as THREE.Texture
  const meshRef = useRef<any>(null)
  const lastControllerPos = useRef({ x: 0, y: 0, z: 0 })
  const lastControllerRot = useRef({ x: 0, y: 0, z: 0 })
  const lastPinchDistance = useRef(0)
  const [scale, setScale] = useState(1)

  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const baseWidth = 0.5
  const baseHeight = baseWidth / aspect

  const handleSelectStart = (event: any) => {
    setIsDragging(true)
    if (event.controller?.position) {
      lastControllerPos.current = {
        x: event.controller.position.x,
        y: event.controller.position.y,
        z: event.controller.position.z,
      }
      lastControllerRot.current = {
        x: event.controller.rotation.x,
        y: event.controller.rotation.y,
        z: event.controller.rotation.z,
      }
    }
  }

  const handleSelectEnd = () => {
    setIsDragging(false)
  }

  const handleMove = (event: any) => {
    if (isDragging && event.controller?.position && event.controller?.rotation) {
      const controllerPos = event.controller.position
      const controllerRot = event.controller.rotation
      
      // Position movement
      const deltaPos = {
        x: controllerPos.x - lastControllerPos.current.x,
        y: controllerPos.y - lastControllerPos.current.y,
        z: controllerPos.z - lastControllerPos.current.z,
      }

      // Update position (only x and y to keep it on the wall)
      const newPosition = {
        x: position.x + deltaPos.x * 1.5, // Increased sensitivity
        y: position.y + deltaPos.y * 1.5,
        z: position.z, // Keep z position fixed to stay on wall
      }
      onPositionChange(newPosition)

      // Rotation movement
      const deltaRot = {
        y: controllerRot.y - lastControllerRot.current.y,
      }

      // Update rotation (only y-axis for wall alignment)
      const newRotation = {
        x: 0, // Lock x rotation to keep flat on wall
        y: rotation.y + deltaRot.y * 3, // More sensitive rotation
        z: 0, // Lock z rotation
      }
      onRotationChange(newRotation)

      lastControllerPos.current = {
        x: controllerPos.x,
        y: controllerPos.y,
        z: controllerPos.z,
      }
      lastControllerRot.current = {
        x: controllerRot.x,
        y: controllerRot.y,
        z: controllerRot.z,
      }
    }
  }

  const handleSqueeze = (event: any) => {
    if (event.controller?.hand) {
      const hand = event.controller.hand
      const thumbTip = hand.joints['thumb-tip']
      const indexTip = hand.joints['index-finger-tip']
      
      if (thumbTip && indexTip) {
        const currentDistance = thumbTip.position.distanceTo(indexTip.position)
        
        if (lastPinchDistance.current > 0) {
          const scaleDelta = currentDistance / lastPinchDistance.current
          const newScale = Math.max(0.3, Math.min(3, scale * scaleDelta))
          setScale(newScale)
          onScaleChange(newScale)
        }
        
        lastPinchDistance.current = currentDistance
      }
    }
  }

  const handleSqueezeEnd = () => {
    lastPinchDistance.current = 0
  }

  return (
    <Interactive
      onHover={() => setHover(true)}
      onBlur={() => setHover(false)}
      onSelectStart={handleSelectStart}
      onSelectEnd={handleSelectEnd}
      onMove={handleMove}
      onSqueeze={handleSqueeze}
      onSqueezeEnd={handleSqueezeEnd}
    >
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        scale={[scale, scale, scale]}
        {...rest}
      >
        <planeGeometry args={[baseWidth, baseHeight]} />
        <meshStandardMaterial map={texture} transparent={true} />
      </mesh>
    </Interactive>
  )
}

function ControlPanel({ 
  position, 
  rotation, 
  scale,
  onPositionChange, 
  onRotationChange,
  onScaleChange,
  onReset
}: {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: number
  onPositionChange: (pos: { x: number; y: number; z: number }) => void
  onRotationChange: (rot: { x: number; y: number; z: number }) => void
  onScaleChange: (scale: number) => void
  onReset: () => void
}) {
  const [isMinimized, setIsMinimized] = useState(false)

  const handlePositionChange = (axis: "x" | "y" | "z", value: number) => {
    const newPosition = { ...position, [axis]: value }
    onPositionChange(newPosition)
  }

  const handleRotationChange = (axis: "x" | "y" | "z", value: number) => {
    const newRotation = { ...rotation, [axis]: (value * Math.PI) / 180 }
    onRotationChange(newRotation)
  }

  return (
    <div className="control-panel" style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 1000,
      width: isMinimized ? '40px' : '300px',
      transition: 'width 0.3s ease'
    }}>
      <button 
        onClick={() => setIsMinimized(!isMinimized)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          marginBottom: isMinimized ? '0' : '10px',
          fontSize: '18px'
        }}
      >
        {isMinimized ? '⚙️' : '⚙️'}
      </button>
      
      {!isMinimized && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Wall Art Controls</h3>
            <button 
              onClick={onReset}
              style={{
                background: '#444',
                border: 'none',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>

          <div className="control-section">
            <h4>Position</h4>
            <div className="slider-group">
              <label>X: {position.x.toFixed(2)}</label>
              <input
                type="range"
                min="-2" max="2" step="0.01"
                value={position.x}
                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
              />
            </div>
            <div className="slider-group">
              <label>Y: {position.y.toFixed(2)}</label>
              <input
                type="range"
                min="0.5" max="2.5" step="0.01"
                value={position.y}
                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="control-section">
            <h4>Rotation</h4>
            <div className="slider-group">
              <label>Angle: {(rotation.y * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-180" max="180" step="1"
                value={rotation.y * 180 / Math.PI}
                onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="control-section">
            <h4>Scale</h4>
            <div className="slider-group">
              <label>Size: {scale.toFixed(1)}x</label>
              <input
                type="range"
                min="0.3" max="3" step="0.1"
                value={scale}
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '10px' }}>
            Tip: Pinch with two fingers to scale in AR mode
          </div>
        </>
      )}
    </div>
  )
}

export function App() {
  const [position, setPosition] = useState({ x: 0, y: 1.5, z: -1.5 })
  const [rotation, setRotation] = useState({ x: 0, y: Math.PI, z: 0 })
  const [scale, setScale] = useState(1)
  const [isPlaced, setIsPlaced] = useState(false)
  const wallRef = useRef<any>(null)
  const { gl } = useThree() // Get the THREE instance from react-three-fiber

  const handleSessionStart = async (session: XRSession) => {
    session.addEventListener('select', async (event) => {
      if (!isPlaced && event.inputSource && event.inputSource.targetRaySpace) {
        try {
          const referenceSpace = await session.requestReferenceSpace('local')
          const pose = event.frame.getPose(event.inputSource.targetRaySpace, referenceSpace)
          
          if (pose && pose.transform) {
            const hitPosition = pose.transform.position
            const hitRotation = pose.transform.orientation
            
            // Use the THREE instance from react-three-fiber
            const euler = new THREE.Euler().setFromQuaternion(
              new THREE.Quaternion(hitRotation.x, hitRotation.y, hitRotation.z, hitRotation.w)
            )
            
            
            setPosition({ 
              x: hitPosition.x, 
              y: hitPosition.y, 
              z: hitPosition.z 
            })
            
            setRotation({ 
              x: 0, 
              y: euler.y + Math.PI,
              z: 0 
            })
            
            setIsPlaced(true)
          }
        } catch (error) {
          console.error('Error during AR session:', error)
        }
      }
    })
  }

  const resetArtwork = () => {
    setPosition({ x: 0, y: 1.5, z: -1.5 })
    setRotation({ x: 0, y: Math.PI, z: 0 })
    setScale(1)
    setIsPlaced(false)
  }

  return (
    <>
      <ARButton 
        sessionInit={{ 
          requiredFeatures: ['hit-test'], 
          optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'] 
        }}
      />
      <Canvas
              onCreated={({ gl }) => {
                if (gl.xr) {
                  gl.xr.addEventListener('sessionstart', () => {
                    const session = gl.xr.getSession()
                    if (session) {
                      handleSessionStart(session)
                    }
                  })
                }
              }}
  
      >
        <XR referenceSpace="local">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Controllers />
          {isPlaced && (
            <WallArt
              position={position}
              rotation={rotation}
              scale={scale}
              imageUrl="/wall-art.png"
              onPositionChange={setPosition}
              onRotationChange={setRotation}
              onScaleChange={setScale}
              ref={wallRef}
            />
          )}
        </XR>
      </Canvas>
      <ControlPanel
        position={position}
        rotation={rotation}
        scale={scale}
        onPositionChange={setPosition}
        onRotationChange={setRotation}
        onScaleChange={setScale}
        onReset={resetArtwork}
      />
    </>
  )
}