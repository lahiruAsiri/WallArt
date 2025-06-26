import React, { useState, useRef, useEffect } from 'react';
import { Interactive, XR, ARButton, Controllers, useController } from '@react-three/xr';
import { useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Type definitions
interface Position {
  x: number;
  y: number;
  z: number;
}

interface WallArtProps {
  position: Position;
  rotation: Position;
  imageUrl: string;
  onPositionChange: (position: Position) => void;
  onRotationChange: (rotation: Position) => void;
}

interface ControlPanelProps {
  position: Position;
  rotation: Position;
  onPositionChange: (position: Position) => void;
  onRotationChange: (rotation: Position) => void;
}

function WallArt({ position, rotation, imageUrl, onPositionChange, onRotationChange, ...rest }: WallArtProps) {
  const [hover, setHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const texture = useTexture(imageUrl);
  const meshRef = useRef(null);
  const dragStartPosition = useRef({ x: 0, y: 0, z: 0 });
  const artStartPosition = useRef({ x: 0, y: 0, z: 0 });
  
  // Get controller references
  const leftController = useController('left');
  const rightController = useController('right');

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const width = 1;
  const height = width / aspect;

  const handleSelectStart = (event: any) => {
    console.log('Select Start - Controller:', event.controller);
    setIsDragging(true);
    
    // Store initial positions
    if (event.controller?.position) {
      dragStartPosition.current = {
        x: event.controller.position.x,
        y: event.controller.position.y,
        z: event.controller.position.z
      };
      artStartPosition.current = {
        x: position.x,
        y: position.y,
        z: position.z
      };
      console.log('Drag start - Controller pos:', dragStartPosition.current, 'Art pos:', artStartPosition.current);
    }
  };

  const handleSelectEnd = () => {
    console.log('Select End');
    setIsDragging(false);
  };

  // Use useFrame to continuously check controller position during drag
  useFrame(() => {
    if (isDragging) {
      // Check both controllers to see which one is being used
      const activeController = leftController?.grip || rightController?.grip;
      
      if (activeController && activeController.position) {
        const currentPos = activeController.position;
        
        // Calculate delta from drag start position
        const deltaX = currentPos.x - dragStartPosition.current.x;
        const deltaY = currentPos.y - dragStartPosition.current.y;
        const deltaZ = currentPos.z - dragStartPosition.current.z;
        
        // Apply delta to original art position
        const newPosition = {
          x: artStartPosition.current.x + deltaX,
          y: artStartPosition.current.y + deltaY,
          z: artStartPosition.current.z + deltaZ
        };
        
        // Apply some rotation based on movement for visual feedback
        const newRotation = {
          x: rotation.x + deltaY * 0.2,
          y: rotation.y + deltaX * 0.2,
          z: rotation.z
        };
        
        console.log('Frame update - New position:', newPosition);
        onPositionChange(newPosition);
        onRotationChange(newRotation);
      }
    }
  });

  return (
    <Interactive
      onHover={() => {
        console.log('Hover start');
        setHover(true);
      }}
      onBlur={() => {
        console.log('Hover end');
        setHover(false);
      }}
      onSelectStart={handleSelectStart}
      onSelectEnd={handleSelectEnd}
    >
      <mesh
        ref={meshRef}
        scale={hover ? [1.1, 1.1, 1.1] : [1, 1, 1]}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        {...rest}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          map={texture} 
          transparent={true}
          color={hover ? '#ffcccc' : '#ffffff'}
        />
      </mesh>
    </Interactive>
  );
}

function ControlPanel({ position, rotation, onPositionChange, onRotationChange }: ControlPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = { ...position, [axis]: value };
    console.log('Slider Position Update:', newPosition);
    onPositionChange(newPosition);
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation = { ...rotation, [axis]: (value * Math.PI) / 180 };
    console.log('Slider Rotation Update:', newRotation);
    onRotationChange(newRotation);
  };

  return (
    <div className={`fixed bottom-4 left-4 ${isMinimized ? 'w-16' : 'w-80'} bg-gray-900 text-white p-4 rounded-lg shadow-xl transition-all duration-300 z-10 border border-gray-700`}>
      {isMinimized ? (
        <button
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          onClick={() => setIsMinimized(false)}
        >
          ⚙️
        </button>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-400">AR Controls</h3>
            <button
              className="py-1 px-3 bg-red-600 hover:bg-red-700 rounded transition-colors"
              onClick={() => setIsMinimized(true)}
            >
              ✕
            </button>
          </div>
          
          <div className="text-xs text-gray-400 mb-4 p-2 bg-gray-800 rounded">
            💡 Tip: Point at the wall art and hold trigger to drag it around in AR!
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-md font-medium text-green-400">Position</h4>
              <div>
                <label className="block text-sm text-gray-300">X: {position.x.toFixed(2)}</label>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={position.x}
                  onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Y: {position.y.toFixed(2)}</label>
                <input
                  type="range"
                  min="-2"
                  max="3"
                  step="0.1"
                  value={position.y}
                  onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Z: {position.z.toFixed(2)}</label>
                <input
                  type="range"
                  min="-3"
                  max="1"
                  step="0.1"
                  value={position.z}
                  onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-md font-medium text-yellow-400">Rotation</h4>
              <div>
                <label className="block text-sm text-gray-300">X: {((rotation.x * 180) / Math.PI).toFixed(0)}°</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={(rotation.x * 180) / Math.PI}
                  onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                  className="w-full accent-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Y: {((rotation.y * 180) / Math.PI).toFixed(0)}°</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={(rotation.y * 180) / Math.PI}
                  onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                  className="w-full accent-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Z: {((rotation.z * 180) / Math.PI).toFixed(0)}°</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={(rotation.z * 180) / Math.PI}
                  onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                  className="w-full accent-yellow-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                onClick={() => {
                  onPositionChange({ x: 0, y: 1.5, z: -1 });
                  onRotationChange({ x: 0, y: 0, z: 0 });
                  console.log('Reset Position and Rotation');
                }}
              >
                🔄 Reset
              </button>
              <button
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
                onClick={() => {
                  const randomX = (Math.random() - 0.5) * 4;
                  const randomY = Math.random() * 2 + 0.5;
                  const randomZ = -Math.random() * 2 - 0.5;
                  onPositionChange({ x: randomX, y: randomY, z: randomZ });
                  console.log('Random Position');
                }}
              >
                🎲 Random
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export  function App() {
  const [position, setPosition] = useState({ x: 0, y: 1.5, z: -1 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    console.log('App State Updated - Position:', position, 'Rotation:', rotation);
  }, [position, rotation]);

  // Create a placeholder image URL since we can't access external files
  const createPlaceholderImage = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      // Fallback if context creation fails
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#7C3AED');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AR Wall Art', 200, 120);
    ctx.font = '18px Arial';
    ctx.fillText('Drag me with your controller!', 200, 160);
    ctx.fillText('🎨 🖼️ ✨', 200, 200);
    
    return canvas.toDataURL();
  };

  return (
    <div className="w-full h-screen bg-black">
      <ARButton 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 20
        }}
      />
      <Canvas>
        <XR referenceSpace="local">
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />
          
          <WallArt
            position={position}
            rotation={rotation}
            imageUrl={createPlaceholderImage()}
            onPositionChange={setPosition}
            onRotationChange={setRotation}
          />
          <Controllers />
        </XR>
      </Canvas>
      
      <ControlPanel
        position={position}
        rotation={rotation}
        onPositionChange={setPosition}
        onRotationChange={setRotation}
      />
    </div>
  );
}