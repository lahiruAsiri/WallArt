import React, { useState, useRef, useEffect } from 'react';
import { Interactive, XR, ARButton, Controllers } from '@react-three/xr';
import { useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import './styles.css';

function WallArt({ position, rotation, imageUrl, onPositionChange, onRotationChange, ...rest }: any) {
  const [hover, setHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const texture = useTexture(imageUrl);
  const meshRef = useRef<any>(null);
  const lastControllerPos = useRef({ x: 0, y: 0, z: 0 });

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const width = 1;
  const height = width / aspect;

  const handleSelectStart = (event: any) => {
    setIsDragging(true);
    if (event.controller && event.controller.position) {
      lastControllerPos.current = {
        x: event.controller.position.x,
        y: event.controller.position.y,
        z: event.controller.position.z
      };
    }
  };

  const handleSelectEnd = () => {
    setIsDragging(false);
  };

  const handleMove = (event: any) => {
    if (isDragging && event.controller && event.controller.position) {
      const controllerPos = event.controller.position;
      const delta = {
        x: controllerPos.x - lastControllerPos.current.x,
        y: controllerPos.y - lastControllerPos.current.y,
        z: controllerPos.z - lastControllerPos.current.z
      };

      const newPosition = {
        x: position.x + delta.x * 0.5,
        y: position.y + delta.y * 0.5,
        z: position.z + delta.z * 0.5
      };
      onPositionChange(newPosition);

      const newRotation = {
        x: rotation.x + delta.y * 0.5,
        y: rotation.y + delta.x * 0.5,
        z: rotation.z
      };
      onRotationChange(newRotation);

      lastControllerPos.current = {
        x: controllerPos.x,
        y: controllerPos.y,
        z: controllerPos.z
      };
    }
  };

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
        scale={hover ? [1.1, 1.1, 1.1] : [1, 1, 1]}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        {...rest}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} transparent={true} />
      </mesh>
    </Interactive>
  );
}

function ControlPanel({ position, rotation, onPositionChange, onRotationChange }: any) {
  const [isMinimized, setIsMinimized] = useState(false);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = { ...position, [axis]: value };
    console.log('Slider Position Update:', newPosition); // Debug log
    onPositionChange(newPosition);
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation = { ...rotation, [axis]: (value * Math.PI) / 180 };
    console.log('Slider Rotation Update:', newRotation); // Debug log
    onRotationChange(newRotation);
  };

  return (
    <div className={`fixed bottom-4 left-4 ${isMinimized ? 'w-16' : 'w-64'} bg-gray-800 text-white p-4 rounded-lg shadow-lg transition-all duration-300 z-10`}>
      {isMinimized ? (
        <button
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded"
          onClick={() => setIsMinimized(false)}
        >
          +
        </button>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Controls</h3>
            <button
              className="py-1 px-2 bg-red-500 hover:bg-red-600 rounded"
              onClick={() => setIsMinimized(true)}
            >
              −
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm">Position X: {position.x.toFixed(2)}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={position.x}
                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Position Y: {position.y.toFixed(2)}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={position.y}
                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Position Z: {position.z.toFixed(2)}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={position.z}
                onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Rotation X: {((rotation.x * 180) / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={(rotation.x * 180) / Math.PI}
                onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Rotation Y: {((rotation.y * 180) / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={(rotation.y * 180) / Math.PI}
                onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Rotation Z: {((rotation.z * 180) / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={(rotation.z * 180) / Math.PI}
                onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function App() {
  const [position, setPosition] = useState({ x: 0, y: 0.5, z: -0.5 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    console.log('App State Updated - Position:', position, 'Rotation:', rotation);
  }, [position, rotation]);

  return (
    <>
      <ARButton />
      <Canvas>
        <XR referenceSpace="local">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <WallArt
            key={`${position.x}-${position.y}-${position.z}-${rotation.x}-${rotation.y}-${rotation.z}`}
            position={position}
            rotation={rotation}
            imageUrl="/wall-art.png"
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
    </>
  );
}