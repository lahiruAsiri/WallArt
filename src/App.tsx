import React, { Suspense, useState } from 'react';
import { Interactive, XR, ARButton, Controllers } from '@react-three/xr';
import { useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import './styles.css';

function WallArt({ position, imageUrl, ...rest }: any) {
  const [hover, setHover] = useState(false);
  const [color, setColor] = useState('white'); // Default color (no tint)
  const texture = useTexture(imageUrl); // Load the PNG texture

  const onSelect = () => {
    // Change tint color randomly on select
    setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
  };

  // Calculate aspect ratio to maintain image proportions
  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const width = 1; // Base width in meters
  const height = width / aspect;

  return (
    <Interactive onHover={() => setHover(true)} onBlur={() => setHover(false)} onSelect={onSelect}>
      <mesh scale={hover ? [1.1, 1.1, 1.1] : [1, 1, 1]} position={position} {...rest}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} color={color} transparent={true} />
      </mesh>
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
          <WallArt position={[0, 0.5, -0.5]} imageUrl="/wall-art.png" />
          <Controllers />
        </XR>
      </Canvas>
    </>
  );
}