import React, { Suspense, useState } from 'react';
import { Interactive, XR, ARButton, Controllers } from '@react-three/xr';
import { useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import './styles.css';

interface WallArtProps {
  initialPosition: [number, number, number];
  imageUrl: string;
}

function WallArt({ initialPosition, imageUrl }: WallArtProps) {
  const [hover, setHover] = useState(false);
  const [position, setPosition] = useState<Vector3>(new Vector3(...initialPosition));
  const [scale, setScale] = useState(1); // Base scale for resizing
  const texture = useTexture(imageUrl); // Load the image texture
  const woodTexture = useTexture('https://threejs.org/examples/textures/hardwood2_diffuse.jpg'); // Wood texture for frame

  // Calculate aspect ratio to maintain image proportions
  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const baseWidth = 1; // Base width in meters
  const baseHeight = baseWidth / aspect;
  const frameThickness = 0.05; // Thickness of the frame

  // Handle drag to reposition and pinch to resize
  const onMove = (event: any) => {
    const { intersection, controllers } = event;
    if (intersection) {
      // Update position based on controller intersection point
      setPosition(new Vector3(intersection.point.x, intersection.point.y, intersection.point.z - 0.01)); // Slightly offset to avoid z-fighting

      // Check for pinch gesture (using controller distance for simplicity)
      if (controllers?.length === 2) {
        const [controller1, controller2] = controllers;
        const distance = controller1.position.distanceTo(controller2.position);
        const newScale = Math.max(0.5, Math.min(2, scale * (1 + distance * 0.01))); // Scale between 0.5x and 2x
        setScale(newScale);
      }
    }
  };

  return (
    <Interactive onHover={() => setHover(true)} onBlur={() => setHover(false)} onMove={onMove}>
      <group position={position} scale={[scale, scale, scale]}>
        {/* Image plane */}
        <mesh>
          <planeGeometry args={[baseWidth, baseHeight]} />
          <meshStandardMaterial map={texture} transparent={true} />
        </mesh>
        {/* Frame (box geometry around the image) */}
        <mesh>
          <boxGeometry args={[baseWidth + frameThickness * 2, baseHeight + frameThickness * 2, frameThickness]} />
          <meshStandardMaterial map={woodTexture} color="#8B4513" /> {/* Brown wood color */}
        </mesh>
      </group>
    </Interactive>
  );
}

export function App() {
  return (
    <>
      <ARButton />
      <Canvas>
        <XR referenceSpace="local">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <WallArt initialPosition={[0, 0.5, -0.5]} imageUrl="/wall-art.png" />
          <Controllers />
        </XR>
      </Canvas>
    </>
  );
}
