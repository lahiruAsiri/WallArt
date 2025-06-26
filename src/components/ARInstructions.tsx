import { useWallArt } from "../context/WallArtContext"

export function ARInstructions() {
  const { wallArtPlaced } = useWallArt()

  if (wallArtPlaced) return null

  return (
    <div className="ar-instructions">
      <h3>🎯 AR Instructions</h3>
      <div className="instruction-steps">
        <div className="step">
          <span className="step-number">1</span>
          <p>Point your camera at a flat surface (floor, table, wall)</p>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <p>Move your device slowly to help detect the surface</p>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <p>
            Look for the <strong>blue circle</strong> to appear on the surface
          </p>
        </div>
        <div className="step">
          <span className="step-number">4</span>
          <p>Tap the circle to place your wall art</p>
        </div>
      </div>
      <div className="troubleshooting">
        <p>
          <strong>Circle Colors:</strong>
        </p>
        <ul>
          <li>
            <span className="color-indicator blue"></span> Blue = Real surface detected
          </li>
          <li>
            <span className="color-indicator yellow"></span> Yellow = Fallback mode (no hit testing)
          </li>
        </ul>
        <p>
          <strong>Not seeing the circle?</strong>
        </p>
        <ul>
          <li>Make sure you're pointing at a flat surface</li>
          <li>Try moving your device around slowly</li>
          <li>Ensure good lighting conditions</li>
          <li>Point at the floor or a table first</li>
          <li>If you see yellow circle, tap it to place anyway</li>
        </ul>
      </div>
    </div>
  )
}
