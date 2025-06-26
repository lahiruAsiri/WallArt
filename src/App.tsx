import React, { useState, useRef, useEffect } from 'react';
import { XR, ARButton, Controllers, useXR } from '@react-three/xr';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import './styles.css';

function WallArt({ position, rotation, onPositionChange, onRotationChange }: {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  onPositionChange: (pos: { x: number; y: number; z: number }) => void;
  onRotationChange: (rot: { x: number; y: number; z: number }) => void;
}) {
  const meshRef = useRef<any>(null);
  const { gl, camera, scene, invalidate } = useThree();
  const { session } = useXR();

  useEffect(() => {
    console.log('WebXR Session:', session ? 'Active' : 'Inactive'); // Debug
    console.log('Renderer Initialized:', !!gl, 'Canvas:', gl.domElement.width, gl.domElement.height); // Debug
    camera.position.set(0, 1.6, 0); // Default camera height (eye level)
  }, [session, gl, camera]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position.x, position.y, position.z);
      meshRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
      meshRef.current.updateMatrix();
      meshRef.current.updateMatrixWorld();
      meshRef.current.geometry.needsUpdate = true;
      meshRef.current.material.needsUpdate = true;
      gl.render(scene, camera); // Manual render
      invalidate();
      console.log(
        'WallArt Frame Update - Position:',
        JSON.stringify(position),
        'Rotation:',
        JSON.stringify(rotation)
      ); // Debug
      console.log(
        'Mesh Actual - Position:',
        JSON.stringify({
          x: meshRef.current.position.x,
          y: meshRef.current.position.y,
          z: meshRef.current.position.z
        }),
        'Rotation:',
        JSON.stringify({
          x: meshRef.current.rotation.x,
          y: meshRef.current.rotation.y,
          z: meshRef.current.rotation.z
        })
      ); // Debug
      console.log(
        'Camera Position:',
        JSON.stringify({
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        })
      ); // Debug
      console.log('Renderer Info:', JSON.stringify(gl.info.render)); // Debug
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      {/* Fallback grid to visualize scene */}
      <gridHelper args={[10, 10, 'gray', 'gray']} position={[0, 0, -1]} />
    </group>
  );
}

function LogPanel({ logs, setLogs }: { logs: string[]; setLogs: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [visible, setVisible] = useState(false);

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    console.log('Logs copied to clipboard');
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
          <button
            className="mt-2 w-full py-2 bg-gray-500 hover:bg-gray-600 rounded"
            onClick={() => setLogs([])}
          >
            Clear Logs
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
    console.log('Slider Position Update:', JSON.stringify(newPosition));
    setLocalPosition(newPosition);
    onPositionChange(newPosition);
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newRotation = { ...localRotation, [axis]: (value * Math.PI) / 180 };
    console.log('Slider Rotation Update:', JSON.stringify(newRotation));
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
              <input
                type="number"
                min="-2"
                max="2"
                step="0.1"
                value={localPosition.x}
                onChange={(e) => handlePositionChange('x', e)}
                className="w-full bg-gray-700 text-white"
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
                const newPosition = { x: 0, y: 0, z: -1 };
                const newRotation = { x: 0, y: 0, z: 0 };
                setLocalPosition(newPosition);
                setLocalRotation(newRotation);
                onPositionChange(newPosition);
                onRotationChange(newRotation);
                console.log('Reset Position and Rotation:', JSON.stringify(newPosition), JSON.stringify(newRotation));
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
                console.log('Test Move X +0.1:', JSON.stringify(newPosition));
              }}
            >
              Test Move X +0.1
            </button>
            <button
              className="mt-2 w-full py-2 bg-yellow-500 hover:bg-yellow-600 rounded"
              onClick={() => {
                const newPosition = { ...localPosition, z: localPosition.z - 0.1 };
                setLocalPosition(newPosition);
                onPositionChange(newPosition);
                console.log('Test Touch Move Z -0.1:', JSON.stringify(newPosition));
              }}
            >
              Test Touch Move
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function App() {
  const [position, setPosition] = useState({ x: 0, y: 0, z: -1 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      setLogs((prev) => [...prev, args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')].slice(-50));
      originalConsoleLog(...args);
    };
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      setLogs((prev) => [...prev, `WARN: ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}`].slice(-50));
      originalConsoleWarn(...args);
    };
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
    };
  }, []);

  useEffect(() => {
    console.log('App State Updated - Position:', position, 'Rotation:', rotation);
    // Check WebXR support
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        console.log('Immersive AR Supported:', supported);
      }).catch((err) => {
        console.warn('Immersive AR Error:', err.message);
      });
    } else {
      console.warn('WebXR Not Supported');
    }
  }, [position, rotation]);

  return (
    <>
      <ARButton
        sessionInit={{
          requiredFeatures: ['local'],
          optionalFeatures: ['local-floor', 'hit-test']
        }}
        onError={(err) => console.warn('AR Session Error:', err.message)}
      />
      <Canvas
        gl={{ antialias: true }}
        style={{ background: '#000000' }}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            e.preventDefault(); // Disable pinch zoom
            console.log('Pinch Gesture Detected'); // Debug
          }
        }}
      >
        <XR referenceSpace="local">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <WallArt
            position={position}
            rotation={rotation}
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
      <LogPanel logs={logs} setLogs={setLogs} />
    </>
  );
}