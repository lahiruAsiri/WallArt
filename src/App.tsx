import React, { useState, useRef, useEffect } from 'react';
import { Interactive, XR, ARButton, Controllers, useXR } from '@react-three/xr';
import { useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import './styles.css';

function WallArt({ position, rotation, imageUrl, onPositionChange, onRotationChange }: {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  imageUrl: string;
  onPositionChange: (pos: { x: number; y: number; z: number }) => void;
  onRotationChange: (rot: { x: number; y: number; z: number }) => void;
}) {
  const [hover, setHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const texture = useTexture(imageUrl);
  const meshRef = useRef<any>(null);
  const lastControllerPos = useRef({ x: 0, y: 0, z: 0 });

  const { controllers } = useXR();

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const width = 1;
  const height = width / aspect;

  const handleSelectStart = () => {
    console.log('Select Start:', controllers); // Debug
    setIsDragging(true);
    if (controllers.length > 0 && controllers[0]?.grip) {
      lastControllerPos.current = {
        x: meshRef.current.position.x,
        y: meshRef.current.position.y,
        z: meshRef.current.position.z
      };
    }
  };

  const handleSelectEnd = () => {
    console.log('Select End'); // Debug
    setIsDragging(false);
  };

  const handleMove = () => {
    if (isDragging && controllers.length > 0 && controllers[0]?.grip) {
      console.log('Controller Move:', controllers[0].grip.position); // Debug
      const controllerPos = controllers[0].grip.position;
      const newPosition = {
        x: lastControllerPos.current.x + (controllerPos.x - lastControllerPos.current.x) * 0.5,
        y: lastControllerPos.current.y + (controllerPos.y - lastControllerPos.current.y) * 0.5,
        z: lastControllerPos.current.z + (controllerPos.z - lastControllerPos.current.z) * 0.5
      };
      onPositionChange(newPosition);
      lastControllerPos.current = controllerPos;
    } else if (isDragging) {
      console.warn('No controller data'); // Debug
    }
  };

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position.x, position.y, position.z);
      meshRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
      console.log('WallArt Mesh Updated - Position:', position, 'Rotation:', rotation); // Debug
    }
  }, [position, rotation]);

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
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} transparent={true} />
      </mesh>
    </Interactive>
  );
}

function LogPanel({ logs }: { logs: string[] }) {
  const [visible, setVisible] = useState(false);

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    console.log('Logs copied to clipboard'); // Debug
  };

  return (
    <div className={`fixed top-4 right-4 ${visible ? 'w-64' : 'w-16'} bg-gray-900 text-white p-4 rounded-lg shadow-lg transition-all duration-300 z-10`}>
      {visible ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Logs</h3>
            <button
              className="py-1 px-2 bg-red-500 hover:bg-red-600 rounded"
              onClick={() => setVisible(false)}
            >
              −
            </button>
          </div>
          <div className="h-32 overflow-y-auto text-sm">
            {logs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
          <button
            className="mt-2 w-full py-2 bg-blue-500 hover:bg-blue-600 rounded"
            onClick={copyLogs}
          >
            Copy Logs
          </button>
        </>
      ) : (
        <button
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded"
          onClick={() => setVisible(true)}
        >
          +
        </button>
      )}
    </div>
  );
}

function ControlPanel({ position, rotation, onPositionChange, onRotationChange }: {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  onPositionChange: (pos: { x: number; y: number; z: number }) => void;
  onRotationChange: (rot: { x: number; y: number; z: number }) => void;
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [localPosition, setLocalPosition] = useState(position);
  const [localRotation, setLocalRotation] = useState(rotation);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newPosition = { ...localPosition, [axis]: value };
    console.log('Slider Position Update:', newPosition); // Debug
    setLocalPosition(newPosition);
    onPositionChange(newPosition);
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newRotation = { ...localRotation, [axis]: (value * Math.PI) / 180 };
    console.log('Slider Rotation Update:', newRotation); // Debug
    setLocalRotation(newRotation);
    onRotationChange(newRotation);
  };

  useEffect(() => {
    setLocalPosition(position);
    setLocalRotation(rotation);
  }, [position, rotation]);

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
              <label className="block text-sm">Position X: {localPosition.x.toFixed(2)}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={localPosition.x}
                onChange={(e) => handlePositionChange('x', e)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Position Y: {localPosition.y.toFixed(2)}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={localPosition.y}
                onChange={(e) => handlePositionChange('y', e)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Position Z: {localPosition.z.toFixed(2)}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={localPosition.z}
                onChange={(e) => handlePositionChange('z', e)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Rotation X: {((localRotation.x * 180) / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={(localRotation.x * 180) / Math.PI}
                onChange={(e) => handleRotationChange('x', e)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Rotation Y: {((localRotation.y * 180) / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={(localRotation.y * 180) / Math.PI}
                onChange={(e) => handleRotationChange('y', e)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Rotation Z: {((localRotation.z * 180) / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={(localRotation.z * 180) / Math.PI}
                onChange={(e) => handleRotationChange('z', e)}
                className="w-full"
              />
            </div>
            <button
              className="mt-2 w-full py-2 bg-gray-500 hover:bg-gray-600 rounded"
              onClick={() => {
                const newPosition = { x: 0, y: 0.5, z: -0.5 };
                const newRotation = { x: 0, y: 0, z: 0 };
                setLocalPosition(newPosition);
                setLocalRotation(newRotation);
                onPositionChange(newPosition);
                onRotationChange(newRotation);
                console.log('Reset Position and Rotation:', newPosition, newRotation); // Debug
              }}
            >
              Reset
            </button>
            <button
              className="mt-2 w-full py-2 bg-green-500 hover:bg-green-600 rounded"
              onClick={() => {
                const newPosition = { ...localPosition, x: localPosition.x + 0.1 };
                setLocalPosition(newPosition);
                onPositionChange(newPosition);
                console.log('Test Move X +0.1:', newPosition); // Debug
              }}
            >
              Test Move X +0.1
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function App() {
  const [position, setPosition] = useState({ x: 0, y: 0.5, z: -0.5 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  // Override console.log to capture logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      setLogs((prev) => [...prev, args.join(' ')].slice(-50)); // Keep last 50 logs
      originalConsoleLog(...args);
    };
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      setLogs((prev) => [...prev, `WARN: ${args.join(' ')}`].slice(-50));
      originalConsoleWarn(...args);
    };
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
    };
  }, []);

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
      <LogPanel logs={logs} />
    </>
  );
}