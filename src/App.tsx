import { Suspense } from "react"
import { XR, ARButton, Controllers } from "@react-three/xr"
import { Html } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { WallArt } from "./components/WallArt"
import { ControlPanel } from "./components/ControlPanel"
import { PlacementReticle } from "./components/PlacementReticle"
import { WallArtProvider, useWallArt } from "./context/WallArtContext"
import "./styles.css"

function ARScene() {
  const { wallArtPlaced, wallArtPosition, setWallArtPosition, setWallArtPlaced } = useWallArt()

  const handlePlacement = (position: [number, number, number]) => {
    setWallArtPosition(position)
    setWallArtPlaced(true)
  }

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[2, 4, 2]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 2, 1]} intensity={0.5} />

      {!wallArtPlaced && <PlacementReticle onPlace={handlePlacement} />}

      {wallArtPlaced && <WallArt position={wallArtPosition} />}

      <Controllers />
    </>
  )
}

export function App() {
  return (
    <WallArtProvider>
      <div className="app-container">
        <ARButton
          className="ar-button"
          sessionInit={{
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.body },
          }}
        />

        <Canvas camera={{ position: [0, 1.6, 3], fov: 70 }} gl={{ antialias: true, alpha: true }} shadows>
          <XR referenceSpace="local">
            <Suspense fallback={<LoadingFallback />}>
              <ARScene />
            </Suspense>
          </XR>
        </Canvas>

        <ControlPanel />
      </div>
    </WallArtProvider>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading AR Experience...</p>
      </div>
    </Html>
  )
}
